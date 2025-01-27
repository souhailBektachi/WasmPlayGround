import { useEditorStore } from "../store/editorStore"
import EditorContainer from "./EditorContainer"
import { useEffect, useState } from "react"

const Preview = () => {
  const { getCombinedContent, wasmInstance } = useEditorStore()
  const [key, setKey] = useState(0)

  useEffect(() => {
    setKey(prev => prev + 1)
  }, [wasmInstance])

  return (
    <EditorContainer title="Preview" language="Output">
      <div className="bg-white h-full overflow-auto">
        <iframe
          key={key}
          srcDoc={getCombinedContent()}
          className="w-full h-full border-none"
          title="preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </EditorContainer>
  )
}

export default Preview
