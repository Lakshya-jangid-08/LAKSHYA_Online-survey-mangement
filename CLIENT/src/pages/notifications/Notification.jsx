import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';

const Notification = () => {
  const [surveys, setSurveys] = useState([]);
  const [newSurveys, setNewSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userOrganization, setUserOrganization] = useState(null);
  
  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('No authentication token found');
          return;
        }

        // Get organization-specific surveys
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/surveys/organization-surveys`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Get all surveys
        setSurveys(response.data);
        
        // Get recent surveys (created in the last 24 hours)
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
        const recentSurveys = response.data.filter(survey => {
          const surveyDate = new Date(survey.createdAt || survey.created_at);
          return surveyDate > oneDayAgo;
        });
        
        setNewSurveys(recentSurveys);
        
        // Get user profile for organization info
        const userResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (userResponse.data && userResponse.data.organization) {
          setUserOrganization(userResponse.data.organization);
        }
        
        // Show toast for new surveys
        if (recentSurveys.length > 0) {
          toast.info(`You have ${recentSurveys.length} new survey${recentSurveys.length > 1 ? 's' : ''} from your organization!`);
        }
      } catch (err) {
        console.error('Error fetching surveys:', err);
        setError(err.response?.data?.detail || 'Failed to load surveys');
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading surveys...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      {/* Header Section */}
      <div className="bg-gradient-card border border-primary-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="mt-1 text-sm text-gray-500">
                Stay updated with the latest surveys and activities
              </p>
            </div>
            <div>
              <button 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => setNewSurveys([])} // Mark all as read
              >
                Mark all as read
              </button>
            </div>
          </div>
          
          {/* Quick Navigation Menu */}
          <div className="mt-6 border-t border-gray-200 pt-4">
            <nav className="flex space-x-4 overflow-x-auto pb-2">
              <Link 
                to="/dashboard" 
                className="px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link 
                to="/dashboard/surveys" 
                className="px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                My Surveys
              </Link>
              <Link 
                to="/dashboard/organization-surveys" 
                className="px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                Organization Surveys
              </Link>
              <Link 
                to="/dashboard/survey-analyzer" 
                className="px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                Survey Analyzer
              </Link>
              <Link 
                to="/dashboard/saved-analyses" 
                className="px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                Saved Analyses
              </Link>
              <Link 
                to="/dashboard/profile" 
                className="px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                Profile
              </Link>
            </nav>
          </div>
          
          {userOrganization && (
            <div className="mt-4 flex items-center">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                {userOrganization.name}
              </span>
              <span className="ml-2 text-sm text-gray-600">
                Your organization
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto p-6">
      {userOrganization && (
        <p className="text-sm text-gray-600 mb-4">
          Showing surveys from your organization: <span className="font-medium">{userOrganization.name}</span>
        </p>
      )}
      
      {/* New Surveys Section */}
      {newSurveys.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-3">New Surveys</h2>
          <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
            {newSurveys.map((survey) => (
              <li key={survey.id || survey._id} className="p-4 bg-yellow-50">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center">
                      <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      <h3 className="text-lg font-medium">{survey.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{survey.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      By: {survey.creator?.username || 'Unknown'} • 
                      Added: {formatDate(survey.createdAt || survey.created_at)}
                    </p>
                  </div>
                  {survey.is_active ? (
                    <Link
                      to={`/survey-response/${survey.creator?._id || survey.creator || survey.user}/${survey.id || survey._id}/`}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                    >
                      Respond
                    </Link>
                  ) : (
                    <span className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm cursor-not-allowed">
                      Form Unavailable
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* All Organization Surveys */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-3">
          {userOrganization ? `${userOrganization.name} Surveys` : 'Organization Surveys'}
        </h2>
        {surveys.length === 0 ? (
          <p className="text-gray-500">No surveys available from your organization.</p>
        ) : (
          <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
            {surveys.map((survey) => (
              <li key={survey.id || survey._id} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">{survey.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{survey.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      By: {survey.creator?.username || 'Unknown'} • 
                      Created: {formatDate(survey.createdAt || survey.created_at)}
                    </p>
                    {!survey.is_active && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                        Inactive
                      </span>
                    )}
                  </div>
                  {survey.is_active ? (
                    <Link
                      to={`/survey-response/${survey.creator?._id || survey.creator || survey.user}/${survey.id || survey._id}/`}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      View
                    </Link>
                  ) : (
                    <span className="text-gray-400 cursor-not-allowed">
                      Form Unavailable
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
    </div>
  );
};

export default Notification;
