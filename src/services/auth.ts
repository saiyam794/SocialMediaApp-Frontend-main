import axios from 'axios';
import { AuthResponse, AuthUser } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';

export const authAPI = {
  signup: async (data: {
    email: string;
    username: string;
    name: string;
  }): Promise<AuthResponse> => {
    // Call your auth/signup endpoint that returns { user, token }
    const response = await axios.post(`${API_URL}/auth/signup`, data);
    return {
      user: response.data.user,
      token: response.data.token  // ✅ Use actual JWT token
    };
  },

  login: async (data: {
    email: string;
  }): Promise<AuthResponse> => {
    // Call your auth/login endpoint that returns { user, token }
    const response = await axios.post(`${API_URL}/auth/login`, data);
    return {
      user: response.data.user,
      token: response.data.token  // ✅ Use actual JWT token
    };
  },

  getCurrentUser: async (): Promise<AuthUser> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) throw new Error('No token');
    
    // Use a dedicated /auth/me endpoint with JWT validation
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },
};