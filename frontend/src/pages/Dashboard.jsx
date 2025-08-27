import React from 'react';
import Layout from '../components/common/Layout';

const Dashboard = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">LinkedIn posting compliance overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card text-center">
            <div className="text-3xl font-bold text-gray-900">18</div>
            <div className="text-gray-600">Members</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-success">5</div>
            <div className="text-gray-600">Posted</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary">72%</div>
            <div className="text-gray-600">Compliant</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-warning">4</div>
            <div className="text-gray-600">At Risk</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => window.location.href = '/upload'}
              className="btn btn-primary"
            >
              📤 Upload Chat Export
            </button>
            <button 
              onClick={() => window.location.href = '/members'}
              className="btn btn-secondary"
            >
              👥 Manage Members
            </button>
            <button className="btn btn-secondary">
              📊 View Reports
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="text-gray-500 text-center py-8">
            No recent uploads. Upload a WhatsApp chat export to get started.
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;