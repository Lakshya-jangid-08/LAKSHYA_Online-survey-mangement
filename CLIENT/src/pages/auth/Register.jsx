import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    organization: ''
  });
  const [organizations, setOrganizations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/organizations/`);
      console.log('Organizations fetched:', response.data);
      setOrganizations(response.data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setError('Failed to fetch organizations. Please try again later.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      console.log('Sending registration data:', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password2: formData.confirmPassword,
        organization_id: formData.organization || null
      });
      
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/auth/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password2: formData.confirmPassword,
        organization_id: formData.organization || null
      });

      if (response.data) {
        console.log('Registration successful:', response.data);
        navigate('/login');
      }
    } catch (error) {
      if (error.response?.status === 400) {
        const errorDetails = error.response.data;
        console.error('Registration failed:', errorDetails);

        // Display specific error messages to the user
        if (errorDetails.username) {
          setError(`Username error: ${errorDetails.username.join(' ')}`);
        } else if (errorDetails.email) {
          setError(`Email error: ${errorDetails.email.join(' ')}`);
        } else if (errorDetails.password) {
          setError(`Password error: ${errorDetails.password.join(' ')}`);
        } else if (errorDetails.organization_id) {
          setError(`Organization error: ${errorDetails.organization_id.join(' ')}`);
        } else {
          setError('Registration failed. Please check your input and try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-lakshya py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-800 to-accent-800 bg-clip-text text-transparent mb-2">
            Lakshya
          </h1>
          <h2 className="text-2xl font-extrabold text-primary-900">
            Create your account
          </h2>
        </div>
        <div className="bg-white/90 backdrop-blur-sm py-8 px-6 shadow-xl border border-primary-200 rounded-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-primary-800">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-primary-300 rounded-lg shadow-sm placeholder-primary-400 text-primary-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white/80 backdrop-blur-sm transition-all duration-200 sm:text-sm"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-primary-800">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-primary-300 rounded-lg shadow-sm placeholder-primary-400 text-primary-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white/80 backdrop-blur-sm transition-all duration-200 sm:text-sm"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-primary-800">
                  Organization
                </label>
                <select
                  id="organization"
                  name="organization"
                  className="mt-1 block w-full px-3 py-2 border border-primary-300 rounded-lg shadow-sm text-primary-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white/80 backdrop-blur-sm transition-all duration-200 sm:text-sm"
                  value={formData.organization}
                  onChange={handleChange}
                >
                  <option value="">Select Organization</option>
                  {organizations.length > 0 ? (
                    organizations.map((org) => (
                      <option key={org.id || org._id} value={org.id || org._id}>
                        {org.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Loading organizations...</option>
                  )}
                </select>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-primary-800">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-primary-300 rounded-lg shadow-sm placeholder-primary-400 text-primary-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white/80 backdrop-blur-sm transition-all duration-200 sm:text-sm"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary-800">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-primary-300 rounded-lg shadow-sm placeholder-primary-400 text-primary-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white/80 backdrop-blur-sm transition-all duration-200 sm:text-sm"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-primary-700">
                Don't see your organization? 
                <a href="/organizations" className="font-medium text-primary-600 hover:text-primary-500 ml-1 transition-colors">
                  Add a new organization
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;