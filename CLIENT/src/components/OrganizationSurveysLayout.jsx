import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';

const OrganizationSurveysLayout = () => {
  const [organizationSurveys, setOrganizationSurveys] = useState([]);
  const [userOrganization, setUserOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrganizationSurveys = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError('No authentication token found');
          return;
        }

        // Get organization-specific surveys using the new endpoint
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/surveys/organization-surveys`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        setOrganizationSurveys(response.data);
        
        // Get user profile to display organization name
        const userResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (userResponse.data && userResponse.data.organization) {
          setUserOrganization(userResponse.data.organization);
        }
      } catch (err) {
        console.error('Error fetching organization surveys:', err);
        setError('Failed to load organization surveys');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizationSurveys();
  }, []);

  if (loading) {
    return <div className="p-6 flex justify-center items-center">Loading organization surveys...</div>;
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
      <h1 className="text-2xl font-semibold text-gray-900">
        {userOrganization ? `${userOrganization.name} Surveys` : 'Organization Surveys'}
      </h1>
      {userOrganization && (
        <p className="text-sm text-gray-500 mt-2">
          Showing surveys from your organization: {userOrganization.name}
        </p>
      )}
      
      <div className="mt-8">
        {organizationSurveys.length === 0 ? (
          <p className="text-gray-500">No surveys available for your organization.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {organizationSurveys.map((survey) => (
              <li key={survey.id} className="py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{survey.title}</h3>
                    <p className="text-sm text-gray-500">{survey.description}</p>
                    {!survey.is_active && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                        Inactive
                      </span>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      By: {survey.creator?.username || 'Unknown'}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/dashboard/surveys/${survey.id}`)}
                    className="text-primary-600 hover:text-primary-900"
                    disabled={!survey.is_active}
                  >
                    {survey.is_active ? 'View' : 'Unavailable'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Outlet />
    </div>
  );
};

export default OrganizationSurveysLayout;
