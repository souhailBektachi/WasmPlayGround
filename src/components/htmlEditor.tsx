import { Editor } from "@monaco-editor/react"
import { useEditorStore } from "../store/editorStore"
import EditorContainer from "./EditorContainer"

const HtmlEditor = () => {
  const { htmlContent, setHtmlContent } = useEditorStore()

  return (
    <EditorContainer title="HTML" language="HTML">
      <Editor
        height="100%"
        defaultLanguage="html"
        value={htmlContent}
        onChange={(value) => setHtmlContent(value || '')}
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

export default HtmlEditor