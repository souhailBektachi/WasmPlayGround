import { init, Wasmer, Directory } from "@wasmer/sdk";

class ClangService {
    private static instance: ClangService;
    private clang!: Wasmer;
    private isInitialized: boolean = false;
    private isDownloading: boolean = false;
    public onProgressUpdate?: (progress: number) => void;

    private constructor() { }

    static getInstance(): ClangService {
        if (!ClangService.instance) {
            ClangService.instance = new ClangService();
        }
        return ClangService.instance;
    }

    isReady(): boolean {
        return this.isInitialized;
    }

    isDownloadingPackage(): boolean {
        return this.isDownloading;
    }

    private async testConnectionSpeed(): Promise<'slow' | 'medium' | 'fast'> {
        const testUrl = 'https://registry-cdn.wasmer.io/packages/clang/clang/manifest.json';
        const startTime = performance.now();
        try {
            await fetch(testUrl);
            const duration = performance.now() - startTime;
            
            if (duration < 300) return 'fast';
            if (duration < 1000) return 'medium';
            return 'slow';
        } catch {
            return 'slow';
        }
    }

   

    async downloadAndInitialize(): Promise<void> {
        if (this.isInitialized || this.isDownloading) return;

        try {
            this.isDownloading = true;
            this.onProgressUpdate?.(0);

            const progressInterval = setInterval(() => {
                const progress = Math.min(95, (Date.now() - startTime) / 50);
                this.onProgressUpdate?.(progress);
            }, 100);

            const startTime = Date.now();
            await init();
            this.clang = await Wasmer.fromRegistry("clang/clang");
            
            clearInterval(progressInterval);
            this.isInitialized = true;
            this.onProgressUpdate?.(100);
        } catch (error) {
            this.onProgressUpdate?.(0);
            throw error;
        } finally {
            this.isDownloading = false;
        }
    }

    async compileC(code: string): Promise<WebAssembly.Instance> {
        const project = new Directory();
        await project.writeFile("wasm.c", code);

        const instance = await this.clang.entrypoint?.run({
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

        if (!instance) {
            throw new Error("Failed to create compilation instance");
        }

        const output = await instance.wait();
        if (!output?.ok) {
            throw new Error(`Compilation failed: ${output?.stderr}`);
        }

        const wasm = await project.readFile("example.wasm");
        if (!wasm) {
            throw new Error("No wasm file generated");
        }
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
    }
}

export default ClangService;