import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './src/context/ThemeContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { isNativePlatform } from './src/lib/platform';

// Service worker (PWA autoUpdate) chỉ có nghĩa trên web. Trên app native nó
// đua reload với banner cập nhật version → unregister để tránh double reload.
if (isNativePlatform() && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => {
      regs.forEach((reg) => {
        reg.unregister().catch(() => {});
      });
    })
    .catch(() => {});
}

// Lưới an toàn cuối: log lỗi toàn cục thay vì để WKWebView trắng màn im lặng
window.addEventListener('error', (event) => {
  console.error('[global] Uncaught error:', event.error ?? event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  console.error('[global] Unhandled rejection:', event.reason);
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
