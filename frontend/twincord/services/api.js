import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for your backend API
const BASE_URL = 'http://10.212.96.234:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, remove from storage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        // Store token and user data
        await AsyncStorage.setItem('authToken', response.data.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: 'Network error' };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success) {
        // Store token and user data
        await AsyncStorage.setItem('authToken', response.data.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: 'Network error' };
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout');
      // Clear stored data
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      return { success: true };
    } catch (error) {
      // Even if API call fails, clear local storage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      throw error.response?.data || { success: false, error: 'Network error' };
    }
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      return !!(token && userData);
    } catch (error) {
      return false;
    }
  },

  // Get stored user data
  getUserData: async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: 'Server is not responding' };
    }
  },
};

// Stats APIs
export const statsAPI = {
  // Fetch dashboard stats
  getStats: async () => {
    try {
      const response = await api.get('/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, error: 'Server not responding' };
    }
  },
  // Subscribe to realtime stats via SSE; returns unsubscribe function
  subscribe: (onMessage, onError) => {
    // Convert baseURL to absolute for EventSource
    const url = `${BASE_URL}/stats/stream`;
    let es;
    try {
      es = new EventSource(url);
    } catch (e) {
      if (onError) onError(e);
      return () => {};
    }
    es.onmessage = (evt) => {
      try {
        const payload = JSON.parse(evt.data);
        onMessage && onMessage(payload);
      } catch (_) {}
    };
    es.addEventListener('stats', (evt) => {
      try {
        const payload = JSON.parse(evt.data);
        onMessage && onMessage(payload);
      } catch (_) {}
    });
    es.onerror = (err) => {
      onError && onError(err);
      // browsers auto-reconnect; keep it simple here
    };
    return () => {
      try { es && es.close(); } catch (_) {}
    };
  },
};

// Community APIs
const communitiesAPI = {
  createCommunity: async ({ name, description, creatorId }) => {
    try {
      const resp = await api.post('/communities', { name, description, creatorId });
      return resp.data;
    } catch (err) {
      throw err.response?.data || { success: false, error: 'Server not responding' };
    }
  },

  joinCommunity: async ({ userId, code }) => {
    try {
      const resp = await api.post('/communities/join', { userId, code });
      return resp.data;
    } catch (err) {
      throw err.response?.data || { success: false, error: 'Server not responding' };
    }
  },

  listCommunities: async ({ userId } = {}) => {
    try {
      const resp = await api.get('/communities', { params: { userId } });
      return resp.data;
    } catch (err) {
      throw err.response?.data || { success: false, error: 'Server not responding' };
    }
  },

  getCommunity: async (id) => {
    try {
      const resp = await api.get(`/communities/${id}`);
      return resp.data;
    } catch (err) {
      throw err.response?.data || { success: false, error: 'Server not responding' };
    }
  },

  getMessages: async (id) => {
    try {
      const resp = await api.get(`/communities/${id}/messages`);
      return resp.data;
    } catch (err) {
      throw err.response?.data || { success: false, error: 'Server not responding' };
    }
  },

  postMessage: async (id, { senderId, text, senderName }) => {
    try {
      const resp = await api.post(`/communities/${id}/messages`, { senderId, text, senderName });
      return resp.data;
    } catch (err) {
      throw err.response?.data || { success: false, error: 'Server not responding' };
    }
  }
};

export { communitiesAPI };


export default api;
