import { init, Wasmer, Directory } from "@wasmer/sdk";

// Add type for error messages
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

let clang: Wasmer | null = null;
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

async function initializeWasmer(): Promise<void> {
    try {
        await init();
        clang = await Wasmer.fromRegistry("clang/clang");
        isInitialized = true;
    } catch (error) {
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
        initializationPromise = null; // Reset for retry
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
    if (!clang || !isInitialized) {
        self.postMessage({ 
            type: 'compile', 
            status: 'error', 
            error: 'Service not initialized', 
            messageId 
        });
        return;
    }

    try {
        const project = new Directory();
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
