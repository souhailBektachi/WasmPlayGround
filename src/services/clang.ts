
class ClangService {
    private static instance: ClangService;
    private worker: Worker;
    private isInitialized: boolean = false;
    private isDownloading: boolean = false;
    public onProgressUpdate?: (progress: number) => void;
    private messageCallbacks: Map<string, (result: any) => void> = new Map();

    private constructor() {
        this.worker = new Worker(new URL('../workers/clang.worker.ts', import.meta.url), { type: 'module' });
        this.worker.onmessage = this.handleWorkerMessage.bind(this);
    }

    static getInstance(): ClangService {
        if (!ClangService.instance) {
            ClangService.instance = new ClangService();
        }
        return ClangService.instance;
    }

    private handleWorkerMessage(event: MessageEvent) {
        const { type, status, messageId, wasm, error } = event.data;
        const callback = this.messageCallbacks.get(messageId);
        
        if (callback) {
            if (status === 'success') {
                if (type === 'init') this.isInitialized = true;
                callback({ success: true, data: wasm });
            } else {
                callback({ success: false, error });
            }
            this.messageCallbacks.delete(messageId);
        }
    }

    private async sendWorkerMessage(type: string, data: any = {}): Promise<any> {
        const messageId = Math.random().toString(36).substr(2, 9);
        
        return new Promise((resolve) => {
            this.messageCallbacks.set(messageId, resolve);
            this.worker.postMessage({ type, messageId, ...data });
        });
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
            this.onProgressUpdate?.(0);

            const progressInterval = setInterval(() => {
                const progress = Math.min(95, (Date.now() - startTime) / 50);
                this.onProgressUpdate?.(progress);
            }, 100);

            const startTime = Date.now();
            const result = await this.sendWorkerMessage('init');
            
            clearInterval(progressInterval);
            if (!result.success) throw new Error(result.error);
            
            this.onProgressUpdate?.(100);
        } catch (error) {
            this.onProgressUpdate?.(0);
            throw error;
        } finally {
            this.isDownloading = false;
        }
    }

    async compileC(code: string): Promise<WebAssembly.Instance> {
        const result = await this.sendWorkerMessage('compile', { code });
        if (!result.success) throw new Error(result.error);

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

        const wasmModule = await WebAssembly.instantiate(result.data, importObject);
        window.wasmMemory = memory;
        
        return wasmModule.instance;
    }
}

export default ClangService;