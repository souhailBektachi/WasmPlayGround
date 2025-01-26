import React from 'react'
import { Editor } from "@monaco-editor/react"
import { useEditorStore } from "../store/editorStore"
import EditorContainer from "./EditorContainer"

const CEditor = () => {
  const { cContent, setCContent } = useEditorStore()

  return (
    <EditorContainer title="C Code" language="C">
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
        }}
      />
    </EditorContainer>
  )
}

export default CEditor