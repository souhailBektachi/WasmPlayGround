declare module '@wasmer/sdk/dist/WasmerSDKBundled' {
  export class Directory {
    writeFile(path: string, content: string | Uint8Array): Promise<void>;
    readFile(path: string): Promise<Uint8Array | null>;
  }

  export class Wasmer {
    static fromFile(data: Uint8Array): Promise<Wasmer>;
    entrypoint?: {
      run(options: {
        args: string[];
        mount: { [key: string]: Directory };
      }): Promise<{
        wait(): Promise<{ ok: boolean; stderr: string; }>;
      }>;
    };
  }

  export function init(): Promise<void>;
  export function initializeLogger(): void;
}
