import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OrganizationManager = () => {
  const [organizations, setOrganizations] = useState([]);
  const [newOrgName, setNewOrgName] = useState('');
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
      setOrganizations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setError('Failed to fetch organizations');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newOrgName.trim()) {
      setError('Organization name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/organizations/`, {
        name: newOrgName
      });

      // Add the new organization to the list
      setOrganizations([...organizations, response.data]);
      setNewOrgName('');
      setSuccessMessage('Organization created successfully!');
      setLoading(false);
    } catch (error) {
      console.error('Error creating organization:', error);
      setError(error.response?.data?.message || 'Failed to create organization');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Organization Manager</h1>
          <p className="text-gray-600 mb-4">
            Create and manage organizations for the survey system. Organizations are used to group users and surveys.
          </p>

          {/* Create Organization Form */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Create New Organization</h2>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
                {error}
              </div>
            )}
            
            {successMessage && (
              <div className="bg-green-50 text-green-700 p-3 rounded mb-4">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Organization Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter organization name"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {loading ? 'Creating...' : 'Create Organization'}
              </button>
            </form>
          </div>

          {/* Organizations List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Existing Organizations</h3>
            </div>
            {loading && !organizations.length ? (
              <div className="p-6 text-center text-gray-500">Loading organizations...</div>
            ) : organizations.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No organizations found. Create one above.</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {organizations.map((org) => (
                  <li key={org._id || org.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900">{org.name}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(org.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationManager;
