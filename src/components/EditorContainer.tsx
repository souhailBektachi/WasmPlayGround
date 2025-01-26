import { ReactNode } from 'react';

interface EditorContainerProps {
  children: ReactNode;
  title?: string;
  language?: string;
}

const EditorContainer = ({ children, title, language }: EditorContainerProps) => {
  return (
    <div style={{
      flex: 1,
      backgroundColor: '#1e1e1e',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {(title || language) && (
        <div style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#252526',
          borderBottom: '1px solid #333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {title && <span style={{ color: '#fff' }}>{title}</span>}
          {language && (
            <span style={{
              color: '#666',
              fontSize: '0.8rem',
              padding: '0.2rem 0.5rem',
              backgroundColor: '#333',
              borderRadius: '3px',
            }}>
              {language}
            </span>
          )}
        </div>
      )}
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default EditorContainer;
