import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aidmap_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('aidmap_token');
      localStorage.removeItem('aidmap_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Help Requests
export const helpRequestAPI = {
  create: (data) => api.post('/help-requests', data),
  getAll: (params) => api.get('/help-requests', { params }),
  getOne: (id) => api.get(`/help-requests/${id}`),
  assign: (id, volunteerId) => api.patch(`/help-requests/${id}/assign`, { volunteerId }),
  accept: (id) => api.patch(`/help-requests/${id}/accept`),
  complete: (id) => api.patch(`/help-requests/${id}/complete`),
  updateStatus: (id, status) => api.patch(`/help-requests/${id}/status`, { status }),
  getMapData: () => api.get('/help-requests/map/data'),
};

// Volunteers
export const volunteerAPI = {
  getAll: (params) => api.get('/volunteers', { params }),
  getStats: () => api.get('/volunteers/stats'),
  getMyTasks: (params) => api.get('/volunteers/my-tasks', { params }),
  toggleAvailability: () => api.patch('/volunteers/availability'),
  getOne: (id) => api.get(`/volunteers/${id}`),
};

// Notifications
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

// Analytics
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getWeeklyReport: () => api.get('/analytics/weekly-report'),
};

// Chatbot
export const chatbotAPI = {
  sendMessage: (message) => api.post('/chatbot', { message }),
};

export default api;
