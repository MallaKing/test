import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

// BUG: No error interceptor, unhandled promise rejections
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
  // BUG: No timeout set - can hang indefinitely
});

// User API calls
export const createUser = async (username, email, password) => {
  const response = await apiClient.post('/users', {
    username,
    email,
    password
  });
  return response.data;
};

export const getUser = async (userId) => {
  const response = await apiClient.get(`/users/${userId}`);
  // BUG: No null check - could fail silently
  return response.data;
};

// Task API calls
export const createTask = async (userId, title, description = '', priority = 1) => {
  const response = await apiClient.post('/tasks', {
    userId,
    title,
    description,
    priority
  });
  return response.data;
};

export const getTasks = async (userId) => {
  const response = await apiClient.get(`/tasks/${userId}`);
  // BUG: Returns undefined if null, doesn't normalize
  return response.data;
};

export const updateTaskStatus = async (taskId, status) => {
  const response = await apiClient.put(`/tasks/${taskId}/status`, { status });
  return response.data;
};

export const deleteTask = async (taskId) => {
  // BUG: DELETE endpoint returns 204 No Content but code expects JSON response
  const response = await apiClient.delete(`/tasks/${taskId}`);
  return response.data; // Will be undefined/null
};

// Notifications
export const getNotifications = async (userId) => {
  const response = await apiClient.get(`/notifications/${userId}`);
  return response.data;
};

export const createNotification = async (userId, message) => {
  const response = await apiClient.post('/notifications', {
    userId,
    message
  });
  return response.data;
};

// Analytics
export const getAnalytics = async (userId) => {
  const response = await apiClient.get(`/analytics/${userId}`);
  return response.data;
};

export default apiClient;
