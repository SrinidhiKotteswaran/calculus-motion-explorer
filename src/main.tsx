import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Keep the application bootstrap intentionally small; App owns the interactive UI.
const root = document.getElementById('root');

if (!root) {
  throw new Error('Motion Explorer could not find the root element.');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
