# Lakshya Online Survey Management System

Lakshya is a modern, full-stack application for creating and managing online surveys, collecting responses, and analyzing data with a beautiful, professional interface.

## Project Overview

Lakshya provides a comprehensive solution for survey management with:
- 🎨 Modern UI with mint, green, teal, and navy color palette
- 📊 Advanced data analysis and visualization
- 🔐 Secure authentication and organization management
- 📱 Responsive design for all devices
- ⚡ Fast and intuitive user experience

## Project Structure

The project consists of two main parts:

- `CLIENT`: React frontend built with Vite and Tailwind CSS
- `SERVER`: Node.js backend with Express and MongoDB

## Prerequisites

- Node.js v14+ and npm
- MongoDB v4+
- Git

## Setup Instructions

### Backend Setup (Node.js + Express + MongoDB)

1. Make sure MongoDB is installed and running on your system
2. Navigate to the server directory:
   ```
   cd SERVER
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file with the following variables:
   ```
   # Server Configuration
   PORT=8000
   NODE_ENV=development
   API_PREFIX="/api"
   CORS_ORIGIN="*"

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/jigyasa
   MONGODB_DEBUG=false

   # Authentication
   JWT_SECRET=jigyasa_secret_key_change_in_production
   JWT_EXPIRES_IN=1d
   JWT_REFRESH_EXPIRES_IN=7d

   # Security
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX=100

   # Logging
   LOG_LEVEL=debug

   # File Storage
   UPLOAD_DIR="uploads"
   MAX_FILE_SIZE=5242880
   ```
5. Seed the database with initial organizations:
   ```
   npm run seed:organizations
   ```
6. Start the server:
   ```
   npm run dev
   ```
   The server will run on http://localhost:8000

### Frontend Setup (React + Vite)

1. Navigate to the client directory:
   ```
   cd CLIENT
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
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
4. Start the development server:
   ```
   npm run dev
   ```
   The frontend will run on http://localhost:5173

## Deployment Guide

### Production Environment Variables

#### Client-side Production Environment

For production, update your `.env` file with:

```env
# API Configuration
VITE_BASE_URL="https://your-api-domain.com"
VITE_API_TIMEOUT="30000"

# Auth Configuration
VITE_AUTH_TOKEN_NAME="access_token"
VITE_REFRESH_TOKEN_NAME="refresh_token"

# Feature Flags
VITE_ENABLE_ANALYTICS="true"

# App Configuration
VITE_APP_NAME="Jigyasa Survey System"
```

#### Server-side Production Environment

For production, update your `.env` file with:

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

### Deployment Steps

#### Client Deployment

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

#### Server Deployment

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

### Important Notes

1. In production, always use a strong, unique `JWT_SECRET`
2. Set `CORS_ORIGIN` to restrict API access to your frontend domain
3. Consider using environment variable management tools like Doppler, AWS Parameter Store, or similar services for production

### Health Check

After deployment, verify the system is working by:

1. Accessing the frontend URL in a browser
2. Verifying API connectivity by logging in
3. Creating a test survey and submitting a response

### Troubleshooting

Common issues:

1. CORS errors: Check the `CORS_ORIGIN` setting in the server environment
2. Database connection failures: Verify `MONGODB_URI` and network connectivity
3. Authentication failures: Ensure `JWT_SECRET` matches between environments if transferring data

## Key Features

- User authentication with JWT
- Organization management
- Survey creation and management
- Survey response collection
- Data analysis with CSV uploads
- Visualization generation

## API Endpoints

The backend exposes the following main endpoints:

- `/api/auth/*` - Authentication endpoints
- `/api/organizations/*` - Organization management
- `/api/surveys/*` - Survey management
- `/api/survey-responses/*` - Survey responses
- `/api/data-analysis/*` - Data analysis and visualization
- `/api/api/surveys/:creatorId/:surveyId` - Public survey access

## Frontend Routes

- `/login` - User login
- `/register` - User registration
- `/dashboard` - Main dashboard
- `/dashboard/surveys` - List of surveys
- `/dashboard/surveys/new` - Create survey
- `/dashboard/surveys/:id` - View survey details
- `/dashboard/surveys/:id/edit` - Edit survey
- `/dashboard/surveys/:id/responses` - View survey responses
- `/surveys/:creatorId/:surveyId` - Respond to a survey
- `/dashboard/analyzer` - CSV upload and analysis tool
- `/dashboard/saved-analyses` - View saved analyses
- `/dashboard/analyses/:id/edit` - Edit saved analysis

## Technologies Used

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT Authentication
- Express Async Handler
- CORS

### Frontend
- React
- Vite
- Tailwind CSS
- Axios
- React Router
- Chart.js & Plotly.js for data visualization
- React-toastify for notifications

## License

MIT
