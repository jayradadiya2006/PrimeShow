import axios from 'axios';

// 1. Live Render Base API URL Configuration
const rawApiBase = import.meta.env.VITE_API_BASE_URL || 'https://primeshow-api.onrender.com/api';

// Remove trailing slashes and normalize /api prefix
const cleanBase = rawApiBase.replace(/\/+$/, '').replace(/\/api$/, '');
const API_BASE = `${cleanBase}/api`;

// 2. Local Axios Instance
const API = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor to strip duplicate /api prefixes from relative endpoints
API.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith('/api/')) {
    config.url = config.url.replace(/^\/api/, '');
  }
  return config;
}, (error) => Promise.reject(error));

// 3. Response Interceptor for Localhost API Requests
API.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
export { API, API as apiClient, API_BASE };
