import { init, Wasmer, Directory } from "@wasmer/sdk";


const CLANG_WEBC_URL = 'https://cdn.wasmer.io/webcimages/c127b7bfc0041d02c94045f40be7fb4b3eeb98cede25fad96261b7b90a82f405.webc';
const CLANG_CACHE_KEY = 'clang-webc-cache';
const DB_NAME = 'WasmCache';
const STORE_NAME = 'webcs';

class WebCStorage {
    private db: IDBDatabase | null = null;

    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };
        });
    }

    async get(key: string): Promise<Uint8Array | null> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(key);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async set(key: string, value: Uint8Array): Promise<void> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(value, key);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
        });
    }
}

class ClangService {
    private static instance: ClangService;
    private isInitialized: boolean = false;
    private isDownloading: boolean = false;
    public onProgressUpdate?: (progress: number) => void;
    private storage: WebCStorage;
    private wasmer: Wasmer | null = null;
    private maxRetries = 3;

    private constructor() {
        this.storage = new WebCStorage();
    }

    static getInstance(): ClangService {
        if (!ClangService.instance) {
            ClangService.instance = new ClangService();
        }
        return ClangService.instance;
    }

    private async downloadAndCacheWebC(): Promise<Uint8Array> {
        const response = await fetch(CLANG_WEBC_URL);
        if (!response.ok) {
            throw new Error(`Failed to download WASM file: ${response.status} ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        try {
            await this.storage.set(CLANG_CACHE_KEY, uint8Array);
            const verification = await this.storage.get(CLANG_CACHE_KEY);
            if (!verification || verification.length !== uint8Array.length) {
                throw new Error('Verification failed: stored data does not match');
            }
        } catch (error) {
            throw error;
        }
        
        return uint8Array;
    }

    private async getWebCData(): Promise<Uint8Array> {
        const cached = await this.storage.get(CLANG_CACHE_KEY);
        if (cached) return cached;
        return await this.downloadAndCacheWebC();
    }

    isReady(): boolean {
        return this.isInitialized;
    }

    isDownloadingPackage(): boolean {
        return this.isDownloading;
    }

    async downloadAndInitialize(): Promise<void> {
        if (this.isInitialized || this.isDownloading) return;

        let retries = 0;
        while (retries < this.maxRetries) {
            try {
                this.isDownloading = true;
                this.onProgressUpdate?.(0);

                const startTime = Date.now();
                const progressInterval = setInterval(() => {
                    const progress = Math.min(95, (Date.now() - startTime) / 50);
                    this.onProgressUpdate?.(progress);
                }, 100);

                await init();
                const webcData = await this.getWebCData();
                this.wasmer = await Wasmer.fromFile(webcData);
                this.isInitialized = true;

                clearInterval(progressInterval);
                this.onProgressUpdate?.(100);
                return;
            } catch (error) {
                retries++;
                if (retries === this.maxRetries) {
                    this.onProgressUpdate?.(0);
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            } finally {
                if (retries === this.maxRetries) {
                    this.isDownloading = false;
                }
            }
        }
    }

    async compileC(code: string): Promise<WebAssembly.Instance> {
        if (!this.wasmer || !this.isInitialized) {
            throw new Error('Service not initialized');
        }

        try {
            const project = new Directory();
            await project.writeFile("wasm.c", code);

            const instance = await this.wasmer.entrypoint?.run({
                args: [
                    "project/wasm.c",
                    "-o", "project/example.wasm",
                    "--target=wasm32",
                    "-nostdlib",
                    "-Wl,--no-entry",
                    "-Wl,--export-all",
                    "-Wl,--allow-undefined",
                    "-Wl,--import-memory",
                    "-Wl,--initial-memory=131072",
                    "-Wl,--max-memory=2097152",
                    "-Wl,--strip-all",
                    "-O3"
                ],
                mount: { "/project": project }
            });

            if (!instance) throw new Error("Failed to create compilation instance");

            const output = await instance.wait();
            if (!output?.ok) throw new Error(`Compilation failed: ${output?.stderr}`);

            const wasm = await project.readFile("example.wasm");
            if (!wasm) throw new Error("No wasm file generated");

            const memory = new WebAssembly.Memory({ 
                initial: 2,
                maximum: 32,
                shared: true
            });

            const importObject = {
                env: {
                    memory,
                    abort: () => { throw new Error('abort'); }
                }
            };

            const wasmModule = await WebAssembly.instantiate(wasm, importObject);
            window.wasmMemory = memory;
            
            return wasmModule.instance;
        } catch (error) {
            throw error instanceof Error ? error : new Error(String(error));
        }
    }
}

export default ClangService;