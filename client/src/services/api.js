import axios from 'axios';

// 1. Get Base Host (Clean URL without trailing slashes or duplicate /api)
const rawApiBase = import.meta.env.VITE_API_BASE_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000' 
    : (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
        ? ''
        : 'https://prime-show-tau.vercel.app'));

// Remove trailing slashes and remove existing /api if present to avoid /api/api duplication
const cleanBase = rawApiBase.replace(/\/+$/, '').replace(/\/api$/, '');

// Standardized single /api base
const API_BASE = `${cleanBase}/api`;

// 2. Create Axios Instance with extended 60s timeout for Render free tier cold-starts
const API = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 60 seconds to wait for Render free tier spin-up
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

// 3. Multi-Attempt Retry Middleware on Network Error / Timeout (Render Cold Start)
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // If config is missing, return rejection
    if (!config) {
      return Promise.reject(error);
    }

    config._retryCount = config._retryCount || 0;
    const maxRetries = 3;
    
    // Check if error is Network Error / Timeout / Cold-Start
    const isColdStartError = 
      !error.response || 
      error.code === 'ECONNABORTED' || 
      error.code === 'ERR_NETWORK' ||
      [502, 503, 504].includes(error.response?.status) ||
      (error.message && error.message.includes('Network Error'));

    if (isColdStartError && config._retryCount < maxRetries) {
      config._retryCount += 1;
      const delayMs = config._retryCount * 2500; // 2.5s, 5s, 7.5s backoff
      console.warn(`⚡ [Render Cold-Start] Network error detected. Attempt ${config._retryCount}/${maxRetries}. Retrying in ${delayMs/1000}s...`);
      
      await new Promise(resolve => setTimeout(resolve, delayMs));
      
      // Execute retry using API.request(config)
      return API.request(config);
    }
    
    return Promise.reject(error);
  }
);

export default API;
export { API, API as apiClient, API_BASE };