import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { ArrowRight, UserPlus, Mail, Lock, User } from 'lucide-react';

const UserSignup = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { addNotification } = useApp();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validation
        if (formData.password !== formData.confirmPassword) {
            addNotification('Passwords do not match', 'error');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            addNotification('Password must be at least 6 characters', 'error');
            setLoading(false);
            return;
        }

        try {
            // API call to backend
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Registration failed');
            }

            const data = await response.json();

            // Auto-login after successful registration
            const userData = {
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                role: 'user',
            };

            login(userData, data.token);
            addNotification('Account created successfully!', 'success');
            navigate('/user/dashboard');
        } catch (error) {
            addNotification(error.message || 'Registration failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background shapes */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Back to login */}
                <div className="mb-8 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/login/user')}
                        className="flex items-center gap-2 text-gray-300 hover:text-white transition"
                    >
                        <ArrowRight className="w-5 h-5 rotate-180" />
                        Back to Login
                    </button>
                    <UserPlus className="w-6 h-6 text-blue-400" />
                </div>

                {/* Card */}
                <div className="bg-gradient-to-br from-slate-800/50 to-blue-900/50 backdrop-blur-xl rounded-2xl border border-blue-500/20 hover:border-blue-400/50 transition p-8 shadow-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <UserPlus className="w-8 h-8 text-blue-400" />
                        <h2 className="text-3xl font-bold text-white">Create Account</h2>
                    </div>
                    <p className="text-gray-400 mb-8">Join our sports management platform</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                                <User className="w-4 h-4 inline mr-2" />
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                minLength={3}
                                autoComplete="username"
                                className="w-full px-4 py-3 bg-slate-700/50 border border-blue-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 transition"
                                placeholder="Choose a username"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                <Mail className="w-4 h-4 inline mr-2" />
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                                className="w-full px-4 py-3 bg-slate-700/50 border border-blue-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 transition"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                <Lock className="w-4 h-4 inline mr-2" />
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                                autoComplete="new-password"
                                className="w-full px-4 py-3 bg-slate-700/50 border border-blue-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 transition"
                                placeholder="At least 6 characters"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                <Lock className="w-4 h-4 inline mr-2" />
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                minLength={6}
                                autoComplete="new-password"
                                className="w-full px-4 py-3 bg-slate-700/50 border border-blue-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500 transition"
                                placeholder="Confirm your password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>

                    {/* Info Box */}
                    <div className="mt-8 p-4 bg-blue-500/10 rounded-xl border border-blue-500/30 backdrop-blur-sm">
                        <p className="text-xs font-semibold text-blue-300 mb-2 uppercase tracking-wider">Account Benefits</p>
                        <ul className="space-y-1 text-xs text-gray-300">
                            <li>✓ View leagues, teams, and matches</li>
                            <li>✓ Access performance statistics</li>
                            <li>✓ Track upcoming matches</li>
                            <li>✓ Browse player and venue information</li>
                        </ul>
                    </div>

                    {/* Footer links */}
                    <div className="mt-8 pt-6 border-t border-slate-700">
                        <p className="text-center text-gray-400 text-sm">
                            Already have an account? <a href="/login/user" className="text-blue-400 hover:text-blue-300 font-semibold transition">Login Here</a>
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

export default UserSignup;
