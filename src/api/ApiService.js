import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For development, use your computer's IP address instead of localhost
// Replace with your actual IP address (run `ip addr show` or `ifconfig` on Linux/Mac)
const API_BASE_URL = 'http://192.168.43.99:3000'; // Update this to your computer's IP

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(credentials) {
    try {
      const response = await this.client.post('/api/auth/login', credentials);
      const { token, user } = response.data;

      if (token) {
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async register(userData) {
    try {
      const response = await this.client.post('/api/auth/register', userData);
      const { token, user } = response.data;

      if (token) {
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async logout() {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async getCurrentUser() {
    try {
      const userStr = await AsyncStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Properties API
  async getProperties(params = {}) {
    try {
      const response = await this.client.get('/api/properties', { params });
      return response.data.properties || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getProperty(id) {
    try {
      const response = await this.client.get(`/api/properties/${id}`);
      return response.data.property || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async createProperty(propertyData) {
    try {
      const response = await this.client.post('/api/properties', propertyData);
      return response.data.property || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async updateProperty(id, propertyData) {
    try {
      const response = await this.client.put(`/api/properties/${id}`, propertyData);
      return response.data.property || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async deleteProperty(id) {
    try {
      const response = await this.client.delete(`/api/properties/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Favorites API
  async getFavorites() {
    try {
      const response = await this.client.get('/api/favorites');
      return response.data.properties || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async addToFavorites(propertyId) {
    try {
      const response = await this.client.post('/api/favorites', { propertyId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async removeFromFavorites(propertyId) {
    try {
      const response = await this.client.delete(`/api/favorites/${propertyId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Reviews API
  async getPropertyReviews(propertyId) {
    try {
      const response = await this.client.get(`/api/reviews/property/${propertyId}`);
      return response.data.reviews || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getReviews(params = {}) {
    try {
      const response = await this.client.get('/api/reviews', { params });
      return response.data.reviews || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async createReview(reviewData) {
    try {
      const response = await this.client.post('/api/reviews', reviewData);
      return response.data.review || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async submitReview(reviewData) {
    try {
      const response = await this.client.post('/api/reviews', reviewData);
      return response.data.review || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async likeReview(reviewId) {
    try {
      const response = await this.client.post(`/api/reviews/${reviewId}/like`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async dislikeReview(reviewId) {
    try {
      const response = await this.client.post(`/api/reviews/${reviewId}/dislike`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Agents API
  async getAgents(params = {}) {
    try {
      const response = await this.client.get('/api/agents', { params });
      return response.data.agents || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getAgent(id) {
    try {
      const response = await this.client.get(`/api/agents/${id}`);
      return response.data.agent || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getAgentReviews(agentId) {
    try {
      const response = await this.client.get(`/api/agents/${agentId}/reviews`);
      return response.data.reviews || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getAgentProperties(agentId) {
    try {
      const response = await this.client.get(`/api/agents/${agentId}/properties`);
      return response.data.properties || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getAgentProfile() {
    try {
      const response = await this.client.get('/api/agents/profile');
      return response.data.agent || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Contact API
  async submitContact(contactData) {
    try {
      const response = await this.client.post('/api/contact', contactData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Admin API methods
  async getAdminDashboardStats() {
    try {
      const response = await this.client.get('/api/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getAdminAgents(params = {}) {
    try {
      const response = await this.client.get('/api/admin/agents', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}

export default new ApiService();
