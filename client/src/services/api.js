import axios from 'axios';

// 1. Get Base Host (Clean URL without trailing slashes or duplicate /api)
const rawApiBase = import.meta.env.VITE_API_BASE_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://primeshow-backend.onrender.com');

// Remove trailing slashes and remove existing /api if present to avoid /api/api duplication
const cleanBase = rawApiBase.replace(/\/+$/, '').replace(/\/api$/, '');

// Standardized single /api base
const API_BASE = `${cleanBase}/api`;

// 2. Create Axios Instance
const API = axios.create({
  baseURL: API_BASE,
  timeout: 45000, // 45 seconds to handle Render Cold Start
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

// 3. Automatic Retry Middleware on Network Error / Timeout
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Stop if config is missing or already retried
    if (!config || config.__isRetry) {
      return Promise.reject(error);
    }
    
    // Retry once if Network Error / Timeout occurs (Render Cold Start)
    if (
      !error.response || 
      error.code === 'ECONNABORTED' || 
      error.code === 'ERR_NETWORK' ||
      (error.message && error.message.includes('Network Error'))
    ) {
      config.__isRetry = true;
      console.warn("⚡ [Render Cold-Start] Network timeout/error detected. Retrying request in 3s...");
      
      await new Promise(resolve => setTimeout(resolve, 3000)); // wait 3 seconds
      
      // Execute retry cleanly using API.request(config)
      return API.request(config);
    }
    
    return Promise.reject(error);
  }
);

export default API;
export { API, API as apiClient, API_BASE };