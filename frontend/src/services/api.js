import axios from 'axios';

// 1. Dynamic API Base URL Resolution
const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;

  // If deployed on Vercel (*.vercel.app), use relative /api for instant zero-latency serverless execution
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('vercel.app')) {
      return `${window.location.origin}/api`;
    }
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8000/api';
    }
  }

  // Use explicit environment variable if valid and not the old dead URL
  if (envUrl && envUrl.trim() && !envUrl.includes('primeshow-api.onrender.com')) {
    const clean = envUrl.trim().replace(/\/+$/, '').replace(/\/api$/, '');
    return clean ? `${clean}/api` : '/api';
  }

  return 'https://primeshow-d72h.onrender.com/api';
};

const API_BASE = getApiBase();

// 2. Axios Instance
const API = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
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

// 3. Response Interceptor with Automatic Failover
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // If request timed out or network failed on a remote domain and we have a local /api serverless endpoint
    if (
      (error.code === 'ECONNABORTED' || error.message?.includes('timeout') || !error.response) &&
      !originalRequest._retry &&
      typeof window !== 'undefined' &&
      window.location.origin &&
      originalRequest.baseURL &&
      !originalRequest.baseURL.startsWith(window.location.origin)
    ) {
      originalRequest._retry = true;
      originalRequest.baseURL = `${window.location.origin}/api`;
      return API(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default API;
export { API, API as apiClient, API_BASE };
