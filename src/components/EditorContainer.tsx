import { ReactNode } from 'react';

interface EditorContainerProps {
  children: ReactNode;
  title?: string;
  language?: string;
}

const EditorContainer = ({ children, title, language }: EditorContainerProps) => {
  return (
    <div className="flex-1 bg-[#1e1e1e] overflow-hidden flex flex-col rounded-md shadow-md h-full min-h-0">
      {(title || language) && (
        <div className="px-4 py-2 bg-[#252525] border-b border-[#2d2d2d] flex items-center justify-between">
          {title && <span className="text-gray-200 font-medium">{title}</span>}
          {language && (
            <span className="text-gray-400 text-xs px-2 py-1 bg-[#1e1e1e] rounded font-mono">
              {language}
            </span>
          )}
        </div>
      )}
      <div className="flex-1 relative overflow-hidden flex flex-col min-h-0">
        {children}
      </div>
    </div>
  );
};

export default EditorContainer;
