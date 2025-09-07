/**
 * Authentication utility functions
 */

// Get environment variables with fallbacks
const AUTH_TOKEN_NAME = import.meta.env.VITE_AUTH_TOKEN_NAME || 'access_token';
const REFRESH_TOKEN_NAME = import.meta.env.VITE_REFRESH_TOKEN_NAME || 'refresh_token';

/**
 * Store authentication tokens in local storage
 */
export const storeAuthTokens = (accessToken, refreshToken) => {
  localStorage.setItem(AUTH_TOKEN_NAME, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_NAME, refreshToken);
  }
};

/**
 * Get access token from local storage
 */
export const getAccessToken = () => {
  return localStorage.getItem(AUTH_TOKEN_NAME);
};

/**
 * Get refresh token from local storage
 */
export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_NAME);
};

/**
 * Clear authentication tokens from local storage
 */
export const clearAuthTokens = () => {
  localStorage.removeItem(AUTH_TOKEN_NAME);
  localStorage.removeItem(REFRESH_TOKEN_NAME);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getAccessToken();
};

/**
 * Get authentication headers for API requests
 */
export const getAuthHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default {
  storeAuthTokens,
  getAccessToken,
  getRefreshToken,
  clearAuthTokens,
  isAuthenticated,
  getAuthHeaders
};
