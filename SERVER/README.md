# Lakshya Online Survey Management System

This is the backend server for the Lakshya Online Survey Management System. It provides a robust API for managing surveys, collecting responses, and analyzing data.

## Features

- User authentication with JWT
- Organization management
- Survey creation and management
- Survey response collection
- Data analysis with CSV uploads
- Visualization generation

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/Lakshya
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=1d
   JWT_REFRESH_EXPIRES_IN=7d
   NODE_ENV=development
   ```
4. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Organizations

- `GET /api/organizations` - Get all organizations
- `GET /api/organizations/:id` - Get single organization
- `POST /api/organizations` - Create organization (admin only)
- `PUT /api/organizations/:id` - Update organization (admin only)
- `DELETE /api/organizations/:id` - Delete organization (admin only)

### Survey Management

- `POST /api/surveys` - Create new survey
- `GET /api/surveys` - Get all surveys for current user
- `GET /api/surveys/:id` - Get single survey
- `PUT /api/surveys/:id` - Update survey
- `DELETE /api/surveys/:id` - Delete survey
- `GET /api/surveys/:creatorId/:surveyId/public` - Get public survey
- `GET /api/surveys/organization-surveys` - Get surveys from user's organization

### Survey Responses

- `POST /api/survey-responses` - Submit survey response
- `GET /api/survey-responses?survey=:id` - Get responses for a survey
- `GET /api/survey-responses/:id` - Get single response

### Data Analysis

- `POST /api/data-analysis/csv-uploads` - Upload CSV file
- `POST /api/data-analysis/plot-data` - Generate plot data
- `POST /api/data-analysis/groupby` - Group data by columns
- `POST /api/data-analysis/analyses` - Save analysis
- `GET /api/data-analysis/analyses` - Get user's analyses
- `GET /api/data-analysis/analyses/:id` - Get single analysis
- `PUT /api/data-analysis/analyses/:id` - Update analysis
- `DELETE /api/data-analysis/analyses/:id` - Delete analysis

## License

MIT
