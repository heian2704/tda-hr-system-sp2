// src/pages/Index/components/LoginForm.tsx
import React, { useState } from 'react';
import { EyeOff, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SignInResponse } from '@/dtos/signIn/SignInResponse';

interface LoginFormProps {
  setIsLoggedIn: (value: boolean) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [signInResponse, setSignInResponse] = useState<SignInResponse>();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://tda-backend-khaki.vercel.app/_api/auth/signIn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      console.log('Login successful:', data);
      setRedirecting(true);
      setIsLoggedIn(true);

      setSignInResponse(data);

      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.username));

      setTimeout(() => {
        navigate('/dashboard');
      }, 1);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setRedirecting(false);
    } finally {
      setLoading(false);
    }
  };

  if (redirecting) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="bg-white px-8 py-6 rounded-2xl shadow-xl text-center flex flex-col items-center gap-4">
          <svg
            className="animate-spin h-6 w-6 text-red-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <p className="text-gray-700 text-base font-medium">Logging you in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 mt-20">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">
          Welcome to <span className="text-red-400">TDA</span> HR System
        </h1>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
            required
            disabled={loading}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              tabIndex={-1}
              disabled={loading}
            >
              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
            required
            disabled={loading}
          />
        </div>

        {error && <p className="text-red-500 text-center mt-2 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-red-400 hover:bg-red-500 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 mt-8 ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
