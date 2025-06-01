import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import '@fontsource/cairo/300.css';
import '@fontsource/cairo/400.css';
import '@fontsource/cairo/500.css';
import '@fontsource/cairo/700.css';
import './index.css';
import { getTableSchema } from './services/airtable.js';

// Verify Airtable connection on app startup
async function verifyAirtableConnection() {
  try {
    console.log('Verifying Airtable connection...');
    console.log('API Key:', import.meta.env.VITE_AIRTABLE_API_KEY ? 'exists' : 'missing');
    console.log('Base ID:', import.meta.env.VITE_AIRTABLE_BASE_ID ? 'exists' : 'missing');
    
    const schema = await getTableSchema();
    console.log('Airtable connection successful!');
    console.log('Tables available:', schema.tables.map(table => table.name));
    return true;
  } catch (error) {
    console.error('Airtable connection failed:', error);
    return false;
  }
}

// Call the verification function
verifyAirtableConnection().then(isConnected => {
  console.log('Airtable connection status:', isConnected ? 'Connected' : 'Failed');
});

// Register service worker for PWA functionality
import './registerSW';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
