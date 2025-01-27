import { Editor } from "@monaco-editor/react"
import { useEditorStore } from "../store/editorStore"
import EditorContainer from "./EditorContainer"

const CEditor = () => {
  const { cContent, setCContent } = useEditorStore()

  return (
    <EditorContainer title="C Code" language="C">
      <div className="h-full w-full">
        <Editor
          height="100%"
          defaultLanguage="c"
          value={cContent}
          onChange={(value) => setCContent(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            padding: { top: 10 },
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            }
          }}
          className="custom-scrollbar"
        />
      </div>
    </EditorContainer>
  )
}

export default CEditor