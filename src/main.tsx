import './utils/globalFix';

// Type-safe global assignment
if (typeof window !== 'undefined') {
  window.global = window as any;
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
