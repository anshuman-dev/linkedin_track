import React from 'react';

const MagicLinkSent = ({ email, onBackToLogin }) => {
  return (
    <div className="max-w-md mx-auto">
      <div className="card text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📧</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
        </div>

        <div className="space-y-4 text-gray-600">
          <p>
            We've sent a secure login link to:
          </p>
          <p className="font-semibold text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
            {email}
          </p>
          <p className="text-sm">
            Click the link in your email to access the LinkedIn Tracker dashboard.
            The link will expire in <strong>15 minutes</strong> for security.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm">
            💡 <strong>Tip:</strong> Check your spam folder if you don't see the email
          </div>
          
          <button
            onClick={onBackToLogin}
            className="w-full btn btn-secondary text-sm"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default MagicLinkSent;