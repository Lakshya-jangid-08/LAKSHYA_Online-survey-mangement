import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';

const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-lakshya flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-800 to-accent-800 bg-clip-text text-transparent mb-2">
            Lakshya
          </h1>
          <h2 className="text-2xl font-extrabold text-primary-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-primary-700">
            Or{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
              create a new account
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/90 backdrop-blur-sm py-8 px-4 shadow-xl border border-primary-200 rounded-2xl sm:px-10">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login; 