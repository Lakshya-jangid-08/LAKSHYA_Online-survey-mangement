import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Download, BarChart2, PieChart, List } from 'lucide-react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { toast } from 'react-toastify';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const SurveyResponses = () => {
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'individual'
  const [tableView, setTableView] = useState(false); // New state for table view
  const [questionStats, setQuestionStats] = useState({});

  useEffect(() => {
    fetchSurveyAndResponses();
  }, [id]);

  const fetchSurveyAndResponses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch survey details
      const surveyResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/surveys/${id}/`, { headers });
      setSurvey(surveyResponse.data);

      // Fetch survey responses
      const responsesResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/survey-responses/?survey=${id}`, { headers });
      setResponses(responsesResponse.data);

      // Calculate question statistics
      calculateQuestionStats(surveyResponse.data.questions, responsesResponse.data);

      console.log('Survey Questions:', surveyResponse.data.questions);
      surveyResponse.data.questions.forEach((question) => {
        console.log(`Choices for Question ${question.id}:`, question.choices);
      });
    } catch (error) {
      console.error('Error fetching survey responses:', error);
      setError(error.response?.data?.detail || 'Failed to load survey responses');
    } finally {
      setLoading(false);
    }
  };

  const calculateQuestionStats = (questions, responses) => {
    console.log("Debugging calculateQuestionStats:");
    console.log("Questions:", questions);
    console.log("Responses:", responses);

    if (!questions || !Array.isArray(questions)) {
      console.error("Questions are undefined or not an array.");
      return;
    }

    if (!responses || !Array.isArray(responses)) {
      console.error("Responses are undefined or not an array.");
      return;
    }

    const stats = {};

    questions.forEach((question) => {
      // Use both id and _id for compatibility
      const questionId = question.id || question._id;
      console.log(`Processing question ID ${questionId}:`, question);

      if ((question.question_type === 'text') || (question.questionType === 'text')) {
        stats[questionId] = {
          type: 'text',
          total: responses.filter((r) =>
            r.answers?.some((a) => 
              (a.question === questionId) && 
              (a.text_answer || a.textAnswer)
            )
          ).length,
        };
      } else {
        const choiceCounts = {};
        question.choices?.forEach((choice) => {
          const choiceId = choice.id || choice._id;
          choiceCounts[choiceId] = 0;
        });

        responses.forEach((response) => {
          const answer = response.answers?.find((a) => a.question === questionId);
          if (answer) {
            // Handle both naming conventions
            const selectedChoices = answer.selected_choices || answer.selectedChoices || [];
            selectedChoices.forEach((choiceId) => {
              if (choiceCounts.hasOwnProperty(choiceId)) {
                choiceCounts[choiceId] = (choiceCounts[choiceId] || 0) + 1;
              } else {
                console.warn(`Choice ID ${choiceId} not found in question choices.`);
              }
            });
          }
        });

        stats[questionId] = {
          type: question.question_type || question.questionType,
          choices: question.choices?.map((choice) => {
            const choiceId = choice.id || choice._id;
            return {
              id: choiceId,
              text: choice.text,
              count: choiceCounts[choiceId] || 0,
            };
          }) || [],
          total: Object.values(choiceCounts).reduce((sum, count) => sum + count, 0),
        };

        console.log(`Stats for question ID ${question.id}:`, stats[question.id]);
      }
    });

    setQuestionStats(stats);
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'Date unavailable';
    }
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  const exportToCSV = () => {
    if (!survey || !responses.length) return;
    
    setLoading(true);
    toast.info('Preparing CSV export...');

    try {
      // Create CSV header with Response ID, Submission Date, and question texts
      const csvHeaders = ['Response ID', 'Submission Date', 'Year','Time', ...survey.questions.map(q => q.text)].join(',');

      // Create CSV rows with Response ID and answers
      const csvRows = responses.map(response => {
        const responseId = response.id || response._id; 
        const submissionDate = formatDate(response.submitted_at || response.submittedAt);
        
        const answers = survey.questions.map(question => {
          const questionId = question.id || question._id;
          const answer = response.answers.find(a => 
            a.question === questionId || 
            a.question === question.id || 
            a.question === question._id
          );
          
          if (!answer) return ''; // No answer provided

          if (answer.text_answer || answer.textAnswer) {
            // Escape quotes and handle CSV formatting
            return `"${(answer.text_answer || answer.textAnswer || '').replace(/"/g, '""')}"`;
          } else if ((answer.selected_choices && answer.selected_choices.length) || 
                     (answer.selectedChoices && answer.selectedChoices.length)) {
            
            const choices = answer.selected_choices || answer.selectedChoices || [];
            const choiceTexts = choices.map(choiceId => {
              const choice = question.choices.find(c => c.id === choiceId || c._id === choiceId);
              return choice ? choice.text : '';
            }).filter(Boolean);
            
            // Escape quotes and join multiple choices with a semicolon
            return `"${choiceTexts.join('; ').replace(/"/g, '""')}"`;
          }
          return ''; // No valid answer
        }).join(',');

        return `${responseId},${submissionDate},${answers}`; 
      });

      // Combine header and rows
      const csvContent = [csvHeaders, ...csvRows].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${survey.title.replace(/\s+/g, '_')}_responses.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('CSV export completed successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV. Please try again.');
    } finally {
      setLoading(false);
    }
};

  const renderQuestionSummary = (question) => {
    const questionId = question.id || question._id;
    const stats = questionStats[questionId];
    if (!stats) {
      console.warn(`No stats found for question ID ${questionId}:`, question);
      return null;
    }

    console.log(`Rendering responses for question ID ${questionId}:`, stats);

    if (stats.type === 'text') {
      return (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900">Text Responses ({stats.total})</h4>
          <div className="mt-2 bg-gradient-subtle p-4 rounded-lg max-h-60 overflow-y-auto">
            {responses.map((response) => {
              const answer = response.answers.find((a) => a.question === questionId);
              const textAnswer = answer?.text_answer || answer?.textAnswer;
              return textAnswer ? (
                <div key={response.id || response._id} className="mb-2 p-2 bg-white rounded border border-gray-200">
                  <p className="text-sm">{textAnswer}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {response.respondent || 'Anonymous'} • {formatDate(response.submitted_at || response.submittedAt)}
                  </p>
                </div>
              ) : null;
            })}
          </div>
        </div>
      );
    }

    // For choice questions, display raw data
    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-900">Raw Responses ({stats.total} responses)</h4>
        <div className="mt-2 bg-gradient-subtle p-4 rounded-lg max-h-60 overflow-y-auto">
          {responses.map((response) => {
            const answer = response.answers.find((a) => a.question === questionId);
            return answer ? (
              <div key={response.id || response._id} className="mb-2 p-2 bg-white rounded border border-gray-200">
                <p className="text-sm">
                  {(answer.selected_choices?.length > 0 || answer.selectedChoices?.length > 0)
                    ? (answer.selected_choices || answer.selectedChoices || []).map((choiceId, index) => {
                        // Find choice by either id or _id
                        const choice = question.choices?.find((c) => (c.id === choiceId || c._id === choiceId));
                        if (!choice) {
                          console.warn(`Choice ID ${choiceId} not found in question choices.`, {
                            questionId: questionId,
                            questionText: question.text,
                            choices: question.choices,
                          });
                        }
                        return choice ? choice.text : `Choice ID ${choiceId} (not found in question choices)`;
                      }).join(', ')
                    : 'No choices selected'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {response.respondent || 'Anonymous'} • {formatDate(response.submitted_at || response.submittedAt)}
                </p>
              </div>
            ) : null;
          })}
        </div>
      </div>
    );
  };

  const renderTableView = () => {
    if (!survey || !responses.length) return null;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Response ID</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">Submitted At</th>
              {survey.questions.map((question) => (
                <th key={question.id} className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                  {question.text}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {responses.map((response) => (
              <tr key={response.id}>
                <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">{response.id}</td>
                <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">{formatDate(response.submitted_at)}</td>
               
                {survey.questions.map((question) => {
                  const answer = response.answers.find((a) => a.question === question.id);
                  return (
                    <td key={question.id} className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                      {answer
                        ? answer.text_answer ||
                          (answer.selected_choices &&
                            answer.selected_choices
                              .map((choiceId) => {
                                const choice = question.choices.find((c) => c.id === choiceId);
                                return choice ? choice.text : '';
                              })
                              .filter(Boolean)
                              .join('; '))
                        : 'No answer provided'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="text-gray-500">Loading responses...</div>
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <Link
            to={`/dashboard/surveys/${id}`}
            className="inline-flex items-center text-primary-600 hover:text-primary-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Survey
          </Link>
          <div className="flex space-x-3">
            <button
              onClick={() => setViewMode('summary')}
              className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-lg ${viewMode === 'summary' ? 'bg-primary-100 border-primary-300 text-primary-700' : 'border-gray-300 text-gray-700 bg-white hover:bg-gradient-subtle'}`}
            >
              <BarChart2 className="h-4 w-4 mr-1" />
              Summary
            </button>
            <button
              onClick={() => setViewMode('individual')}
              className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-lg ${viewMode === 'individual' ? 'bg-primary-100 border-primary-300 text-primary-700' : 'border-gray-300 text-gray-700 bg-white hover:bg-gradient-subtle'}`}
            >
              <List className="h-4 w-4 mr-1" />
              Individual
            </button>
            <button
              onClick={() => setTableView(!tableView)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gradient-subtle"
            >
              <BarChart2 className="h-4 w-4 mr-1" />
              {tableView ? 'Hide Table' : 'View Table'}
            </button>
            {responses.length > 0 && (
              <button
                onClick={exportToCSV}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gradient-subtle"
              >
                <Download className="h-4 w-4 mr-1" />
                Export to CSV
              </button>
            )}
          </div>
        </div>

        <div className="bg-gradient-card border border-primary-200 shadow-lg overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {survey.title} - Responses
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {responses.length} {responses.length === 1 ? 'response' : 'responses'} received
            </p>
          </div>
        </div>

        {responses.length === 0 ? (
          <div className="bg-gradient-card border border-primary-200 shadow-lg overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <p className="text-gray-500 text-center">No responses yet for this survey.</p>
            </div>
          </div>
        ) : tableView ? (
          renderTableView()
        ) : viewMode === 'summary' ? (
          <div className="space-y-8">
            {survey.questions.map(question => (
              <div key={question.id} className="bg-gradient-card border border-primary-200 shadow-lg overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg font-medium text-gray-900">{question.text}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {question.question_type} • {questionStats[question.id]?.total || 0} responses
                  </p>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  {renderQuestionSummary(question)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gradient-card border border-primary-200 shadow-lg overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {responses.map((response) => (
                <li key={response.id || response._id} className="px-4 py-5 sm:px-6">
                  <div className="mb-4">
                    <div className="flex justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Response ID: </span>
                        <span className="text-sm text-gray-900">{response.id || response._id}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Submitted: </span>
                        <span className="text-sm text-gray-900">{formatDate(response.submitted_at || response.submittedAt)}</span>
                      </div>
                    </div>
                    {response.respondent && (
                      <div className="mt-1">
                        <span className="text-sm font-medium text-gray-500">Respondent: </span>
                        <span className="text-sm text-gray-900">{
                          typeof response.respondent === 'object' 
                            ? response.respondent.email 
                            : response.respondent
                        }</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 space-y-4">
                    {survey.questions.map((question) => {
                      const questionId = question.id || question._id;
                      const answer = response.answers.find(a => 
                        a.question === questionId || a.question === question.id || a.question === question._id
                      );
                      return (
                        <div key={questionId} className="border-t border-gray-100 pt-4">
                          <h4 className="text-sm font-medium text-gray-900">{question.text}</h4>
                          <div className="mt-1 text-sm text-gray-500">
                            {answer ? (
                              answer.text_answer || answer.textAnswer ? (
                                <p>{answer.text_answer || answer.textAnswer}</p>
                              ) : (answer.selected_choices || answer.selectedChoices) && 
                                  (answer.selected_choices?.length > 0 || answer.selectedChoices?.length > 0) ? (
                                <ul className="list-disc list-inside">
                                  {(answer.selected_choices || answer.selectedChoices || []).map((choiceId) => {
                                    const choice = question.choices.find(c => 
                                      c.id === choiceId || c._id === choiceId
                                    );
                                    return choice ? <li key={choiceId}>{choice.text}</li> : null;
                                  })}
                                </ul>
                              ) : (
                                <p>No answer provided</p>
                              )
                            ) : (
                              <p>No answer provided</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveyResponses;