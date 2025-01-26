import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import CEditor from './components/CEditor';
import HtmlEditor from './components/htmlEditor';
import JsEditor from './components/JsEditor';
import Preview from './components/Preview';
import Tabs from './components/Tabs';
import { useState } from 'react';

function App() {
  const [activeLeftTab, setActiveLeftTab] = useState('c');
  const [activeRightTab, setActiveRightTab] = useState('html');

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#1e1e1e',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <header style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid #333',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#252526',
      }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem', color: '#0078d4' }}>WASM Playground</h1>
        <button style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#0078d4',
          border: 'none',
          borderRadius: '4px',
          color: 'white',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: 500,
        }}>
          Run Code
        </button>
      </header>

      <PanelGroup direction="horizontal" style={{ flex: 1 }}>
        <Panel defaultSizePercentage={50} style={{ display: 'flex', flexDirection: 'column' }}>
          <Tabs
            tabs={[
              { id: 'c', label: 'C' },
              { id: 'js', label: 'JavaScript' },
            ]}
            activeTab={activeLeftTab}
            onTabChange={setActiveLeftTab}
          />
          <div style={{ flex: 1, display: 'flex' }}>
            {activeLeftTab === 'c' && <CEditor />}
            {activeLeftTab === 'js' && <JsEditor />}
          </div>
        </Panel>

        <PanelResizeHandle style={{
          width: '4px',
          background: '#333',
          cursor: 'col-resize',
        }} />

        <Panel defaultSizePercentage={50} style={{ display: 'flex', flexDirection: 'column' }}>
          <Tabs
            tabs={[
              { id: 'html', label: 'HTML' },
              { id: 'preview', label: 'Preview' },
            ]}
            activeTab={activeRightTab}
            onTabChange={setActiveRightTab}
          />
          <div style={{ flex: 1, display: 'flex' }}>
            {activeRightTab === 'html' && <HtmlEditor />}
            {activeRightTab === 'preview' && <Preview />}
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default App;
