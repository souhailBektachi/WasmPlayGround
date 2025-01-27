export interface WasmInstance {
  exports: {
    [key: string]: (...args: unknown[]) => unknown;
  };
}

interface Window {
  wasmInstance: WasmInstance;
  wasmMemory: WebAssembly.Memory;
  global: typeof globalThis;
}

declare global {
  interface Window {
    wasmInstance: WasmInstance;
    wasmMemory: WebAssembly.Memory;
    global: typeof globalThis;
  }
  var global: typeof globalThis;
}

export {};
