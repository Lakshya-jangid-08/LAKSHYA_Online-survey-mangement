import React, { useState } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const SurveyAnalyzer = () => {
  const navigate = useNavigate();
  const [columns, setColumns] = useState([]);
  const [plots, setPlots] = useState([]);
  const [groupByOutput, setGroupByOutput] = useState(null);
  const [csvUploadId, setCsvUploadId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisTitle, setAnalysisTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [description, setDescription] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    const text = await file.text();
    formData.append('csvText', text);

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/data-analysis/csv-uploads`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('File upload response:', response.data);
      setColumns(response.data.columns);
      setCsvUploadId(response.data.id);
      console.log("columns:", response.data.columns);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addPlot = () => {
    setPlots([...plots, { title: '', description: '', type: '', xAxis: '', yAxes: [], data: null }]);
  };

  const updatePlot = (index, field, value) => {
    const updatedPlots = [...plots];
    updatedPlots[index][field] = value;
    setPlots(updatedPlots);
  };

  const validatePlot = (plot) => {
    if (!plot.type) {
      setError('Please select a plot type.');
      return false;
    }

    if (plot.type === 'pie') {
      if (!plot.xAxis) {
        setError('x_axis is required for pie charts.');
        return false;
      }
      return true;
    }

    if (plot.type === 'heatmap') {
      if (!plot.xAxis || plot.yAxes.length === 0) {
        setError('x_axis and y_axes are required for heatmaps.');
        return false;
      }
      if (plot.yAxes.length > 2) {
        setError('Heatmap supports maximum 2 y_axes variables.');
        return false;
      }
      return true;
    }

    if (plot.type === 'box') {
      if (plot.yAxes.length === 0) {
        setError('At least one y_axis is required for box plots.');
        return false;
      }
      return true;
    }

    if (!plot.xAxis || plot.yAxes.length === 0) {
      setError('x_axis and y_axes are required for this plot type.');
      return false;
    }

    return true;
  };

  const generatePlot = async (index) => {
    const plot = plots[index];
    if (!plot.type || !csvUploadId) {
      setError('Please select a plot type and upload a file.');
      return;
    }

    if (!validatePlot(plot)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/data-analysis/plot-data`, {
        plot_type: plot.type,
        x_axis: plot.xAxis,
        y_axis: plot.yAxes,
        id: csvUploadId,
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Plot data response:', response.data);
      if (response.data.error) {
        setError(response.data.error);
        return;
      }

      const updatedPlots = [...plots];
      updatedPlots[index].data = response.data;
      setPlots(updatedPlots);
    } catch (err) {
      console.error('Error generating plot:', err);
      setError(err.response?.data?.error || 'Failed to generate plot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateGroupBy = async (columns) => {
    if (!columns.length || !csvUploadId) {
      setError('Please select at least one column and upload a file.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/data-analysis/groupby`, {
        columns,
        csv_upload_id: csvUploadId,
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      setGroupByOutput(response.data);
    } catch (err) {
      console.error('Error generating groupby output:', err);
      setError('Failed to generate groupby output. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveAnalysis = async () => {
    if (!analysisTitle || !authorName) {
      setError('Please provide a title and author name for the analysis.');
      return;
    }
    
    if (plots.length === 0) {
      setError('You need at least one plot to save an analysis.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Enhanced validation and preparation for plots data
      const plotsWithData = plots.map(plot => {
        if (!plot.type) {
          throw new Error(`One of your plots is missing a type. Please check all plots.`);
        }
        
        if (!plot.data || (Array.isArray(plot.data) && plot.data.length === 0)) {
          throw new Error(`One of your plots (${plot.title || 'Untitled Plot'}) is missing data.`);
        }
        
        return {
          title: plot.title || 'Untitled Plot',
          description: plot.description || '',
          type: plot.type,
          configuration: {
            xAxis: plot.xAxis || '',
            yAxes: plot.yAxes || [],
            ...(plot.configuration || {})
          },
          data: plot.data
        };
      });

      await axios.post(`${import.meta.env.VITE_BASE_URL}/api/data-analysis/analyses`, {
        title: analysisTitle,
        author_name: authorName,
        description,
        plots: plotsWithData,
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Show success message using toast instead of alert
      toast.success('Analysis saved successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving analysis:', err);
      
      // Better error message handling
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          'Failed to save analysis. Please try again.';
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const publishAnalysis = async () => {
    if (!analysisTitle || !authorName) {
      setError('Please provide a title and author name for the analysis.');
      return;
    }

    if (plots.length === 0) {
      setError('Please create at least one plot before publishing.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First save the analysis if not already saved
      const saveResponse = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/data-analysis/analyses`,
        {
          title: analysisTitle,
          author_name: authorName,
          description,
          plots: plots.map(plot => ({
            title: plot.title || 'Untitled Plot',
            description: plot.description || '',
            data: plot.data
          })),
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!saveResponse.data || !saveResponse.data.id) {
        throw new Error('Failed to save analysis. Please try again.');
      }

      // Then publish the analysis to get the PDF
      const publishResponse = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/data-analysis/publish-analysis`,
        { analysis_id: saveResponse.data.id },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
          },
          responseType: 'blob'
        }
      );

      // Check if the response is a PDF
      if (publishResponse.headers['content-type'] !== 'application/pdf') {
        // Try to parse the error message if it's not a PDF
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            setError(errorData.error || 'Failed to generate PDF. Please try again.');
          } catch (e) {
            setError('Failed to generate PDF. Please try again.');
          }
        };
        reader.readAsText(publishResponse.data);
        return;
      }

      // Create and download the PDF
      const blob = new Blob([publishResponse.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${analysisTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Error publishing analysis:', err);
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.data instanceof Blob) {
          // Try to read the error message from the blob
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result);
              setError(errorData.error || 'Failed to publish analysis. Please try again.');
            } catch (e) {
              setError('Failed to publish analysis. Please try again.');
            }
          };
          reader.readAsText(err.response.data);
        } else {
          setError(err.response.data.error || 'Failed to publish analysis. Please try again.');
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your internet connection and try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-card border border-primary-200 shadow-lg rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900">1. Upload CSV File</h2>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="mt-4 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        {loading && <p className="mt-2 text-sm text-gray-500">Loading...</p>}
      </div>

      <div className="bg-gradient-card border border-primary-200 shadow-lg rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900">2. Analysis Details</h2>
        <input
          type="text"
          placeholder="Analysis Title"
          value={analysisTitle}
          onChange={(e) => setAnalysisTitle(e.target.value)}
          className="mt-4 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        />
        <input
          type="text"
          placeholder="Author Name"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="mt-4 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-4 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        />
      </div>

      {columns.length > 0 && (
        <div className="bg-gradient-card border border-primary-200 shadow-lg rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900">3. GroupBy Function</h2>
          <label className="block text-sm font-medium text-gray-700 mt-4">Select Columns (Multiple)</label>
          <select
            multiple
            onChange={(e) => generateGroupBy(Array.from(e.target.selectedOptions, option => option.value))}
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            {columns.map((col) => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
          {groupByOutput && (
            <div className="mt-4 space-y-4">
              {Object.entries(groupByOutput).map(([column, data]) => (
                <div key={column} className="bg-gray-100 p-4 rounded-lg">
                  <h3 className="text-md font-medium text-gray-900">GroupBy: {column}</h3>
                  <table className="min-w-full mt-2 border border-gray-300">
                    <thead>
                      <tr>
                        {Object.keys(data[0]).map((key) => (
                          <th key={key} className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-gray-700">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {Object.values(row).map((value, colIndex) => (
                            <td key={colIndex} className="px-4 py-2 border border-gray-300 text-sm text-gray-700">{value}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {columns.length > 0 && (
        <div className="bg-gradient-card border border-primary-200 shadow-lg rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900">3. Create Plots</h2>
          <button
            onClick={addPlot}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
          >
            Add Plot
          </button>

          {plots.map((plot, index) => (
            <div key={index} className="mt-6 p-4 border rounded-lg">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Plot Type</label>
                  <select
                    value={plot.type}
                    onChange={(e) => updatePlot(index, 'type', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="">Select Plot Type</option>
                    <option value="scatter">Scatter Plot</option>
                    <option value="bar">Bar Chart</option>
                    <option value="line">Line Chart</option>
                    <option value="area">Area Chart</option>
                    <option value="pie">Pie Chart</option>
                    <option value="heatmap">Heatmap</option>
                    <option value="box">Box Plot</option>
                  </select>
                </div>

                {plot.type && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {plot.type === 'heatmap' ? 'Row Variable (X-Axis)' : 'X-Axis'}
                      </label>
                      <select
                        value={plot.xAxis}
                        onChange={(e) => updatePlot(index, 'xAxis', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="">Select {plot.type === 'heatmap' ? 'Row Variable' : 'X-Axis'}</option>
                        {columns.map((col) => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    {plot.type !== 'pie' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {plot.type === 'heatmap' ? 'Column Variable(s) (Y-Axis)' : 'Y-Axes (Multiple)'}
                        </label>
                        <select
                          multiple
                          value={plot.yAxes}
                          onChange={(e) => updatePlot(index, 'yAxes', Array.from(e.target.selectedOptions, option => option.value))}
                          className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        >
                          {columns.map((col) => (
                            <option key={col} value={col}>{col}</option>
                          ))}
                        </select>
                        {plot.type === 'heatmap' && (
                          <p className="mt-1 text-sm text-gray-500">
                            Select 1-2 variables for the heatmap. First variable will be used for values.
                          </p>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => generatePlot(index)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
                    >
                      Generate Plot
                    </button>

                    {plot.data && (
                      <div className="mt-4">
                        <Plot
                          data={plot.data.data}
                          layout={{
                            ...plot.data.layout,
                            autosize: true,
                            margin: { l: 50, r: 50, t: 50, b: 50 }
                          }}
                          style={{ width: '100%', height: '500px' }}
                          config={{ responsive: true }}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-gradient-card border border-primary-200 shadow-lg rounded-lg p-6">
        <button
          onClick={saveAnalysis}
          disabled={loading}
          className={`mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : "Save Analysis"}
        </button>
      </div>
    </div>
  );
};

export default SurveyAnalyzer;