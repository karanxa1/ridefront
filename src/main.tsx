import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Global error handler to catch external errors
window.addEventListener('error', (event) => {
  // Ignore errors from external sources (browser extensions, etc.)
  if (event.filename && (
    event.filename.includes('extension://') ||
    event.filename.includes('chrome-extension://') ||
    event.filename.includes('moz-extension://') ||
    event.filename.includes('safari-extension://') ||
    event.filename.includes('edge-extension://')
  )) {
    event.preventDefault();
    return;
  }
  
  // Ignore specific external errors like 'recorder is not defined'
  if (event.message && (
    event.message.includes('recorder is not defined') ||
    event.message.includes('ReferenceError: recorder is not defined')
  )) {
    event.preventDefault();
    return;
  }
  
  // Log other errors for debugging
  console.error('Global error:', event.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

// Prevent external scripts from accessing undefined variables
if (typeof window !== 'undefined') {
  // Create a safe fallback for common external variables
  if (typeof (window as any).recorder === 'undefined') {
    (window as any).recorder = null;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
