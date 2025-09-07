import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';

const SurveyEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState({
    title: '',
    description: '',
    is_active: true,
    requires_organization: false,
    organization_id: null,
    questions: []
  });
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    console.log('SurveyEdit component mounted');
    console.log('Initial survey state:', survey);
    fetchSurvey();
    fetchOrganizations();
  }, [id]);

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/organizations/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setOrganizations(response.data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setError('Failed to load organizations');
    }
  };

  const fetchSurvey = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      console.log('Fetching survey with ID:', id);

      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/surveys/${id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Raw survey data from backend:', response.data);
      console.log('Questions from backend:', response.data.questions);

      // Make sure we're using the correct field names and handle different naming conventions
      const surveyData = {
        ...response.data,
        title: response.data.title || '',
        description: response.data.description || '',
        is_active: response.data.is_active !== undefined ? response.data.is_active : 
                   response.data.isActive !== undefined ? response.data.isActive : true,
        organization_id: response.data.organization?._id || response.data.organization?.id || null,
        requires_organization: response.data.requires_organization !== undefined ? response.data.requires_organization : 
                             response.data.requiresOrganization !== undefined ? response.data.requiresOrganization : false,
        questions: response.data.questions ? response.data.questions.map(q => ({
          id: q.id,
          text: q.text,
          question_type: q.question_type || 'text',
          required: q.required || false,
          choices: q.choices ? q.choices.map(c => ({
            id: c.id,
            text: c.text
          })) : []
        })) : []
      };
      
      console.log('Active status:', response.data.is_active, response.data.isActive);
      console.log('Normalized active status:', surveyData.is_active);

      console.log('Processed survey data:', surveyData);
      console.log('Processed questions:', surveyData.questions);
      
      setSurvey(surveyData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching survey:', error);
      console.error('Error response:', error.response?.data);
      setError('Failed to load survey');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccessMessage('');
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      // Validate organization selection only if requires_organization is true
      if (survey.requires_organization && !survey.organization_id) {
        setError('Please select an organization when organization access is required');
        return;
      }

      // Validate required fields
      if (!survey.title.trim()) {
        setError('Survey title is required');
        return;
      }

      // Validate questions
      if (survey.questions.length === 0) {
        setError('At least one question is required');
        return;
      }

      for (let i = 0; i < survey.questions.length; i++) {
        const question = survey.questions[i];
        
        // Check if question text is empty
        if (!question.text.trim()) {
          setError(`Question ${i + 1} text is required`);
          return;
        }

        // Check if choices are required and filled for multiple/single choice questions
        if ((question.question_type === 'multiple_choice' || question.question_type === 'single_choice') && 
            (!question.choices || question.choices.length === 0)) {
          setError(`Question ${i + 1} requires at least one choice`);
          return;
        }

        // Check if all choices have text
        if (question.choices) {
          for (let j = 0; j < question.choices.length; j++) {
            if (!question.choices[j].text.trim()) {
              setError(`Choice ${j + 1} in Question ${i + 1} is required`);
              return;
            }
          }
        }
      }

      console.log('Submitting survey edit for ID:', id);
      console.log('Current survey state:', survey);

      // Format the data according to the backend's expectations
      const formattedSurvey = {
        title: survey.title,
        description: survey.description,
        is_active: survey.is_active,
        requires_organization: survey.requires_organization,
        organization: survey.requires_organization ? survey.organization_id : null,
        organization_id: survey.requires_organization ? survey.organization_id : null, // Include both formats for compatibility
        questions: survey.questions.map((question, index) => {
          const formattedQuestion = {
            text: question.text,
            question_type: question.question_type,
            required: question.required || false
          };

          // Only include choices if the question type requires them
          if (question.question_type === 'multiple_choice' || question.question_type === 'single_choice') {
            formattedQuestion.choices = question.choices ? question.choices.map((choice, choiceIndex) => ({
              text: choice.text
            })) : [];
          }

          return formattedQuestion;
        })
      };

      console.log('Formatted survey data:', formattedSurvey);

      const response = await axios.put(`${import.meta.env.VITE_BASE_URL}/api/surveys/${id}/`, formattedSurvey, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Survey update response:', response.data);

      // Fetch the updated survey to ensure we have the latest data
      await fetchSurvey();

      setSuccessMessage('Survey updated successfully!');
      setTimeout(() => {
        navigate(`/dashboard/surveys/${id}`);
      }, 1500);
    } catch (error) {
      console.error('Error updating survey:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.detail || error.response?.data?.organization_id || 'Failed to update survey');
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...survey.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setSurvey({ ...survey, questions: updatedQuestions });
  };

  const handleChoiceChange = (questionIndex, choiceIndex, value) => {
    const updatedQuestions = [...survey.questions];
    updatedQuestions[questionIndex].choices[choiceIndex].text = value;
    setSurvey({ ...survey, questions: updatedQuestions });
  };

  const addQuestion = () => {
    console.log('Adding new question...');
    console.log('Current survey state:', survey);
    
    const newQuestion = {
      text: '',
      question_type: 'text',
      required: false,
      choices: []
    };
    
    console.log('New question object:', newQuestion);
    
    const updatedSurvey = {
      ...survey,
      questions: [...survey.questions, newQuestion]
    };
    
    console.log('Updated survey state:', updatedSurvey);
    setSurvey(updatedSurvey);
  };

  const deleteQuestion = (index) => {
    const updatedQuestions = [...survey.questions];
    updatedQuestions.splice(index, 1);
    setSurvey({
      ...survey,
      questions: updatedQuestions
    });
  };

  const addChoice = (questionIndex) => {
    const updatedQuestions = [...survey.questions];
    if (!updatedQuestions[questionIndex].choices) {
      updatedQuestions[questionIndex].choices = [];
    }
    updatedQuestions[questionIndex].choices.push({ text: '' });
    setSurvey({
      ...survey,
      questions: updatedQuestions
    });
  };

  const deleteChoice = (questionIndex, choiceIndex) => {
    const updatedQuestions = [...survey.questions];
    updatedQuestions[questionIndex].choices.splice(choiceIndex, 1);
    setSurvey({
      ...survey,
      questions: updatedQuestions
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <div className="mt-4 text-primary-700 font-medium">Loading survey...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg">
          <div className="text-red-700 font-medium">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-subtle min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-800 to-accent-800 bg-clip-text text-transparent">
            Edit Survey
          </h2>
          <p className="mt-2 text-primary-700">Update your survey details, questions, and settings</p>
        </div>
        
        {successMessage && (
          <div className="mb-6 bg-gradient-to-r from-secondary-50 to-secondary-100 border border-secondary-200 rounded-xl p-4 shadow-lg">
            <div className="text-secondary-800 font-medium">{successMessage}</div>
          </div>
        )}
        
        <div className="bg-gradient-card border border-primary-200 rounded-2xl shadow-xl p-8">
          {/* <form onSubmit={handleSubmit} className="space-y-8"> */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Survey Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-primary-900 border-b border-primary-200 pb-2">
                Basic Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-primary-800 mb-2">Survey Title</label>
                <input
                  type="text"
                  value={survey.title}
                  onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
                  className="w-full rounded-xl border-primary-300 bg-white/80 backdrop-blur-sm shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all duration-200"
                  placeholder="Enter survey title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-800 mb-2">Description</label>
                <textarea
                  value={survey.description}
                  onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
                  className="w-full rounded-xl border-primary-300 bg-white/80 backdrop-blur-sm shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all duration-200"
                  rows={3}
                  placeholder="Describe your survey (optional)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-200">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={survey.is_active}
                    onChange={(e) => setSurvey({ ...survey, is_active: e.target.checked })}
                    className="h-4 w-4 rounded border-primary-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="is_active" className="ml-3 text-sm font-medium text-primary-900">
                    Active Survey
                  </label>
                  <span className="ml-2 text-xs text-primary-600">(Allow responses)</span>
                </div>

                <div className="flex items-center p-4 bg-gradient-to-r from-accent-50 to-primary-50 rounded-xl border border-primary-200">
                  <input
                    type="checkbox"
                    id="requires_organization"
                    checked={survey.requires_organization}
                    onChange={(e) => setSurvey({ ...survey, requires_organization: e.target.checked })}
                    className="h-4 w-4 rounded border-primary-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="requires_organization" className="ml-3 text-sm font-medium text-primary-900">
                    Organization Access
                  </label>
                  <span className="ml-2 text-xs text-primary-600">(Restrict to organization)</span>
                </div>
              </div>

              {survey.requires_organization && (
                <div className="p-4 bg-gradient-to-r from-accent-50 to-accent-100 rounded-xl border border-accent-200">
                  <label className="block text-sm font-medium text-primary-800 mb-2">Organization</label>
                  <select
                    value={survey.organization_id || ''}
                    onChange={(e) => setSurvey({ ...survey, organization_id: e.target.value || null })}
                    className="w-full rounded-xl border-primary-300 bg-white/80 backdrop-blur-sm shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all duration-200"
                    required={survey.requires_organization}
                  >
                    <option value="">Select an organization</option>
                    {organizations.map((org) => (
                      <option key={org._id || org.id} value={org._id || org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                  {survey.organization?.name && (
                    <p className="text-sm text-primary-600 mt-2">
                      Currently assigned to: <span className="font-medium">{survey.organization.name}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Questions Section */}
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-primary-200 pb-4">
                <div>
                  <h3 className="text-xl font-semibold text-primary-900">Survey Questions</h3>
                  <p className="text-sm text-primary-600 mt-1">Create and manage your survey questions</p>
                </div>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </button>
              </div>
              
              {survey.questions.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border-2 border-dashed border-primary-300">
                  <div className="text-primary-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-primary-900 mb-2">No questions yet</h4>
                  <p className="text-primary-600 mb-4">Add your first question to get started</p>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="btn-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Question
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {survey.questions.map((question, questionIndex) => (
                    <div key={questionIndex} className="bg-gradient-to-r from-white to-primary-50 p-6 rounded-xl shadow-lg border border-primary-200 hover:shadow-xl transition-all duration-300">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-full text-sm font-semibold">
                            {questionIndex + 1}
                          </div>
                          <h4 className="text-lg font-semibold text-primary-900">Question {questionIndex + 1}</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteQuestion(questionIndex)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete Question"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-primary-800 mb-2">Question Text</label>
                          <input
                            type="text"
                            value={question.text}
                            onChange={(e) => handleQuestionChange(questionIndex, 'text', e.target.value)}
                            className="w-full rounded-xl border-primary-300 bg-white/80 backdrop-blur-sm shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all duration-200"
                            placeholder="Enter your question"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-primary-800 mb-2">Question Type</label>
                            <select
                              value={question.question_type}
                              onChange={(e) => handleQuestionChange(questionIndex, 'question_type', e.target.value)}
                              className="w-full rounded-xl border-primary-300 bg-white/80 backdrop-blur-sm shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all duration-200"
                              required
                            >
                              <option value="">Select a question type</option>
                              <option value="text">Text Answer</option>
                              <option value="multiple_choice">Multiple Choice</option>
                              <option value="single_choice">Single Choice</option>
                            </select>
                          </div>

                          <div className="flex items-end">
                            <label className="flex items-center p-3 bg-gradient-to-r from-secondary-50 to-secondary-100 rounded-xl border border-secondary-200 w-full">
                              <input
                                type="checkbox"
                                checked={question.required}
                                onChange={(e) => handleQuestionChange(questionIndex, 'required', e.target.checked)}
                                className="h-4 w-4 rounded border-secondary-300 text-secondary-600 focus:ring-secondary-500"
                              />
                              <span className="ml-3 text-sm font-medium text-secondary-900">Required Question</span>
                            </label>
                          </div>
                        </div>

                        {(question.question_type === 'multiple_choice' || question.question_type === 'single_choice') && (
                          <div className="mt-6 p-4 bg-gradient-to-r from-accent-50 to-accent-100 rounded-xl border border-accent-200">
                            <div className="flex justify-between items-center mb-4">
                              <label className="block text-sm font-medium text-accent-800">Answer Choices</label>
                              <button
                                type="button"
                                onClick={() => addChoice(questionIndex)}
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-accent-700 bg-accent-200 hover:bg-accent-300 rounded-lg transition-all duration-200"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Choice
                              </button>
                            </div>
                            
                            {question.choices && question.choices.length > 0 ? (
                              <div className="space-y-3">
                                {question.choices.map((choice, choiceIndex) => (
                                  <div key={choiceIndex} className="flex items-center space-x-3">
                                    <div className="flex items-center justify-center w-6 h-6 bg-accent-600 text-white rounded-full text-xs font-medium">
                                      {choiceIndex + 1}
                                    </div>
                                    <input
                                      type="text"
                                      value={choice.text}
                                      onChange={(e) => handleChoiceChange(questionIndex, choiceIndex, e.target.value)}
                                      className="flex-1 rounded-lg border-accent-300 bg-white/80 backdrop-blur-sm shadow-sm focus:border-accent-500 focus:ring-accent-500 transition-all duration-200"
                                      placeholder={`Choice ${choiceIndex + 1}`}
                                      required
                                    />
                                    <button
                                      type="button"
                                      onClick={() => deleteChoice(questionIndex, choiceIndex)}
                                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                                      title="Delete Choice"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4 text-accent-600">
                                <p className="text-sm">No choices added yet. Click "Add Choice" to create options.</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-primary-200">
              <button
                type="button"
                onClick={() => navigate(`/dashboard/surveys/${id}`)}
                className="px-6 py-3 border border-primary-300 rounded-xl shadow-sm text-sm font-medium text-primary-700 bg-white hover:bg-gradient-subtle transition-all duration-300 transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SurveyEdit; 