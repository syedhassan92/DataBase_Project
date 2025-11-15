import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { ArrowRight, Shield } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addNotification } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Demo mode - allow testing without backend
      if (formData.email === 'admin@demo.com' && formData.password === 'admin123') {
        const userData = {
          id: 1,
          name: 'Demo Admin',
          email: 'admin@demo.com',
          role: 'admin',
        };
        login(userData, 'demo-token-admin');
        addNotification('Admin login successful!', 'success');
        navigate('/admin/dashboard');
        return;
      }

      // API call to backend
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'admin' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Admin login failed');
      }

      const data = await response.json();
      const userData = {
        id: data.userId,
        name: data.name,
        email: formData.email,
        role: 'admin',
      };
      login(userData, data.token);
      addNotification('Admin login successful!', 'success');
      navigate('/admin/dashboard');
    } catch (error) {
      addNotification(error.message || 'Admin login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setFormData({
      email: 'admin@demo.com',
      password: 'admin123',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back to home */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
            Back
          </button>
          <Shield className="w-6 h-6 text-orange-400" />
        </div>

        {/* Card */}
        <div className="bg-gradient-to-br from-slate-800/50 to-blue-900/50 backdrop-blur-xl rounded-2xl border border-orange-500/20 hover:border-orange-400/50 transition p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-orange-400" />
            <h2 className="text-3xl font-bold text-white">Admin Login</h2>
          </div>
          <p className="text-gray-400 mb-8">Access admin control panel</p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="w-full px-4 py-3 bg-slate-700/50 border border-orange-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-500 transition"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 bg-slate-700/50 border border-orange-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-500 transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-orange-500/50 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'Logging in...' : 'Admin Login'}
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={fillDemoCredentials}
              className="w-full bg-slate-700/50 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg border border-slate-600 hover:border-slate-500 transition"
            >
              Use Demo Credentials
            </button>
          </form>

          {/* Demo Info Box */}
          <div className="mt-8 p-4 bg-orange-500/10 rounded-xl border border-orange-500/30 backdrop-blur-sm">
            <p className="text-xs font-semibold text-orange-300 mb-3 uppercase tracking-wider">Demo Credentials</p>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-400">Email:</p>
                <p className="text-sm text-white font-mono">admin@demo.com</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Password:</p>
                <p className="text-sm text-white font-mono">admin123</p>
              </div>
            </div>
          </div>

          {/* Footer links */}
          <div className="mt-8 pt-6 border-t border-slate-700 space-y-3">
            <p className="text-center text-gray-400 text-sm">
              User? <a href="/login/user" className="text-orange-400 hover:text-orange-300 font-semibold transition">Login Here</a>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
