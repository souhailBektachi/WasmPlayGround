const Documentation = () => {
  return (
    <div className="h-full overflow-y-auto bg-[#1e1e1e] custom-scrollbar">
      <div className="p-4 text-gray-200">
        <div className="max-w-3xl mx-auto pb-8">
          <h2 className="mt-0 text-2xl font-semibold">WebAssembly Compilation Guide</h2>
          
          <h3 className="text-xl mt-6">Clang Command Explanation</h3>
          <pre className="bg-[#2d2d2d] p-4 rounded overflow-auto text-sm font-mono whitespace-pre-wrap break-words">
{`clang input.c -o output.wasm \\
  --target=wasm32 \\\t  # Target WebAssembly 32-bit
  -nostdlib \\\t           # Don't include standard library
  -Wl,--no-entry \\\t     # No entry point required
  -Wl,--export-all \\\t   # Export all functions
  -Wl,--allow-undefined \\\t # Allow undefined symbols
  -Wl,--import-memory \\\t # Use imported memory
  -Wl,--initial-memory=131072 \\\t # Initial memory (128KB)
  -Wl,--max-memory=2097152 \\\t    # Max memory (2MB)
  -Wl,--strip-all \\\t    # Remove unnecessary symbols
  -O3                   # Optimization level 3`}
          </pre>

          <h3 className="text-xl mt-6">WebAssembly Instantiation Explanation</h3>
          <div className="mb-4">
            <h4 className="font-semibold">1. Reading the WASM file</h4>
            <code className="bg-[#2d2d2d] p-2 rounded text-sm font-mono">
              const wasm = await project.readFile("example.wasm");
            </code>
            <p>Reads the compiled WebAssembly binary file.</p>

            <h4 className="font-semibold">2. Memory Configuration</h4>
            <pre className="bg-[#2d2d2d] p-4 rounded text-sm font-mono">
{`const memory = new WebAssembly.Memory({ 
    initial: 2,     // 128KB (2 pages of 64KB each)
    maximum: 32,    // 2MB maximum
    shared: true    // Enable shared memory
});`}
            </pre>
            <p>Creates a shared memory space for the WebAssembly module:</p>
            <ul>
              <li>Each page is 64KB</li>
              <li>Initial size: 2 pages = 128KB</li>
              <li>Maximum size: 32 pages = 2MB</li>
            </ul>

            <h4 className="font-semibold">3. Import Object</h4>
            <pre className="bg-[#2d2d2d] p-4 rounded text-sm font-mono">
{`const importObject = {
    env: {
        memory,
        abort: () => { throw new Error('abort'); }
    }
};`}
            </pre>
            <p>Provides the WebAssembly module with:</p>
            <ul>
              <li>Shared memory instance</li>
              <li>Required environment functions</li>
            </ul>

            <h4 className="font-semibold">4. Module Instantiation</h4>
            <code className="bg-[#2d2d2d] p-2 rounded text-sm font-mono">
              const wasmModule = await WebAssembly.instantiate(wasm, importObject);
            </code>
            <p>Creates a new WebAssembly instance with the provided memory and environment.</p>
          </div>

          <h3 className="text-xl mt-6">Local Development</h3>
          <p>To compile WebAssembly locally:</p>
          <ol className="list-decimal pl-6">
            <li>Install LLVM and Clang</li>
            <li>Create your C file (e.g., module.c)</li>
            <li>Run the clang command with the options shown above</li>
            <li>Use the resulting .wasm file in your web application</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
