import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Users, Calendar, PlusCircle } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalSurveys: 0,
    totalResponses: 0,
    activeSurveys: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
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

      const surveyData = response.data;
      console.log('Survey data from API:', surveyData);
      
      // Map the data to ensure we have consistent ID fields
      const formattedSurveys = surveyData.map(survey => ({
        ...survey,
        id: survey._id || survey.id  // Use _id as a fallback if id is undefined
      }));
      
      console.log('Formatted survey data:', formattedSurveys);
      setSurveys(formattedSurveys.slice(0, 3)); // Get only the 3 most recent surveys
      
      // Calculate stats
      setStats({
        totalSurveys: surveyData.length,
        totalResponses: surveyData.reduce((sum, survey) => sum + (survey.responses_count || 0), 0),
        activeSurveys: surveyData.filter(survey => survey.is_active).length
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

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
      <div className="p-6 flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <div className="mt-4 text-primary-700 font-medium">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-700 font-medium">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-800 to-accent-800 bg-clip-text text-transparent">
            Welcome to Lakshya
          </h1>
          <p className="mt-1 text-primary-700">Manage your surveys and analyze responses</p>
        </div>
        <Link
          to="/dashboard/surveys/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-lg text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 transform hover:scale-105"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Survey
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-gradient-card border border-primary-200 overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-lg">
                  <ClipboardList className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-primary-700 truncate">Total Surveys</dt>
                  <dd className="text-2xl font-bold text-primary-900">{stats.totalSurveys}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-card border border-primary-200 overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 bg-gradient-to-r from-secondary-100 to-accent-100 rounded-lg">
                  <Users className="h-6 w-6 text-secondary-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-primary-700 truncate">Total Responses</dt>
                  <dd className="text-2xl font-bold text-primary-900">{stats.totalResponses}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-card border border-primary-200 overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 bg-gradient-to-r from-accent-100 to-primary-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-accent-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-primary-700 truncate">Active Surveys</dt>
                  <dd className="text-2xl font-bold text-primary-900">{stats.activeSurveys}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-primary-900">Recent Surveys</h2>
        <div className="mt-4 bg-gradient-card border border-primary-200 shadow-lg overflow-hidden rounded-xl">
          <ul className="divide-y divide-primary-100">
            {surveys.length === 0 ? (
              <li className="px-6 py-6">
                <div className="flex items-center justify-between">
                  <div className="text-center w-full">
                    <ClipboardList className="mx-auto h-12 w-12 text-primary-400" />
                    <h3 className="mt-2 text-lg font-medium text-primary-900">No surveys yet</h3>
                    <p className="mt-1 text-sm text-primary-600">Create your first survey to get started</p>
                    <Link
                      to="/dashboard/surveys/create"
                      className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 rounded-lg transition-all duration-300"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Survey
                    </Link>
                  </div>
                </div>
              </li>
            ) : (
              surveys.map((survey) => (
                <li key={survey.id || survey._id}>
                  <Link
                    to={`/dashboard/surveys/${survey.id || survey._id}`}
                    className="block hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 transition-all duration-200"
                  >
                    <div className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="p-2 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-lg">
                            <ClipboardList className="h-5 w-5 text-primary-600" />
                          </div>
                          <p className="ml-3 text-sm font-semibold text-primary-700 hover:text-primary-900 transition-colors">
                            {survey.title}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <p className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            survey.is_active 
                              ? 'bg-gradient-to-r from-secondary-100 to-secondary-200 text-secondary-800' 
                              : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800'
                          }`}>
                            {survey.is_active ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-primary-600">
                            <Users className="flex-shrink-0 mr-1.5 h-4 w-4 text-primary-500" />
                            {survey.responses_count || 0} responses
                          </p>
                        </div>
                        <div className="mt-2 sm:mt-0">
                          <p className="text-sm text-primary-600">
                            Created on {formatDate(survey.createdAt || survey.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;