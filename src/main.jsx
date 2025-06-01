import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import '@fontsource/cairo/300.css';
import '@fontsource/cairo/400.css';
import '@fontsource/cairo/500.css';
import '@fontsource/cairo/700.css';
import './index.css';
import { getTableSchema } from './services/airtable.js';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Add error boundary for the entire app
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}>
          <h2>حدث خطأ في التطبيق</h2>
          <p>نعتذر عن هذا الخطأ. يرجى تحديث الصفحة وحاول مرة أخرى.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            تحديث الصفحة
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Verify Airtable connection on app startup
async function verifyAirtableConnection() {
  try {
    console.log('Verifying Airtable connection...');
    console.log('API Key:', import.meta.env.VITE_AIRTABLE_API_KEY ? 'exists' : 'missing');
    console.log('Base ID:', import.meta.env.VITE_AIRTABLE_BASE_ID ? 'exists' : 'missing');
    
    const schema = await getTableSchema();
    console.log('Airtable connection successful!');
    console.log('Tables available:', schema?.tables?.map?.(table => table?.name) || 'No tables found');
    return true;
  } catch (error) {
    console.error('Airtable connection failed:', error);
    // Don't block rendering if Airtable connection fails
    return false;
  }
}

// Initialize the app
async function initializeApp() {
  try {
    // Check if we're in development mode
    const isDev = import.meta.env.DEV;
    
    // Only verify Airtable connection in development or if explicitly enabled
    if (isDev || import.meta.env.VITE_VERIFY_AIRTABLE === 'true') {
      await verifyAirtableConnection();
    }

    // Render the app
    const root = ReactDOM.createRoot(document.getElementById('root'));
    
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );

    // Register service worker in production only
    if (process.env.NODE_ENV === 'production') {
      serviceWorkerRegistration.register({
        onUpdate: (registration) => {
          if (registration.waiting) {
            // The service worker has an update ready
            if (window.confirm('A new version is available! Refresh to update?')) {
              registration.waiting.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          }
        },
        onSuccess: (registration) => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        },
      });
    }
  } catch (error) {
    console.error('Failed to initialize app:', error);
    // Show error message to user
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div style="padding: 20px; text-align: center; direction: rtl; font-family: Cairo, sans-serif;">
          <h2>حدث خطأ في تحميل التطبيق</h2>
          <p>نعتذر عن هذا الخطأ. يرجى تحديث الصفحة وحاول مرة أخرى.</p>
          <button 
            onclick="window.location.reload()"
            style="
              padding: 10px 20px;
              font-size: 16px;
              background-color: #ff9800;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              margin-top: 10px;
            "
          >
            تحديث الصفحة
          </button>
        </div>
      `;
    }
  }
}

// Start the app
initializeApp();
