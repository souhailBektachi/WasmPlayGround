import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useState } from 'react';
import ClangService from './services/clang';
import { useEditorStore } from './store/editorStore';

import CEditor from './components/CEditor';
import HtmlEditor from './components/htmlEditor';
import JsEditor from './components/JsEditor';
import Preview from './components/Preview';
import Tabs from './components/Tabs';
import PackageDownloader from './components/PackageDownloader';
import Documentation from './components/Documentation';

function App() {
  const [activeLeftTab, setActiveLeftTab] = useState('c');
  const [activeRightTab, setActiveRightTab] = useState('html');
  const [isCompiling, setIsCompiling] = useState(false);
  const { cContent } = useEditorStore();

  const handleRunCode = async () => {
    const clang = ClangService.getInstance();

    if (!clang.isReady()) {
      alert('Please download Clang package first');
      return;
    }

    try {
      setIsCompiling(true);
      const wasmInstance = await clang.compileC(cContent);
      
      window.wasmInstance = wasmInstance as unknown as WasmInstance;
      setActiveRightTab('preview');
    } catch (error) {
      console.error('Compilation failed:', error);
      alert('Failed to compile: ' + error);
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-b from-[#1a1a1a] to-[#1e1e1e] flex flex-col overflow-hidden">
      <header className="px-6 py-3 border-b border-[#2d2d2d] bg-gradient-to-r from-[#1a1a1a] via-[#252525] to-[#1a1a1a] shadow-xl relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="max-w-7xl mx-auto flex items-center justify-between relative">
          <div className="flex items-center space-x-4 animate-fade-in">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                WASM Playground
              </h1>
            </div>
            <div className="h-6 w-px bg-gradient-to-b from-transparent via-[#2d2d2d] to-transparent mx-2" />
            <span className="text-gray-400 text-sm">WebAssembly IDE</span>
          </div>
          
          <div className="flex items-center gap-4">
            <PackageDownloader />
            <div className="group relative">
              <button
                onClick={handleRunCode}
                disabled={isCompiling}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium text-white
                  transition-all duration-300 transform hover:scale-105
                  shadow-lg hover:shadow-blue-500/20 relative
                  overflow-hidden
                  ${isCompiling 
                    ? 'bg-gray-600 cursor-default' 
                    : 'bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 hover:via-blue-400 hover:to-blue-500 cursor-pointer'
                  }
                `}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform translate-x-[-200%] animate-shimmer" />
                <div className="flex items-center gap-2">
                  {isCompiling ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Compiling...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Compile & Run</span>
                    </>
                  )}
                </div>
              </button>
              <div className="absolute bottom-full mb-2 hidden group-hover:block transition-opacity duration-200">
                <div className="bg-gray-800 text-xs text-gray-200 px-2 py-1 rounded shadow-lg">
                  {isCompiling ? 'Compiling your code...' : 'Compile and run your code'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <PanelGroup direction="horizontal" className="flex-1 min-h-0">
        <Panel defaultSizePercentage={50} className="flex flex-col overflow-hidden h-full">
          <Tabs
            tabs={[
              { id: 'c', label: 'C' },
              { id: 'js', label: 'JavaScript' },
              { id: 'docs', label: 'Documentation' },
            ]}
            activeTab={activeLeftTab}
            onTabChange={setActiveLeftTab}
          />
          <div className="flex-1 overflow-hidden">
            {activeLeftTab === 'c' && <CEditor />}
            {activeLeftTab === 'js' && <JsEditor />}
            {activeLeftTab === 'docs' && <Documentation />}
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-[#2d2d2d] cursor-col-resize" />

        <Panel defaultSizePercentage={50} className="flex flex-col min-h-0 overflow-hidden">
          <Tabs
            tabs={[
              { id: 'html', label: 'HTML' },
              { id: 'preview', label: 'Preview' },
            ]}
            activeTab={activeRightTab}
            onTabChange={setActiveRightTab}
          />
          <div className="flex-1 flex">
            {activeRightTab === 'html' && <HtmlEditor />}
            {activeRightTab === 'preview' && <Preview />}
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default App;
