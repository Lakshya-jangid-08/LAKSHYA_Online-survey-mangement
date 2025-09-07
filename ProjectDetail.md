# Lakshya Online Survey Management System Documentation

## Project Structure Overview

The backend is built with Django and Django REST Framework, organized into multiple apps:

- **Lakshya**: Core application handling user authentication, surveys, and responses
- **survey_analyzer**: Application for data analysis, CSV uploads, and visualization
- **Lakshya_backend**: Main project settings and URL configuration

The frontend is built with React, Vite, and Tailwind CSS.

## Frontend-Backend Interaction

The frontend communicates with the backend using Axios HTTP requests. The base URL is configured in the environment variables:

```javascript
// Example: ${import.meta.env.VITE_BASE_URL}/api/auth/login/
```

Authentication tokens are stored in localStorage and included in request headers:

```javascript
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
  'Content-Type': 'application/json'
};
```

## Routes & Endpoints

### Main URL Configuration (`Lakshya_backend/urls.py`)

| Endpoint | Description |
|----------|-------------|
| `/admin/` | Django admin interface |
| `/api/` | All survey and user-related APIs (includes Lakshya.urls) |
| `/survey-analyzer/` | All data analysis APIs (includes survey_analyzer.urls) |

### Authentication & User Management (`/api/auth/`)

| Endpoint | Method | Description | Permissions | Request Body | Response |
|----------|--------|-------------|-------------|--------------|----------|
| `/api/auth/register/` | POST | Register new user | Public | `{email, username, password, password2, organization_id}` | User data with tokens |
| `/api/auth/login/` | POST | User login | Public | `{email, password}` | Access & refresh tokens |
| `/api/auth/refresh/` | POST | Refresh JWT token | Public | `{refresh}` | New access token |
| `/api/auth/profile/` | GET/PUT | Get or update profile | Authenticated | Profile data | User profile data |

### Survey Management

| Endpoint | Method | Description | Permissions | Request Body | Response |
|----------|--------|-------------|-------------|--------------|----------|
| `/api/create-survey/` | POST | Create a new survey | Authenticated | Survey data with questions | Created survey data |
| `/api/surveys/<id>/` | GET/PUT/DELETE | Manage single survey | Authenticated (owner) | Survey data | Survey details |
| `/api/surveys/` | GET | List user's surveys | Authenticated | None | Array of surveys |
| `/api/surveys/<id>/public/` | GET | Get public survey | Anyone | None | Survey with questions |
| `/api/api/surveys/<creator_id>/<survey_id>/` | GET | Get survey details | Public | None | Survey with questions/choices |
| `/api/api/organization-surveys/` | GET | Get org surveys | Authenticated | None | Array of surveys |

### Survey Responses

| Endpoint | Method | Description | Permissions | Request Body | Response |
|----------|--------|-------------|-------------|--------------|----------|
| `/api/survey-responses/` | POST | Submit survey response | Mixed | Response with answers | Success message |
| `/api/survey-responses/` | GET | Get responses | Authenticated | Query: `?survey=<id>` | Array of responses |
| `/api/survey-responses/<id>/` | GET | Single response | Authenticated | None | Response with answers |

### Organizations

| Endpoint | Method | Description | Permissions | Request Body | Response |
|----------|--------|-------------|-------------|--------------|----------|
| `/api/organizations/` | GET | List organizations | Mixed | None | Array of organizations |
| `/api/organizations/<id>/` | GET/PUT/DELETE | Manage organization | Authenticated | Organization data | Organization details |

### Data Analysis (`/survey-analyzer/`)

| Endpoint | Method | Description | Permissions | Request Body | Response |
|----------|--------|-------------|-------------|--------------|----------|
| `/survey-analyzer/csv-uploads/` | POST | Upload CSV file | Authenticated | File upload | ID and columns |
| `/survey-analyzer/analyses/` | GET/POST | Manage analyses | Authenticated | Analysis data | Analysis details |
| `/survey-analyzer/analyses/<id>/` | GET/PUT/DELETE | Single analysis | Authenticated | Analysis data | Analysis details |
| `/survey-analyzer/plot-data/` | POST | Generate plot data | Authenticated | Plot config with CSV ID | Plot data |
| `/survey-analyzer/groupby/` | POST | Group data by columns | Authenticated | Columns and CSV ID | Grouped data |
| `/survey-analyzer/publish-analysis/` | POST | Export as PDF | Authenticated | Analysis ID | PDF document |

