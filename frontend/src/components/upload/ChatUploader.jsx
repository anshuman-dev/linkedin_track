import React, { useState, useCallback } from 'react';
import { api } from '../../utils/api';

const ChatUploader = ({ onUploadComplete }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [weekStart, setWeekStart] = useState('');
  const [weekEnd, setWeekEnd] = useState('');

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (file) => {
    if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
      setError('Please upload a .txt file (WhatsApp chat export)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size too large. Please upload a file smaller than 10MB.');
      return;
    }

    setSelectedFile(file);
    setError('');
    
    // Auto-set current week if dates are empty
    if (!weekStart || !weekEnd) {
      const today = new Date();
      const monday = new Date(today);
      monday.setDate(today.getDate() - today.getDay() + 1);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      setWeekStart(monday.toISOString().split('T')[0]);
      setWeekEnd(sunday.toISOString().split('T')[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    if (!weekStart || !weekEnd) {
      setError('Please select the week date range');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('chatFile', selectedFile);
      formData.append('weekStart', weekStart);
      formData.append('weekEnd', weekEnd);

      const result = await api.reports.upload(formData);
      onUploadComplete(result);
      
      // Reset form
      setSelectedFile(null);
      setWeekStart('');
      setWeekEnd('');
    } catch (error) {
      setError(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">📤 Upload Weekly Chat Export</h2>
        <p className="mt-2 text-gray-600">
          Upload your WhatsApp group chat export to analyze LinkedIn posting compliance
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-blue-50'
              : selectedFile
              ? 'border-green-300 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".txt"
            onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="space-y-2">
            {selectedFile ? (
              <>
                <div className="text-4xl">✅</div>
                <p className="text-lg font-medium text-green-700">File Selected</p>
                <p className="text-gray-600">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </>
            ) : (
              <>
                <div className="text-4xl text-gray-400">📁</div>
                <p className="text-lg font-medium text-gray-900">
                  Drop WhatsApp chat file here
                </p>
                <p className="text-gray-600">or click to browse</p>
                <p className="text-sm text-gray-500">
                  Supported: .txt files (up to 10MB)
                </p>
              </>
            )}
          </div>
        </div>

        {/* Date Range Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📅 Week Start Date
            </label>
            <input
              type="date"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📅 Week End Date
            </label>
            <input
              type="date"
              value={weekEnd}
              onChange={(e) => setWeekEnd(e.target.value)}
              className="input"
              required
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">📋 How to export WhatsApp chat:</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Open your WhatsApp group</li>
            <li>2. Tap group name → Export chat</li>
            <li>3. Choose "Without Media"</li>
            <li>4. Save the .txt file and upload it here</li>
          </ol>
        </div>

        <button
          type="submit"
          disabled={!selectedFile || uploading}
          className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing Chat...
            </div>
          ) : (
            '🔄 Process Chat Export'
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatUploader;