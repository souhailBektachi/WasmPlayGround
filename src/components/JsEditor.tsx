import { Editor } from "@monaco-editor/react"
import { useEditorStore } from "../store/editorStore"
import EditorContainer from "./EditorContainer"

const JsEditor = () => {
  const { jsContent, setJsContent } = useEditorStore()

  return (
    <EditorContainer title="JavaScript" language="JS">
      <Editor
        height="100%"
        defaultLanguage="javascript"
        value={jsContent}
        onChange={(value) => setJsContent(value || '')}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          padding: { top: 10 },
        }}
      />
    </EditorContainer>
  )
}

export default JsEditor