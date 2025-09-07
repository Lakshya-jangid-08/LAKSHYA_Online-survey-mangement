import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const ThankYou = () => {
  return (
    <div className="min-h-screen bg-gradient-lakshya flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-secondary-100 to-secondary-200 mb-4">
            <CheckCircle className="h-8 w-8 text-secondary-600" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-800 to-accent-800 bg-clip-text text-transparent mb-2">
            Lakshya
          </h1>
          <h2 className="text-3xl font-extrabold text-primary-900">
            Thank You!
          </h2>
          <p className="mt-2 text-primary-700">
            Your response has been recorded successfully.
          </p>
        </div>
        <div className="mt-8 text-center">
          <div className="bg-white/90 backdrop-blur-sm py-6 px-4 shadow-xl border border-primary-200 rounded-2xl sm:px-8">
            <p className="text-sm text-primary-700 mb-4">
              We appreciate your time and feedback. Your responses help us improve our services.
            </p>
            <Link
              to="/"
              className="btn-primary"
            >
              Return to Lakshya
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou; 