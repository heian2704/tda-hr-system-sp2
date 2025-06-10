
import React, { useState } from 'react';
import { EyeOff, Eye } from 'lucide-react';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const passwordCriteria = [
    { text: 'Use 8 or more characters', met: password.length >= 8 },
    { text: 'One Uppercase character', met: /[A-Z]/.test(password) },
    { text: 'One lowercase character', met: /[a-z]/.test(password) },
    { text: 'One special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    { text: 'One number', met: /\d/.test(password) },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempted with:', { email, password });
  };

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
            >
              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              {showPassword ? 'Show' : 'Hide'}
            </button>
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
            required
          />
        </div>

        {password && (
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-gray-500 mt-3">
            {passwordCriteria.map((criterion, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    criterion.met ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
                <span className={criterion.met ? 'text-green-600' : 'text-gray-500'}>
                  {criterion.text}
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-red-400 hover:bg-red-500 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 mt-8"
        >
          Log in
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
