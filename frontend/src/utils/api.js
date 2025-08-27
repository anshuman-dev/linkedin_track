import { auth } from './auth.js';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const request = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...auth.getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(data.error || 'Request failed', response.status);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error', 0);
  }
};

export const api = {
  auth: {
    sendOTP: (email) => request('/send-otp', {
      method: 'POST',
      body: { email },
    }),

    verifyOTP: (email, otp) => request('/verify-otp', {
      method: 'POST',
      body: { email, otp },
    }),
  },

  members: {
    list: () => request('/members'),
    create: (member) => request('/members', {
      method: 'POST',
      body: member,
    }),
    update: (id, member) => request(`/members/${id}`, {
      method: 'PUT',
      body: member,
    }),
    delete: (id) => request(`/members/${id}`, {
      method: 'DELETE',
    }),
  },

  reports: {
    list: () => request('/reports'),
    get: (id) => request(`/reports/${id}`),
    upload: (formData) => request('/upload-chat', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    }),
  },
};