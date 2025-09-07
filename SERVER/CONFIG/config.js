/**
 * Application configuration
 * Centralizes environment variable access with defaults
 */

require('dotenv').config();

const config = {
  // Server settings
  server: {
    port: process.env.PORT,
    env: process.env.NODE_ENV ,
    apiPrefix: process.env.API_PREFIX ,
    corsOrigin: process.env.CORS_ORIGIN || '*',
  },
  
  // Database settings
  db: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/jigyasa',
    debug: process.env.MONGODB_DEBUG === 'true',
  },
  
  // JWT Authentication
  jwt: {
    secret: process.env.JWT_SECRET || 'Its your choice',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Helper method to check if in production
  isProd: () => process.env.NODE_ENV === 'production',

  // Helper method to check if in development
  isDev: () => process.env.NODE_ENV === 'development',
};

module.exports = config;
