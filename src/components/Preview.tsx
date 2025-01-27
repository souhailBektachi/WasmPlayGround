import { useEditorStore } from "../store/editorStore"
import EditorContainer from "./EditorContainer"

const Preview = () => {
  const { getCombinedContent } = useEditorStore()

  return (
    <EditorContainer title="Preview" language="Output">
      <div className="bg-white h-full overflow-auto">
        <iframe
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
