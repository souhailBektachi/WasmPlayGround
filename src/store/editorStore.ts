import { create } from 'zustand'

interface EditorStore {
  htmlContent: string
  jsContent: string
  cContent: string
  setHtmlContent: (content: string) => void
  setJsContent: (content: string) => void
  setCContent: (content: string) => void
  getCombinedContent: () => string
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  htmlContent: `<!DOCTYPE html>
<html>
  <body>
    <h1>WebAssembly Example</h1>
    <div>
      <input type="number" id="num1" value="5" /> +
      <input type="number" id="num2" value="3" />
      <button id="calculateBtn">Calculate</button>
    </div>
    <p>Result: <span id="result">?</span></p>
  </body>
</html>`,

  jsContent: `// WebAssembly module will be loaded by the playground
window.wasmInstance = window.parent.wasmInstance;
window.wasmMemory = window.parent.wasmMemory;
document.getElementById('calculateBtn').addEventListener('click', () => {
  if (!wasmInstance) {
    alert('WebAssembly not loaded yet!');
    return;
  }
  
  const num1 = parseInt(document.getElementById('num1').value);
  const num2 = parseInt(document.getElementById('num2').value);
  
  const result = wasmInstance.exports.add(num1, num2);
  document.getElementById('result').textContent = result;
});`,

  cContent: `// Simple add function
int add(int a, int b) {
    return a + b;
}`,

  setHtmlContent: (content) => set({ htmlContent: content }),
  setJsContent: (content) => set({ jsContent: content }),
  setCContent: (content) => set({ cContent: content }),
  getCombinedContent: () => {
    const state = get();
    const htmlWithoutClosingBody = state.htmlContent.split('</body>')[0] || state.htmlContent;
    return `
      ${htmlWithoutClosingBody || ''}
      <script>
        ${state.jsContent}
      </script>
      </body></html>
    `;
  }
}))
