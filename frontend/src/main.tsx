import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { validateEnvOrThrow } from './utils/validateEnv';

// Validate environment variables before starting the app
try {
  validateEnvOrThrow();
} catch (error) {
  console.error('Failed to start application:', error);
  // Show a user-friendly error message
  document.getElementById('root')!.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
      background-color: #f9fafb;
      font-family: system-ui, -apple-system, sans-serif;
    ">
      <div style="
        max-width: 600px;
        background: white;
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      ">
        <h1 style="color: #dc2626; margin-bottom: 16px; font-size: 24px;">
          ⚠️ Configuration Error
        </h1>
        <p style="color: #4b5563; margin-bottom: 24px; line-height: 1.6;">
          The application could not start due to missing or invalid configuration.
        </p>
        <div style="
          background: #fef2f2;
          border: 1px solid #fecaca;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
        ">
          <p style="color: #991b1b; margin: 0; font-size: 14px;">
            ${error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
        <div style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          <p style="margin-bottom: 12px;"><strong>To fix this:</strong></p>
          <ol style="margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Copy <code>env.example</code> to <code>.env</code></li>
            <li style="margin-bottom: 8px;">Update the <code>.env</code> file with your actual credentials</li>
            <li style="margin-bottom: 8px;">Restart the development server</li>
          </ol>
          <p style="margin-top: 16px;">
            Check the browser console for detailed information.
          </p>
        </div>
      </div>
    </div>
  `;
  throw error;
}

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  // Ignore errors from browser extensions
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

  // Ignore specific external errors
  if (event.message && (
    event.message.includes('recorder is not defined') ||
    event.message.includes('ResizeObserver loop') ||
    event.message.includes('webkitAudioContext') ||
    event.message.includes('AudioContext') ||
    event.message.includes('MediaRecorder') ||
    event.message.includes('getUserMedia')
  )) {
    event.preventDefault();
    return;
  }

  // Log other errors for debugging
  if (import.meta.env.DEV) {
    console.error('Uncaught error:', event.error);
  }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  if (import.meta.env.DEV) {
    console.error('Unhandled promise rejection:', event.reason);
  }
  event.preventDefault();
});

// Prevent external scripts from accessing undefined variables
if (typeof window !== 'undefined') {
  // Create safe fallbacks for common external variables
  if (typeof (window as any).recorder === 'undefined') {
    (window as any).recorder = {
      start: () => Promise.resolve(),
      stop: () => Promise.resolve(),
      pause: () => Promise.resolve(),
      resume: () => Promise.resolve(),
      isRecording: false,
      ondataavailable: null,
      onstart: null,
      onstop: null,
      onpause: null,
      onresume: null,
      onerror: null
    };
  }
  
  // Add other common external variables that might be undefined
  if (typeof (window as any).webkitAudioContext === 'undefined') {
    (window as any).webkitAudioContext = null;
  }
  
  if (typeof (window as any).AudioContext === 'undefined') {
    (window as any).AudioContext = null;
  }
  
  // Add MediaRecorder fallback
  if (typeof (window as any).MediaRecorder === 'undefined') {
    (window as any).MediaRecorder = class MockMediaRecorder {
      constructor() {}
      start() {}
      stop() {}
      pause() {}
      resume() {}
      requestData() {}
    };
  }
  
  // Add getUserMedia fallback
  if (typeof navigator !== 'undefined' && typeof navigator.mediaDevices === 'undefined') {
    (navigator as any).mediaDevices = {
      getUserMedia: () => Promise.reject(new Error('getUserMedia not supported')),
      enumerateDevices: () => Promise.resolve([])
    };
  }
}

// Log environment info in development
if (import.meta.env.DEV) {
  console.log('🚀 Starting RideFront application');
  console.log('📦 Environment:', import.meta.env.MODE);
  console.log('🔧 API URL:', import.meta.env.VITE_API_BASE_URL);
}

// Render the application
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
