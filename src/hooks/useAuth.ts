import { useState, useEffect } from 'react';
import { AuthUser } from '@/types/auth';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  if (token && storedUser) {
    try {
      setUser(JSON.parse(storedUser));
    } catch (err) {
      console.error('Failed to parse stored user:', err);
      setUser(null); 
    }
  }

  setLoading(false);
}, []);


  const login = (user: AuthUser, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return { user, loading, login, logout };
};
