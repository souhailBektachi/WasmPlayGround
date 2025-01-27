import { init, Wasmer, Directory } from "@wasmer/sdk";

class ClangService {
    private static instance: ClangService;
    private clang!: Wasmer;
    private isInitialized: boolean = false;
    private isDownloading: boolean = false;

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

    async downloadAndInitialize(): Promise<void> {
        if (this.isInitialized || this.isDownloading) return;

        try {
            this.isDownloading = true;
            await init();
            this.clang = await Wasmer.fromRegistry("clang/clang");
            this.isInitialized = true;
        } finally {
            this.isDownloading = false;
        }
    }

    async compileC(code: string): Promise<WebAssembly.Instance> {
        if (!this.isInitialized) {
            throw new Error("ClangService not initialized");
        }

        try {
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
                    "-Wl,--initial-memory=131072",    // Increased to 128KB
                    "-Wl,--max-memory=2097152",       // Max 2MB
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
        } catch (error) {
            console.error("Compilation error:", error);
            throw error;
        }
    }
}

export default ClangService;