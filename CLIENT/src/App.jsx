import React from 'react';
import { 
  createBrowserRouter,
  RouterProvider,
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate,
  createRoutesFromElements
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Import future flags for React Router v6.22.1
import Dashboard from './pages/Dashboard';
import SurveyList from './pages/surveys/SurveyList';
import SurveyResponse from './pages/surveys/SurveyResponse';
import SurveyDetail from './pages/surveys/SurveyDetail';
import SurveyEdit from './pages/surveys/SurveyEdit';
import SurveyCreator from './pages/surveys/SurveyCreator';
import SurveyResponses from './pages/surveys/SurveyResponses';
import ThankYou from './pages/surveys/ThankYou';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import SurveyAnalyzer from './pages/SurveyAnalyzer';
import EditAnalysis from './pages/EditAnalysis';
import SavedAnalysis from './pages/SavedAnalysis';
import OrganizationSurveys from './pages/surveys/OrganizationSurveys';
import Notification from './pages/notifications/Notification';
import ProfilePage from './pages/profile/ProfilePage';
import OrganizationManager from './pages/organizations/OrganizationManager';
import OrganizationManagement from './pages/organizations/OrganizationManagement';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Root Route component
const RootRoute = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/organizations" element={<OrganizationManager />} />
          <Route path="/organizations" element={<OrganizationManagement />} />
          <Route path="/survey-response/:creatorId/:surveyId" element={
            <ProtectedRoute>
              <SurveyResponse />
            </ProtectedRoute>
            } />
          <Route path="/thank-you" element={<ThankYou />} />
          
          {/* Root route */}
          <Route path="/" element={<RootRoute />} />
          
          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="surveys" element={<SurveyList />} />
            <Route path="surveys/create" element={<SurveyCreator />} />
            <Route path="surveys/:id" element={<SurveyDetail />} />
            <Route path="surveys/:id/edit" element={<SurveyEdit />} />
            <Route path="surveys/:id/responses" element={<SurveyResponses />} />
            <Route path="survey-analyzer" element={<SurveyAnalyzer />} />
            <Route path="saved-analyses" element={<SavedAnalysis />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route
              path="organization-surveys"
              element={
                <ProtectedRoute>
                  <OrganizationSurveys />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="/edit-analysis/:id" element={
            <ProtectedRoute>
              <EditAnalysis />
            </ProtectedRoute>
            } />
          <Route path="/notifications" element={<Notification />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;