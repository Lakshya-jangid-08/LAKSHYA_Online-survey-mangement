/**
 * API configuration and helper functions
 */
import axios from 'axios';
import { getAuthHeaders } from './auth';

// Get environment variables with fallbacks
const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10);

/**
 * Create axios instance with default config
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Add request interceptor to include auth token
 */
api.interceptors.request.use(
  (config) => {
    const headers = getAuthHeaders();
    if (headers.Authorization) {
      config.headers.Authorization = headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Get the API base URL
 */
export const getApiBaseUrl = () => API_BASE_URL;

/**
 * Helper function to build a full API URL
 */
export const buildApiUrl = (path) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
};

export default api;
