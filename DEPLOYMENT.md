# Jigyasa Deployment Guide

This guide explains how to properly deploy the Jigyasa Survey System, focusing on setting up environment variables and configuration.

## Prerequisites

- Node.js v14+ and npm
- MongoDB v4+
- Git

## Project Structure

The project consists of two main parts:

1. `CLIENT` - Frontend React application
2. `SERVER` - Backend Express API

## Environment Variables

### Client-side Environment Variables

Create a `.env` file in the `CLIENT` directory with the following variables:

```env
# API Configuration
VITE_BASE_URL="http://localhost:8000"
VITE_API_TIMEOUT="30000"

# Auth Configuration
VITE_AUTH_TOKEN_NAME="access_token"
VITE_REFRESH_TOKEN_NAME="refresh_token"

# Feature Flags
VITE_ENABLE_ANALYTICS="false"

# App Configuration
VITE_APP_NAME="Jigyasa Survey System"
```

For production, update:

```env
VITE_BASE_URL="https://your-api-domain.com"
VITE_ENABLE_ANALYTICS="true"
```

### Server-side Environment Variables

Create a `.env` file in the `SERVER` directory with the following variables:

```env
# Server Configuration
PORT=8000
NODE_ENV=production
API_PREFIX="/api"
CORS_ORIGIN="https://your-frontend-domain.com"

# Database Configuration
MONGODB_URI=mongodb://username:password@hostname:port/database
MONGODB_DEBUG=false

# Authentication
JWT_SECRET=your_strong_random_secret_here
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info

# File Storage
UPLOAD_DIR="uploads"
MAX_FILE_SIZE=5242880
```

## Deployment Steps

### Client Deployment

1. Set up environment variables as described above
2. Install dependencies:
   ```
   cd CLIENT
   npm install
   ```
3. Build the application:
   ```
   npm run build
   ```
4. Deploy the resulting `dist` directory to your web server or hosting service

### Server Deployment

1. Set up environment variables as described above
2. Install dependencies:
   ```
   cd SERVER
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```

## Important Notes

1. In production, always use a strong, unique `JWT_SECRET`
2. Set `CORS_ORIGIN` to restrict API access to your frontend domain
3. Consider using environment variable management tools like Doppler, AWS Parameter Store, or similar services for production

## Health Check

After deployment, verify the system is working by:

1. Accessing the frontend URL in a browser
2. Verifying API connectivity by logging in
3. Creating a test survey and submitting a response

## Troubleshooting

Common issues:

1. CORS errors: Check the `CORS_ORIGIN` setting in the server environment
2. Database connection failures: Verify `MONGODB_URI` and network connectivity
3. Authentication failures: Ensure `JWT_SECRET` matches between environments if transferring data
