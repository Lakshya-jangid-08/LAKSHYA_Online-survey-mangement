import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const OrganizationManagement = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [newOrganization, setNewOrganization] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/organizations/`);
      console.log('Organizations fetched:', response.data);
      setOrganizations(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setError('Failed to fetch organizations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newOrganization.trim()) {
      setError('Organization name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/organizations`, {
        name: newOrganization
      });

      console.log('Organization created:', response.data);
      setSuccessMessage(`Organization "${newOrganization}" created successfully!`);
      setNewOrganization('');
      fetchOrganizations();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error creating organization:', error);
      
      if (error.response?.status === 400 && error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to create organization. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
            Organization Management
          </h2>
          <p className="text-gray-600 mb-8">
            Create new organizations or view existing ones.
          </p>
        </div>

        <div className="bg-gradient-card border border-primary-200 shadow-lg rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Organization</h3>
          {error && (
            <div className="rounded-lg bg-red-50 p-4 mb-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          {successMessage && (
            <div className="rounded-lg bg-green-50 p-4 mb-4">
              <div className="text-sm text-green-700">{successMessage}</div>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="flex gap-4">
              <input
                type="text"
                className="flex-1 appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Organization Name"
                value={newOrganization}
                onChange={(e) => setNewOrganization(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-gradient-card border border-primary-200 shadow-lg rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Existing Organizations</h3>
          {loading ? (
            <p>Loading organizations...</p>
          ) : organizations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Name</th>
                    <th className="py-2 px-4 border-b text-left">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {organizations.map((org) => (
                    <tr key={org.id || org._id}>
                      <td className="py-2 px-4 border-b">{org.name}</td>
                      <td className="py-2 px-4 border-b">
                        {new Date(org.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No organizations found.</p>
          )}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/register')}
            className="text-blue-500 hover:text-blue-700"
          >
            Back to Registration
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationManagement;
