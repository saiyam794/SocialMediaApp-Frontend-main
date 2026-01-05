'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { authAPI } from '@/services/auth';

type AuthMode = 'login' | 'signup';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    name: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }

        const res = await authAPI.signup({
          email: formData.email,
          username: formData.username,
          name: formData.name,
        });

        login(res.user, res.token);
      } else {
        const res = await authAPI.login({
          email: formData.email,
        });

        login(res.user, res.token);
      }

      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">

      <div className="hidden md:flex flex-col justify-center px-16 text-white">
        <h1 className="text-5xl font-bold mb-6">Instagram</h1>
        <p className="text-xl text-white/90 mb-8">
          Share moments.  
          Build connections.  
          Feel closer.
        </p>

        <ul className="space-y-4 text-white/80">
          <li>Connect with people</li>
          <li>Real conversations</li>
          <li>Build your social presence</li>
        </ul>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
          <div className="flex mb-8 bg-gray-100 rounded-xl p-1">
            {['signup', 'login'].map((item) => (
              <button
                key={item}
                onClick={() => {
                  setMode(item as AuthMode);
                  setError('');
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                  mode === item
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-600'
                }`}
              >
                {item === 'signup' ? 'Create Account' : 'Log In'}
              </button>
            ))}
          </div>
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />

            {mode === 'signup' && (
              <Input
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            )}

            {mode === 'signup' && (
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            )}

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />

            {mode === 'signup' && (
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Please wait...' : mode === 'signup' ? 'Join Now' : 'Welcome Back'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            {mode === 'signup'
              ? 'Already have an account?'
              : "Don't have an account?"}
            <button
              onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
              className="ml-1 text-indigo-600 font-medium hover:underline"
            >
              {mode === 'signup' ? 'Log In' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        {...props}
        required
        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      />
    </div>
  );
}
