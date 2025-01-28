const Documentation = () => {
  return (
    <div className="h-full overflow-y-auto bg-[#1e1e1e] custom-scrollbar">
      <div className="p-4 text-gray-200">
        <div className="max-w-3xl pb-8 mx-auto">
          <h2 className="mt-0 text-2xl font-semibold">WebAssembly Compilation Guide</h2>
          
          <h3 className="mt-6 text-xl">Clang Command Explanation</h3>
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

          <h3 className="mt-6 text-xl">WebAssembly Instantiation Explanation</h3>
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

          <h3 className="mt-6 text-xl">Local Development</h3>
          <p>To compile WebAssembly locally:</p>
          <ol className="pl-6 list-decimal">
            <li>Install LLVM and Clang</li>
            <li>Create your C file (e.g., module.c)</li>
            <li>Run the clang command with the options shown above</li>
            <li>Use the resulting .wasm file in your web application</li>
          </ol>

          <h3 className="mt-6 text-xl">libc Memory Management API</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-yellow-400">malloc</h4>
              <pre className="bg-[#2d2d2d] p-4 rounded text-sm font-mono">void* malloc(size_t size)</pre>
              <ul className="pl-6 mt-2 list-disc">
                <li>Allocates size bytes of memory</li>
                <li>Returns pointer to allocated memory or NULL if failed</li>
                <li>Memory is not initialized</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-yellow-400">calloc</h4>
              <pre className="bg-[#2d2d2d] p-4 rounded text-sm font-mono">void* calloc(size_t nmemb, size_t size)</pre>
              <ul className="pl-6 mt-2 list-disc">
                <li>Allocates memory for nmemb elements of size bytes each</li>
                <li>Memory is set to zero</li>
                <li>Returns NULL if allocation fails</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-yellow-400">free</h4>
              <pre className="bg-[#2d2d2d] p-4 rounded text-sm font-mono">void free(void* ptr)</pre>
              <ul className="pl-6 mt-2 list-disc">
                <li>Deallocates memory previously allocated by malloc/calloc</li>
                <li>ptr must be a pointer returned by malloc/calloc</li>
                <li>If ptr is NULL, no operation is performed</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-yellow-400">Memory Operations</h4>
              <pre className="bg-[#2d2d2d] p-4 rounded text-sm font-mono whitespace-pre">
{`void* memset(void* s, int c, size_t n)    // Fill memory with a constant byte
void* memcpy(void* dest, const void* src, size_t n)    // Copy memory area
int memcmp(const void* s1, const void* s2, size_t n)   // Compare memory areas`}
              </pre>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold text-yellow-400">Usage Example</h4>
              <pre className="bg-[#2d2d2d] p-4 rounded text-sm font-mono whitespace-pre">
{`// Allocate and initialize an array
int* array = (int*)malloc(5 * sizeof(int));
if (array) {
    // Initialize array
    for (int i = 0; i < 5; i++) {
        array[i] = i;
    }
    
    // Use memcpy to create a copy
    int* copy = (int*)malloc(5 * sizeof(int));
    if (copy) {
        memcpy(copy, array, 5 * sizeof(int));
        // ... use copy ...
        free(copy);
    }
    
    free(array);
}`}
              </pre>
            </div>

            <div className="p-4 mt-4 rounded bg-yellow-900/20">
              <h4 className="font-semibold text-yellow-400">Important Notes</h4>
              <ul className="pl-6 mt-2 list-disc">
                <li>Memory is limited to the WebAssembly instance's memory size</li>
                <li>Always check malloc/calloc return values for NULL</li>
                <li>Free memory when no longer needed to avoid leaks</li>
                <li>Don't free the same memory twice</li>
                <li>Don't use memory after freeing it</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
