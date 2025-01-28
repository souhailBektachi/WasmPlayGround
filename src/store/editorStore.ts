import { create } from 'zustand'

interface EditorStore {
  htmlContent: string
  jsContent: string
  cContent: string
  wasmInstance: WebAssembly.Instance | null
  setHtmlContent: (content: string) => void
  setJsContent: (content: string) => void
  setCContent: (content: string) => void
  setWasmInstance: (instance: WebAssembly.Instance | null) => void
  getCombinedContent: () => string
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  htmlContent: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; }
      .container { background: #f5f5f5; padding: 20px; border-radius: 8px; }
      .section { border-bottom: 1px solid #ddd; padding: 15px 0; }
      .input-group { margin: 10px 0; display: flex; align-items: center; gap: 10px; }
      label { min-width: 120px; }
      input { width: 80px; padding: 5px; border: 1px solid #ddd; border-radius: 4px; }
      button { 
        background: #4CAF50; color: white; 
        border: none; padding: 8px 16px; 
        border-radius: 4px; cursor: pointer; 
      }
      button:hover { background: #45a049; }
      .result { margin-top: 10px; padding: 10px; background: #fff; border-radius: 4px; }
      .error { color: #d32f2f; }
      .success { color: #388e3c; }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>WebAssembly Function Tests</h2>
      
      <div class="section">
        <h3>Basic Functions</h3>
        <div class="input-group">
          <label>Factorial:</label>
          <input type="number" id="factNum" value="5" min="0" max="10" />
          <button id="factorialBtn">Calculate</button>
          <span id="factResult">Result: ?</span>
        </div>

        <div class="input-group">
          <label>String Length:</label>
          <input type="text" id="strInput" value="Hello" style="width: 200px" />
          <button id="strLenBtn">Get Length</button>
          <span id="strResult">Length: ?</span>
        </div>
      </div>

      <div class="section">
        <h3>Memory Operations</h3>
        <div class="input-group">
          <label>Array Size:</label>
          <input type="number" id="arraySize" value="5" min="1" max="1000" />
          <button id="createArrayBtn">Create Array</button>
        </div>
        <div class="result" id="arrayResult">Array: Not created yet</div>

        <div class="input-group">
          <label>Sort Array:</label>
          <button id="sortArrayBtn">Sort Current Array</button>
        </div>
        <div class="result" id="sortResult">Sorted Array: No array to sort</div>
      </div>
    </div>
  </body>
</html>`,

  jsContent: `// Get WebAssembly instance from parent
window.wasmInstance = window.parent.wasmInstance;
window.wasmMemory = window.parent.wasmMemory;

// Helper to read int array from memory
function readIntArray(ptr, length) {
    if (!ptr) return null;
    const view = new Int32Array(wasmMemory.buffer, ptr, length);
    return Array.from(view);
}

// Helper to write string to memory
function writeString(str) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str + '\\0');
    const ptr = wasmInstance.exports.malloc(bytes.length);
    if (!ptr) return null;
    
    const view = new Uint8Array(wasmMemory.buffer);
    for (let i = 0; i < bytes.length; i++) {
        view[ptr + i] = bytes[i];
    }
    return ptr;
}

let currentArrayPtr = null;
let currentArraySize = 0;

// Test factorial
document.getElementById('factorialBtn').addEventListener('click', () => {
    if (!wasmInstance) {
        alert('WebAssembly not loaded yet!');
        return;
    }
    
    const num = parseInt(document.getElementById('factNum').value);
    const result = wasmInstance.exports.factorial(num);
    document.getElementById('factResult').textContent = \`Result: \${result}\`;
});

// Test string length
document.getElementById('strLenBtn').addEventListener('click', () => {
    if (!wasmInstance) {
        alert('WebAssembly not loaded yet!');
        return;
    }
    
    const str = document.getElementById('strInput').value;
    const ptr = writeString(str);
    if (!ptr) {
        alert('Failed to allocate memory for string');
        return;
    }
    
    const length = wasmInstance.exports.strLength(ptr);
    wasmInstance.exports.free(ptr);
    document.getElementById('strResult').textContent = \`Length: \${length}\`;
});

// Create random array
document.getElementById('createArrayBtn').addEventListener('click', () => {
    if (!wasmInstance) {
        alert('WebAssembly not loaded yet!');
        return;
    }
    
    const size = parseInt(document.getElementById('arraySize').value);
    if (currentArrayPtr) {
        wasmInstance.exports.free(currentArrayPtr);
    }
    
    currentArrayPtr = wasmInstance.exports.createRandomArray(size);
    currentArraySize = size;
    
    const array = readIntArray(currentArrayPtr, size);
    document.getElementById('arrayResult').textContent = 
        array ? \`Array: [\${array.join(', ')}]\` : 'Failed to create array';
});

// Sort array
document.getElementById('sortArrayBtn').addEventListener('click', () => {
    if (!wasmInstance || !currentArrayPtr) {
        alert('No array to sort!');
        return;
    }
    
    wasmInstance.exports.bubbleSort(currentArrayPtr, currentArraySize);
    const array = readIntArray(currentArrayPtr, currentArraySize);
    document.getElementById('sortResult').textContent = 
        array ? \`Sorted Array: [\${array.join(', ')}]\` : 'Sort failed';
});`,

  cContent: `// Basic factorial function
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

// String length function
int strLength(const char* str) {
    int len = 0;
    while (str[len]) len++;
    return len;
}

// Create array with random numbers
int* createRandomArray(int size) {
    if (size <= 0 || size > 1000) return 0;
    
    int* arr = (int*)malloc(size * sizeof(int));
    if (!arr) return 0;
    
    // Simple pseudo-random number generation
    unsigned int seed = 12345;
    for (int i = 0; i < size; i++) {
        seed = seed * 1103515245 + 12345;
        arr[i] = (seed >> 16) & 0x7FFF;
    }
    
    return arr;
}

// Bubble sort implementation
void bubbleSort(int* arr, int size) {
    if (!arr || size <= 0) return;
    
    for (int i = 0; i < size - 1; i++) {
        for (int j = 0; j < size - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}

// Test creating and initializing an array
int* testArray(int size) {
    if (size <= 0 || size > 1000) return 0;
    
    // Allocate array using malloc
    int* arr = (int*)malloc(size * sizeof(int));
    if (!arr) return 0;
    
    // Initialize array with increasing values
    for (int i = 0; i < size; i++) {
        arr[i] = i * 2;  // Multiply by 2 to make it more interesting
    }
    
    return arr;
}

// Test memory allocation and operations
int testMemoryAlloc(int size) {
    if (size <= 0 || size > 10000) return 0;
    
    // Allocate memory block
    void* ptr = malloc(size);
    if (!ptr) return 0;
    
    // Initialize memory with a pattern
    memset(ptr, 42, size);
    
    // Verify pattern
    unsigned char* check = (unsigned char*)ptr;
    for (int i = 0; i < size; i++) {
        if (check[i] != 42) {
            free(ptr);
            return 0;
        }
    }
    
    // Free memory and return success
    free(ptr);
    return 1;
}`,

  wasmInstance: null,
  setHtmlContent: (content) => set({ htmlContent: content }),
  setJsContent: (content) => set({ jsContent: content }),
  setCContent: (content) => set({ cContent: content }),
  setWasmInstance: (instance) => set({ wasmInstance: instance }),
  getCombinedContent: () => {
    const state = get();
    const htmlWithoutClosingBody = state.htmlContent.split('</body>')[0] || state.htmlContent;
    return `
      ${htmlWithoutClosingBody || ''}
      <script>
        window.wasmInstance = parent.wasmInstance;
        window.wasmMemory = parent.wasmMemory;
        ${state.jsContent}
      </script>
      </body></html>
    `;
  }
}))
