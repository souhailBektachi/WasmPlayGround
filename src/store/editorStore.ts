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
  htmlContent: '<h1>Hello, World!</h1>',
  jsContent: '// JavaScript code here',
  cContent: '// C code here',
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
