import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Users, Calendar, PlusCircle, Search, Filter } from 'lucide-react';
import axios from 'axios';

const SurveyList = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('No authentication token found');
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/surveys/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Ensure we have consistent ID fields and active status in surveys
        const formattedSurveys = response.data.map(survey => ({
          ...survey,
          id: survey._id || survey.id,  // Use _id as a fallback if id is undefined
          is_active: survey.isActive !== undefined ? survey.isActive : (survey.is_active || false),
          isActive: survey.isActive !== undefined ? survey.isActive : (survey.is_active || false)
        }));
        
        console.log('Survey list data:', formattedSurveys);
        setSurveys(formattedSurveys);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching surveys:', error);
        setError('Failed to load surveys');
        setLoading(false);
      }
    };

    fetchSurveys();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'Date unavailable';
    }
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="text-gray-500">Loading surveys...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-700">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-accent">My Surveys</h1>
          <p className="mt-1 text-primary-700">Create and manage your surveys</p>
        </div>
        <Link
          to="/dashboard/surveys/create"
          className="btn-primary"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Survey
        </Link>
      </div>

      {surveys.length === 0 ? (
        <div className="mt-8">
          <div className="card text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-primary-400" />
            <h3 className="mt-4 text-lg font-medium text-primary-900">No surveys yet</h3>
            <p className="mt-2 text-sm text-primary-600">Create your first survey to get started</p>
            <Link
              to="/dashboard/surveys/create"
              className="btn-primary mt-4"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Survey
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <div className="bg-gradient-card border border-primary-200 shadow-lg overflow-hidden rounded-xl">
            <ul className="divide-y divide-primary-100">
              {surveys.map((survey) => (
                <li key={survey.id || survey._id} className="px-6 py-4 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-primary-900">{survey.title}</h3>
                      <p className="mt-1 text-sm text-primary-700">{survey.description}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        (survey.isActive || survey.is_active) 
                          ? 'bg-gradient-to-r from-secondary-100 to-secondary-200 text-secondary-800' 
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800'
                      }`}>
                        {(survey.isActive || survey.is_active) ? 'Active' : 'Inactive'}
                      </span>
                      <Link
                        to={`/dashboard/surveys/${survey.id || survey._id}`}
                        className="text-primary-600 hover:text-primary-900 font-medium transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        {survey.responses_count || 0} responses
                      </p>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <p className="text-sm text-gray-500">
                        Created on {formatDate(survey.created_at || survey.createdAt)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyList;