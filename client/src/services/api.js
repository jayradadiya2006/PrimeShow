import axios from 'axios';

const rawApiBase = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://primeshow-backend.onrender.com/api');
const cleanBase = rawApiBase.replace(/\/+$/, '');
const API_BASE = cleanBase.endsWith('/api') ? cleanBase : `${cleanBase}/api`;

const API = axios.create({
  baseURL: API_BASE,
  timeout: 45000, // 45 seconds to handle Render Cold Start
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatic Retry Middleware on Network Error / Timeout
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config || config.__isRetry) {
      return Promise.reject(error);
    }
    
    // Retry once if Network Error / Timeout occurs
    if (
      !error.response || 
      error.code === 'ECONNABORTED' || 
      error.code === 'ERR_NETWORK' ||
      (error.message && error.message.includes('Network Error'))
    ) {
      config.__isRetry = true;
      console.log("Render cold-start detected. Retrying API request...");
      await new Promise(resolve => setTimeout(resolve, 3000)); // wait 3 seconds
      return API(config);
    }
    return Promise.reject(error);
  }
);

export default API;
export { API as apiClient, API_BASE };
