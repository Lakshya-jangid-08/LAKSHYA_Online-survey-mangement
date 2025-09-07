import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Edit, Share, Trash2, BarChart3 } from 'lucide-react';

const SurveyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [actionError, setActionError] = useState(null);
  const [organizationName, setOrganizationName] = useState('');

  useEffect(() => {
    if (!id) {
      console.error('Survey ID is undefined');
      setError('Invalid survey ID');
      setLoading(false);
      return;
    }
    console.log('Loading survey with ID:', id);
    fetchSurvey();
  }, [id]);
  
  // Debug the survey state whenever it changes
  useEffect(() => {
    if (survey) {
      console.log('Current survey state:', survey);
      console.log('Active status:', survey.is_active, survey.isActive);
      console.log('Organization status:', survey.requires_organization, survey.requiresOrganization);
      console.log('Organization:', survey.organization);
    }
  }, [survey]);

  const fetchSurvey = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/surveys/${id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Survey data received:', response.data);
      console.log('Active status:', response.data.is_active, response.data.isActive);
      console.log('Organization status:', response.data.requires_organization, response.data.requiresOrganization);
      console.log('Organization:', response.data.organization);
      console.log('Organization type:', typeof response.data.organization);
      console.log('Organization ID:', response.data.organization_id);
      
      // Fix inconsistent field naming
      const normalizedSurvey = {
        ...response.data,
        is_active: response.data.is_active || response.data.isActive || false,
        requires_organization: response.data.requires_organization || response.data.requiresOrganization || false
      };

      setSurvey(normalizedSurvey);
      
      // Fetch organization details if we only have an ID
      if ((normalizedSurvey.organization_id || 
          (typeof normalizedSurvey.organization === 'string' && !normalizedSurvey.organization.includes(' '))) && 
          (!normalizedSurvey.organization?.name)) {
        fetchOrganizationDetails(normalizedSurvey.organization_id || normalizedSurvey.organization);
      } else if (normalizedSurvey.organization?.name) {
        setOrganizationName(normalizedSurvey.organization.name);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching survey:', error);
      setError('Failed to load survey');
      setLoading(false);
    }
  };
  
  const fetchOrganizationDetails = async (orgId) => {
    if (!orgId) return;
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/organizations/${orgId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Organization details:', response.data);
      if (response.data && response.data.name) {
        setOrganizationName(response.data.name);
      }
    } catch (error) {
      console.error('Error fetching organization details:', error);
      // Don't set an error state here to avoid disrupting the main survey display
    }
  };

  const handleEdit = () => {
    console.log('Navigating to edit page for survey ID:', id);
    navigate(`/dashboard/surveys/${id}/edit`);
  };

  const handleShare = () => {
    const baseUrl = window.location.origin;
    const surveyUrl = `${baseUrl}/survey-response/${survey.creator || survey.creator?._id}/${id}`; // Use creator ID in the URL
    setShareUrl(surveyUrl);
    setShowShareModal(true);
    
    // Show a warning if the survey is organization-specific
    if (survey.requires_organization || survey.requiresOrganization) {
      setActionError('Note: This survey is organization-specific. Only users from the same organization can access it.');
      
      // Clear the error after 5 seconds
      setTimeout(() => {
        setActionError(null);
      }, 5000);
    }
  };

  const handleDelete = async () => {
    try {
      setActionError(null);
      const token = localStorage.getItem('access_token');
      if (!token) {
        setActionError('No authentication token found');
        return;
      }

      await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/surveys/${id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setShowDeleteConfirm(false);
      navigate('/dashboard/surveys');
    } catch (error) {
      console.error('Error deleting survey:', error);
      setActionError('Failed to delete survey. Please try again.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Survey URL copied to clipboard!');
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
      <div className="p-6 flex justify-center items-center">
        <div className="text-gray-500">Loading survey...</div>
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

  if (!survey) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-yellow-700">Survey not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            to="/dashboard/surveys"
            className="inline-flex items-center text-primary-600 hover:text-primary-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Surveys
          </Link>
        </div>

        {actionError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-700">{actionError}</div>
          </div>
        )}

        <div className="bg-gradient-card border border-primary-200 shadow-lg overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {survey.title}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Created on {formatDate(survey.created_at || survey.createdAt)}
              </p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={handleEdit}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gradient-subtle"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </button>
              <button 
                onClick={handleShare}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gradient-subtle"
              >
                <Share className="h-4 w-4 mr-1" />
                Share
              </button>
              <Link
                to={`/dashboard/surveys/${id}/responses`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gradient-subtle"
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                View Responses
              </Link>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{survey.description}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    survey.is_active || survey.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {survey.is_active || survey.isActive ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Responses</dt>
                <dd className="mt-1 text-sm text-gray-900">{survey.responses_count || 0}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Organization-Specific</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    survey.requires_organization || survey.requiresOrganization ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {survey.requires_organization || survey.requiresOrganization ? 'Yes' : 'No'}
                  </span>
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Organization</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {organizationName || 
                   survey.organization?.name || 
                   (typeof survey.organization === 'string' && survey.organization) ||
                   (survey.requires_organization || survey.requiresOrganization ? 
                     (loading ? "Loading organization..." : "Organization required but not specified") : 
                     "Not organization specific")}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Questions</h3>
          <div className="bg-gradient-card border border-primary-200 shadow-lg overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {survey.questions && survey.questions.length > 0 ? (
                survey.questions.map((question, index) => (
                  <li key={question.id || index} className="px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {index + 1}. {question.text}
                          </span>
                          {question.required && (
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          Type: {question.question_type}
                        </p>
                        {question.choices && question.choices.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-500">Choices:</p>
                            <ul className="mt-1 list-disc list-inside text-sm text-gray-500">
                              {question.choices.map((choice, choiceIndex) => (
                                <li key={choice.id || choiceIndex}>{choice.text}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-4">
                  <div className="text-sm text-gray-500">No questions added to this survey yet.</div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gradient-subtle0 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Survey</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this survey? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gradient-subtle"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-gradient-subtle0 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Share Survey</h3>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
              >
                Copy
              </button>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gradient-subtle"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyDetail;