import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import ChatUploader from '../components/upload/ChatUploader';

const Upload = () => {
  const navigate = useNavigate();
  const [uploadResult, setUploadResult] = useState(null);

  const handleUploadComplete = (result) => {
    setUploadResult(result);
  };

  const handleViewReport = () => {
    if (uploadResult?.reportId) {
      navigate(`/reports/${uploadResult.reportId}`);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Upload Chat Export</h1>
          <p className="mt-2 text-gray-600">
            Process your weekly WhatsApp group chat to track LinkedIn compliance
          </p>
        </div>

        {!uploadResult ? (
          <ChatUploader onUploadComplete={handleUploadComplete} />
        ) : (
          <div className="card text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Processing Complete!</h2>
              <p className="mt-2 text-gray-600">Your chat has been successfully analyzed</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">📊 Processing Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-700">Total Messages</div>
                  <div className="text-2xl font-bold text-primary">
                    {uploadResult.summary?.totalMessages || 0}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">LinkedIn Posts</div>
                  <div className="text-2xl font-bold text-success">
                    {uploadResult.summary?.linkedinPosts || 0}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Members Posted</div>
                  <div className="text-2xl font-bold text-warning">
                    {uploadResult.summary?.membersPosted || 0}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Total Reactions</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {uploadResult.summary?.totalReactions || 0}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-6">
              <p>
                <strong>Week:</strong> {uploadResult.summary?.weekStart} to {uploadResult.summary?.weekEnd}
              </p>
              <p>
                <strong>Report ID:</strong> #{uploadResult.reportId}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleViewReport}
                className="w-full btn btn-primary"
              >
                📊 View Detailed Report
              </button>
              <button
                onClick={() => setUploadResult(null)}
                className="w-full btn btn-secondary"
              >
                📤 Upload Another Chat
              </button>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">💡 Tips for Best Results</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <span>✓</span>
              <span>Make sure all group members are added to the Members section first</span>
            </div>
            <div className="flex items-start space-x-2">
              <span>✓</span>
              <span>Export chat "Without Media" to keep file size manageable</span>
            </div>
            <div className="flex items-start space-x-2">
              <span>✓</span>
              <span>Use consistent date ranges (Monday to Sunday works well)</span>
            </div>
            <div className="flex items-start space-x-2">
              <span>✓</span>
              <span>The parser will automatically detect LinkedIn URLs and supportive reactions</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Upload;