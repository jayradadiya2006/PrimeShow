import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { App } from './App.jsx'
import './index.css'

const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const isValidClientId = rawClientId && 
  rawClientId !== 'your_google_client_id_here.apps.googleusercontent.com' && 
  !rawClientId.includes('primeshowdemo');

if (!isValidClientId) {
  console.warn(
    '[PrimeShow Auth Notice] Google Client ID is not configured yet in .env file. ' +
    'Please set VITE_GOOGLE_CLIENT_ID=<your-id>.apps.googleusercontent.com in client/.env. ' +
    'Demo account fallback authentication will be active.'
  );
}

const clientIdToPass = isValidClientId ? rawClientId : 'unconfigured_google_client_id.apps.googleusercontent.com';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientIdToPass}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
