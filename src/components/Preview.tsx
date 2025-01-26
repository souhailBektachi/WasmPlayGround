import { useEditorStore } from "../store/editorStore"
import EditorContainer from "./EditorContainer"

const Preview = () => {
  const { getCombinedContent } = useEditorStore()

  return (
    <EditorContainer title="Preview" language="Output">
      <div style={{ 
        backgroundColor: 'white',
        height: '100%',
        overflow: 'auto'
      }}>
        <iframe
          srcDoc={getCombinedContent()}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="preview"
          sandbox="allow-scripts"
        />
      </div>
    </EditorContainer>
  )
}

export default Preview
