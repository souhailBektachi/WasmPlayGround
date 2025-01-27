import '../utils/globalFix';

type ErrorWithMessage = {
    message: string;
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as Record<string, unknown>).message === 'string'
    );
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
    if (isErrorWithMessage(maybeError)) return maybeError;
    
    try {
        return new Error(String(maybeError));
    } catch {
        return new Error('Unknown error');
    }
}

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

const storage = new WebCStorage();

async function downloadAndCacheWebC(): Promise<Uint8Array> {
    const response = await fetch(CLANG_WEBC_URL);
    if (!response.ok) {
        throw new Error(`Failed to download WASM file: ${response.status} ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    try {
        await storage.set(CLANG_CACHE_KEY, uint8Array);
        const verification = await storage.get(CLANG_CACHE_KEY);
        if (!verification || verification.length !== uint8Array.length) {
            throw new Error('Verification failed: stored data does not match');
        }
    } catch (error) {
        throw error;
    }
    
    return uint8Array;
}

async function getWebCData(): Promise<Uint8Array> {
    const cached = await storage.get(CLANG_CACHE_KEY);
    if (cached) return cached;
    return await downloadAndCacheWebC();
}

let wasmerModule: any = null;
let clang: any = null;
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

async function initializeWasmer(): Promise<void> {
    try {
        wasmerModule = await import("@wasmer/sdk");
        await wasmerModule.init();
        
        const webcData = await getWebCData();
        clang = await wasmerModule.Wasmer.fromFile(webcData);
        isInitialized = true;
    } catch (error) {
        wasmerModule = null;
        clang = null;
        isInitialized = false;
        throw error;
    }
}

async function downloadAndInitialize(messageId: string): Promise<void> {
    if (isInitialized && clang) {
        self.postMessage({ type: 'init', status: 'success', messageId });
        return;
    }

    try {
        if (!initializationPromise) {
            initializationPromise = initializeWasmer();
        }
        
        await initializationPromise;
        self.postMessage({ type: 'init', status: 'success', messageId });
    } catch (maybeError: unknown) {
        initializationPromise = null; 
        const error = toErrorWithMessage(maybeError);
        self.postMessage({ 
            type: 'init', 
            status: 'error', 
            error: error.message.includes('oneshot canceled') 
                ? 'Initialization interrupted. Please try again.' 
                : error.message,
            messageId 
        });
    }
}

async function compileC(code: string, messageId: string): Promise<void> {
    if (!clang || !isInitialized || !wasmerModule) {
        self.postMessage({ 
            type: 'compile', 
            status: 'error', 
            error: 'Service not initialized', 
            messageId 
        });
        return;
    }

    try {
        const project = new wasmerModule.Directory();
        await project.writeFile("wasm.c", code);

        const instance = await clang.entrypoint?.run({
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

        self.postMessage({ type: 'compile', status: 'success', wasm, messageId });
    } catch (maybeError: unknown) {
        const error = toErrorWithMessage(maybeError);
        self.postMessage({ 
            type: 'compile', 
            status: 'error', 
            error: error.message.includes('oneshot canceled')
                ? 'Compilation interrupted. Please try again.'
                : error.message,
            messageId 
        });
    }
}

self.onmessage = async (event) => {
    const { type, code, messageId } = event.data;
    
    switch (type) {
        case 'init':
            await downloadAndInitialize(messageId);
            break;
        case 'compile':
            if (!isInitialized) {
                self.postMessage({ type: 'compile', status: 'error', error: 'Service not initialized', messageId });
                return;
            }
            await compileC(code, messageId);
            break;
    }
};