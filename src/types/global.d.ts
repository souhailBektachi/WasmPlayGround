interface WasmInstance {
  exports: {
    [key: string]: (...args: unknown[]) => unknown;
  };
}

interface Window {
  wasmInstance: WasmInstance;
  wasmMemory: WebAssembly.Memory;
}

declare global {
  interface Window {
    wasmInstance: WasmInstance;
    wasmMemory: WebAssembly.Memory;
  }
}
