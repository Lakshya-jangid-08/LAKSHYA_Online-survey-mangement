import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Edit, DownloadCloud, Trash2 } from 'lucide-react';
import Plot from 'react-plotly.js';

const SavedAnalysis = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPlots, setExpandedPlots] = useState({});

  useEffect(() => {
    fetchSavedAnalyses();
  }, []);

  const fetchSavedAnalyses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/data-analysis/analyses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Initialize expanded state for plots
      const initialExpandedState = {};
      response.data.forEach(analysis => {
        initialExpandedState[analysis._id] = false;
      });
      
      setExpandedPlots(initialExpandedState);
      setAnalyses(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching saved analyses:', err);
      setError('Failed to load saved analyses. Please try again.');
      setLoading(false);
    }
  };

  const toggleAnalysisPlots = (analysisId) => {
    setExpandedPlots(prev => ({
      ...prev,
      [analysisId]: !prev[analysisId]
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this analysis?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/data-analysis/analyses/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Refresh the list after deletion
      fetchSavedAnalyses();
    } catch (err) {
      console.error('Error deleting analysis:', err);
      setError('Failed to delete analysis. Please try again.');
    }
  };

  const handleDownload = async (id, title) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/data-analysis/publish-analysis`,
        { analysis_id: id },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          responseType: 'blob'
        }
      );
      
      // Create and download the PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Error downloading analysis:', err);
      setError('Failed to download analysis. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    // Check if the date is valid
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString(undefined, options);
  };

  const renderPlots = (analysis) => {
    if (!expandedPlots[analysis._id] || !analysis.plots || analysis.plots.length === 0) {
      return null;
    }

    return (
      <div className="mt-4 space-y-6 px-4 py-4 bg-gradient-subtle rounded-lg">
        <h4 className="font-medium text-gray-700">Plots</h4>
        {analysis.plots.map((plot, plotIndex) => {
          if (!plot.data) {
            return (
              <div key={plotIndex} className="p-4 bg-white border border-gray-200 rounded-lg">
                <p className="text-gray-500 italic">Plot data unavailable</p>
              </div>
            );
          }

          return (
            <div key={plotIndex} className="p-4 bg-white border border-gray-200 rounded-lg">
              <h5 className="font-medium text-gray-800">{plot.title || 'Untitled Plot'}</h5>
              {plot.description && (
                <p className="text-sm text-gray-600 mb-3">{plot.description}</p>
              )}
              <div className="mt-2">
                <Plot
                  data={plot.data.data || []} 
                  layout={{
                    ...plot.data.layout || {},
                    autosize: true,
                    height: 400,
                    margin: { l: 50, r: 50, t: 50, b: 50 },
                    title: plot.title
                  }}
                  style={{ width: '100%' }}
                  config={{ responsive: true }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Saved Analyses</h1>
        <Link
          to="/dashboard/survey-analyzer"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
        >
          New Analysis
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {analyses.length === 0 ? (
        <div className="bg-gradient-card border border-primary-200 shadow-lg overflow-hidden sm:rounded-lg p-6 text-center">
          <p className="text-gray-500">No saved analyses found. Create a new analysis to get started!</p>
        </div>
      ) : (
        <div className="bg-gradient-card border border-primary-200 shadow-lg overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {analyses.map((analysis) => (
              <li key={analysis._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      <button 
                        onClick={() => toggleAnalysisPlots(analysis._id)}
                        className="hover:text-primary-600 focus:outline-none flex items-center"
                      >
                        <span>{analysis.title}</span>
                        <span className="ml-2 text-xs">
                          {expandedPlots[analysis._id] ? '(hide plots)' : '(show plots)'}
                        </span>
                      </button>
                    </h3>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span>By {analysis.authorName || analysis.author_name || 'Unknown Author'}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(analysis.createdAt || analysis.created_at)}</span>
                    </div>
                    {analysis.description && (
                      <p className="mt-2 text-sm text-gray-600">{analysis.description}</p>
                    )}
                    <div className="mt-2">
                      <span className="text-sm text-gray-500">
                        {analysis.plots?.length || 0} {analysis.plots?.length === 1 ? 'plot' : 'plots'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    
                    <Link
                      to={`/edit-analysis/${analysis._id}`}
                      className="inline-flex items-center p-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gradient-subtle"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(analysis._id)}
                      className="inline-flex items-center p-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Render plots if expanded */}
                {renderPlots(analysis)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SavedAnalysis;