## Models & Schemas

### Core User & Auth Models (`Lakshya/models.py`)

#### User Model
```python
class User(AbstractUser):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # Custom groups and permissions relations
```

#### Organization Model
```python
class Organization(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### UserProfile Model
```python
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Survey Models (`Lakshya/models.py`)

#### Survey Model
```python
class Survey(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    requires_organization = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### Question Model
```python
class Question(models.Model):
    QUESTION_TYPES = [
        ('text', 'Text'),
        ('multiple_choice', 'Multiple Choice'),
        ('single_choice', 'Single Choice')
    ]

    survey = models.ForeignKey(Survey, on_delete=models.CASCADE)
    text = models.CharField(max_length=500)
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES)
    required = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### Choice Model
```python
class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choice_set')
    text = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### SurveyResponse Model
```python
class SurveyResponse(models.Model):
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE)
    respondent = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
```

#### Answer Model
```python
class Answer(models.Model):
    response = models.ForeignKey(SurveyResponse, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    text_answer = models.TextField(null=True, blank=True)
    selected_choices = models.ManyToManyField(Choice, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### Data Analysis Models (`survey_analyzer/models.py`)

#### CSVUpload Model
```python
class CSVUpload(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file = models.FileField(upload_to=upload_to)
    uploaded_at = models.DateTimeField(auto_now_add=True)
```

#### Analysis Model
```python
class Analysis(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=255, default='Untitled Analysis')
    author_name = models.CharField(max_length=255, default='Unknown Author')
    date = models.DateField(auto_now_add=True, null=True)
    description = models.TextField(blank=True, null=True)
    plots = models.JSONField(default=list)  # Store plot configurations and data
```

#### Plot Model
```python
class Plot(models.Model):
    analysis = models.ForeignKey('Analysis', related_name='related_plots', on_delete=models.CASCADE)
    type = models.CharField(max_length=255)
    data = models.TextField()  # Store plot data as JSON or plain text
```

## Authentication System

### Registration (`/api/auth/register/`)

**Frontend Request (POST):**
```javascript
{
  "username": "string",
  "email": "string",
  "password": "string",
  "password2": "string", // Confirmation password
  "organization_id": number | null // Optional
}
```

**Backend Response:**
```javascript
{
  "user": {
    "id": number,
    "username": "string",
    "email": "string",
    // Additional user info
  },
  "access": "string", // JWT access token
  "refresh": "string" // JWT refresh token
}
```

**Key Implementation Details:**
- Organization ID is required when registering
- Frontend fetches organizations before registration
- Passwords must match validation
- Email must be unique

### Login (`/api/auth/login/`)

**Frontend Request (POST):**
```javascript
{
  "email": "string",
  "password": "string"
}
```

**Backend Response:**
```javascript
{
  "user": {
    "id": number,
    "username": "string",
    "email": "string",
    // Additional user info
  },
  "access": "string", // JWT access token
  "refresh": "string" // JWT refresh token
}
```

### Token Refresh (`/api/auth/refresh/`)

**Frontend Request (POST):**
```javascript
{
  "refresh": "string" // Refresh token from previous auth response
}
```

**Backend Response:**
```javascript
{
  "access": "string" // New access token
}
```

### User Profile (`/api/auth/profile/`)

**Frontend Request (GET):**
```
Headers: Authorization: Bearer {access_token}
```

**Backend Response:**
```javascript
{
  "id": number,
  "username": "string",
  "email": "string",
  "profile": {
    "id": number,
    "organization": {
      "id": number,
      "name": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    },
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  // Other user data
}
```

## Organizations

### List Organizations (`/api/organizations/`)

**Frontend Request (GET):**
```
Headers: Authorization: Bearer {access_token} (optional, public endpoint)
```

**Backend Response:**
```javascript
[
  {
    "id": number,
    "name": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  },
  // More organizations
]
```

**Used For:**
- Registration organization selection
- Survey creation organization assignment
- Filtering surveys by organization

## Survey Management

### Create Survey (`/api/surveys/`)

**Frontend Request (POST):**
```javascript
{
  "title": "string",
  "description": "string",
  "requires_organization": boolean,
  "organization": number | null, // Organization ID
  "questions": [
    {
      "text": "string",
      "question_type": "text" | "single_choice" | "multiple_choice",
      "required": boolean,
      "choices": [
        {"text": "string"},
        // More choices
      ]
    },
    // More questions
  ]
}
```

**Backend Response:**
```javascript
{
  "id": number,
  "title": "string",
  "description": "string",
  "creator": number, // User ID
  "organization": number | null,
  "is_active": boolean,
  "requires_organization": boolean,
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Get Survey (`/api/surveys/{id}/`)

**Frontend Request (GET):**
```
Headers: Authorization: Bearer {access_token}
```

**Backend Response:**
```javascript
{
  "id": number,
  "title": "string",
  "description": "string",
  "creator": number,
  "organization": number | null,
  "is_active": boolean,
  "requires_organization": boolean,
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "questions": [
    {
      "id": number,
      "text": "string",
      "question_type": "text" | "single_choice" | "multiple_choice",
      "required": boolean,
      "choices": [
        {
          "id": number,
          "text": "string"
        },
        // More choices
      ]
    },
    // More questions
  ]
}
```

### Update Survey (`/api/surveys/{id}/`)

**Frontend Request (PUT):**
```javascript
{
  "title": "string",
  "description": "string",
  "requires_organization": boolean,
  "organization": number | null,
  "is_active": boolean,
  "questions": [
    {
      "id": number, // Include for existing questions
      "text": "string",
      "question_type": "text" | "single_choice" | "multiple_choice",
      "required": boolean,
      "choices": [
        {
          "id": number, // Include for existing choices
          "text": "string"
        },
        // More choices
      ]
    },
    // More questions
  ]
}
```

**Backend Response:** Same as Get Survey response

### Delete Survey (`/api/surveys/{id}/`)

**Frontend Request (DELETE):**
```
Headers: Authorization: Bearer {access_token}
```

**Backend Response:**
```
HTTP 204 No Content
```

### Public Survey View (`/api/api/surveys/{creator_id}/{survey_id}/`)

**Frontend Request (GET):**
```
No authentication required
```

**Backend Response:**
```javascript
{
  "id": number,
  "title": "string",
  "description": "string",
  "questions": [
    {
      "id": number,
      "text": "string",
      "question_type": "text" | "single_choice" | "multiple_choice",
      "choices": [
        {
          "id": number,
          "text": "string"
        },
        // More choices
      ]
    },
    // More questions
  ]
}
```

### Organization Surveys (`/api/api/organization-surveys/`)

**Frontend Request (GET):**
```
Headers: Authorization: Bearer {access_token}
```

**Backend Response:**
```javascript
[
  {
    "id": number,
    "title": "string",
    "description": "string",
    // Other survey fields
  },
  // More surveys from user's organization (excluding own surveys)
]
```

## Survey Responses

### Submit Response (`/api/survey-responses/`)

**Frontend Request (POST):**
```javascript
{
  "survey": number, // Survey ID
  "answers": [
    {
      "question": number, // Question ID
      "text_answer": "string", // For text questions
      "selected_choices": [number] // Array of choice IDs
    },
    // More answers
  ]
}
```

**Backend Response:**
```javascript
{
  "detail": "Response submitted successfully"
}
```

**Validation Rules:**
- Required questions must have answers
- Text questions must have non-empty text_answer
- Choice questions must have at least one selected choice
- Organization-restricted surveys check user's organization

### Get Survey Responses (`/api/survey-responses/?survey={id}`)

**Frontend Request (GET):**
```
Headers: Authorization: Bearer {access_token}
Query: survey={survey_id}
```

**Backend Response:**
```javascript
[
  {
    "id": number,
    "survey": number,
    "respondent": number | null,
    "submitted_at": "timestamp",
    "answer_set": [
      {
        "id": number,
        "question": number,
        "text_answer": "string" | null,
        "selected_choices": [
          // Choice objects
        ]
      },
      // More answers
    ]
  },
  // More responses
]
```

## Data Analysis System

### Upload CSV (`/survey-analyzer/csv-uploads/`)

**Frontend Request (POST):**
```
Headers: Authorization: Bearer {access_token}
Content-Type: multipart/form-data
Body: FormData with file field
```

**Backend Response:**
```javascript
{
  "id": number, // CSV upload ID
  "columns": ["column1", "column2", ...] // CSV columns
}
```

### Generate Plot Data (`/survey-analyzer/plot-data/`)

**Frontend Request (POST):**
```javascript
{
  "plot_type": "scatter" | "bar" | "line" | "pie" | "histogram" | "heatmap" | "box" | "area",
  "x_axis": "string", // Column name for x-axis
  "y_axes": ["string"], // Column names for y-axes
  "csv_upload_id": number // ID from CSV upload
}
```

**Backend Response:**
```javascript
{
  "data": [
    // Plotly data objects based on plot type
  ],
  "layout": {
    // Plotly layout configuration
  }
}
```

**Plot Types and Required Parameters:**
- **scatter, bar, line, area**: Require x_axis and at least one y_axis
- **pie**: Requires only x_axis (can include one y_axis for values)
- **heatmap**: Requires x_axis and at least one y_axis (two preferred)
- **box**: Requires y_axes (multiple allowed)

### Group Data (`/survey-analyzer/groupby/`)

**Frontend Request (POST):**
```javascript
{
  "columns": ["string"], // Column names to group by
  "csv_upload_id": number // ID from CSV upload
}
```

**Backend Response:**
```javascript
{
  "column1": [
    {
      "column1": "value",
      "count": number
    },
    // More grouped values
  ],
  // More columns with grouped data
}
```

### Save Analysis (`/survey-analyzer/analyses/`)

**Frontend Request (POST):**
```javascript
{
  "title": "string",
  "author_name": "string",
  "description": "string",
  "plots": [
    {
      "title": "string",
      "description": "string",
      "data": {
        "data": [], // Plotly data objects
        "layout": {} // Plotly layout
      }
    },
    // More plots
  ]
}
```

**Backend Response:**
```javascript
{
  "id": number,
  "user": number,
  "title": "string",
  "author_name": "string",
  "date": "timestamp",
  "description": "string",
  "plots": [] // Array of plot configurations
}
```

### Publish Analysis as PDF (`/survey-analyzer/publish-analysis/`)

**Frontend Request (POST):**
```javascript
{
  "analysis_id": number
}
```

**Backend Response:**
```
Binary PDF file with Content-Type: application/pdf
```

## Libraries Used

### Core Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| Django | 5.2 | Web framework |
| djangorestframework | 3.16.0 | REST API support |
| djangorestframework_simplejwt | 5.5.0 | JWT authentication |
| django-cors-headers | 4.7.0 | CORS support |

### Data Processing & Visualization

| Library | Version | Purpose |
|---------|---------|---------|
| pandas | 2.2.3 | Data analysis and CSV processing |
| numpy | 2.2.4 | Numerical computing |
| plotly | 6.0.1 | Interactive data visualization |
| kaleido | 0.2.1 | Static image export for plotly |

### PDF Generation

| Library | Version | Purpose |
|---------|---------|---------|
| reportlab | Not specified | PDF generation |
| pdfkit | 1.0.0 | HTML to PDF conversion |
| pillow | 11.2.1 | Image processing |

### Deployment & Server

| Library | Version | Purpose |
|---------|---------|---------|
| gunicorn | 23.0.0 | WSGI HTTP Server |
| Flask | 3.1.0 | Used for additional services |

## Frontend Components & Routes

### Main Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | Login | User login page |
| `/register` | Register | User registration page |
| `/dashboard` | Dashboard | Main dashboard after login |
| `/dashboard/surveys` | SurveyList | List user's created surveys |
| `/dashboard/surveys/new` | SurveyCreator | Create a new survey |
| `/dashboard/surveys/:id` | SurveyDetail | View single survey details |
| `/dashboard/surveys/:id/edit` | SurveyEdit | Edit existing survey |
| `/dashboard/surveys/:id/responses` | SurveyResponses | View responses to a survey |
| `/dashboard/profile` | ProfilePage | User profile information |
| `/dashboard/notifications` | Notification | View organization survey notifications |
| `/surveys/:creatorId/:surveyId` | SurveyResponse | Public survey response page |
| `/thank-you` | ThankYou | Thank you page after submitting survey |
| `/dashboard/analyzer` | SurveyAnalyzer | CSV upload and analysis tool |
| `/dashboard/analyses` | SavedAnalysis | View saved analyses |
| `/dashboard/analyses/:id/edit` | EditAnalysis | Edit saved analysis |

### Key Frontend Components

- **Authentication**: `LoginForm`, `SignupForm`, `AuthContext`
- **Survey Management**: `SurveyCreator`, `SurveyEdit`, `SurveyList`
- **Survey Response**: `SurveyResponse`, `SurveyResponses`
- **Data Analysis**: `SurveyAnalyzer`, `SavedAnalysis`
- **Layout**: `Layout`, `OrganizationSurveysLayout`
- **User Profile**: `ProfileCard`, `ProfilePage`

## Key Workflows

### Authentication Flow

1. **Registration**:
   - User enters username, email, password, and selects organization
   - Frontend sends POST request to `/api/auth/register/`
   - Backend creates user, profile, links to organization
   - User is redirected to login

2. **Login**:
   - User enters email and password
   - Frontend sends POST request to `/api/auth/login/`
   - Backend validates credentials, returns tokens
   - Frontend stores tokens in localStorage
   - User is redirected to dashboard

3. **Token Refresh**:
   - When access token expires, frontend sends refresh token
   - Backend issues new access token
   - Frontend updates stored token

### Survey Creation Flow
1. User creates survey with title, description
2. User selects if survey requires organization access
3. User adds questions of different types:
   - Text questions
   - Single choice questions (with options)
   - Multiple choice questions (with options)
4. User marks questions as required/optional
5. Frontend sends formatted data to backend
6. Backend validates and stores survey, questions, and choices

### Survey Response Flow
1. Respondent accesses survey via unique URL with creator/survey IDs
2. If survey requires organization, backend validates user's organization
3. Respondent answers questions
4. Frontend validates required fields
5. Frontend sends answers to backend
6. Backend validates and saves response

### Data Analysis Flow
1. User uploads CSV file
2. Backend processes file, returns columns
3. User selects visualization type and parameters
4. Backend generates plot data based on selection
5. User can save analysis with multiple plots
6. User can export analysis as PDF

## Advanced Operations Details

### Authentication System
- Uses Django's AbstractUser with custom email field
- JWT-based authentication with access and refresh tokens
- Token refresh mechanism for extended sessions
- Profile system with organization relationships

### Survey Validation
- Required fields validation
- Question type-specific validation (text requires content, choices require selection)
- Organization-based access control for restricted surveys

### Data Visualization Features
- Support for various plot types:
  - Scatter plots
  - Bar charts
  - Line graphs
  - Pie charts
  - Histograms
  - Heatmaps
  - Box plots
  - Area charts
- Data grouping and aggregation
- Multiple Y-axis support
- Color scaling and configuration

### PDF Export System
- Converts plotly visualizations to images
- Embeds images in PDF with proper formatting
- Includes title, author, date, and descriptions
- Creates downloadable document with all analyses

## Management Commands

Custom Django management commands:

- `add_organizations.py`: Add sample organizations
- `clear_db.py`: Clear database data
- `reset_db.py`: Reset database to initial state

## Database Configuration

Uses SQLite for development (db.sqlite3), with proper models and migrations.

## Deployment

The project includes Vercel configuration (`vercel.json`) for deployment.

---

This documentation provides a comprehensive overview of the backend architecture, endpoints, models, and functionality of the Lakshya Online Survey Management system. It's designed to be a reference for development and migration to new backend systems.
