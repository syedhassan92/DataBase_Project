import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Users, Zap, ArrowRight, Shield, Target } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Trophy className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">SportsHub</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/login/user')}
              className="px-6 py-2 text-white hover:text-blue-300 transition font-medium"
            >
              User Login
            </button>
            <button
              onClick={() => navigate('/login/admin')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Admin Login
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Content */}
          <div className="lg:w-1/2 space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl lg:text-7xl font-bold text-white leading-tight">
                Manage Sports Like a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Pro</span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                The ultimate platform for organizing leagues, managing teams, tracking players, and scheduling matches with precision and ease.
              </p>
            </div>

            {/* Feature bullets */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-gray-200">Real-time match tracking and live updates</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-gray-200">Comprehensive player and team management</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-gray-200">Advanced statistics and performance analytics</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => navigate('/login/user')}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition transform hover:scale-105 flex items-center justify-center gap-2"
              >
                Get Started as User
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </button>
              <button
                onClick={() => navigate('/login/admin')}
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border-2 border-blue-500/50 hover:border-blue-500 transition"
              >
                Admin Access
              </button>
            </div>
          </div>

          {/* Right Side - Feature Cards */}
          <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl p-8 rounded-2xl border border-blue-500/20 hover:border-blue-400/50 transition transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20">
              <Trophy className="w-12 h-12 text-blue-400 mb-4 group-hover:scale-110 transition" />
              <h3 className="text-xl font-bold text-white mb-2">Leagues Management</h3>
              <p className="text-gray-300">Create, organize, and manage multiple sports leagues with ease</p>
            </div>

            {/* Card 2 */}
            <div className="group bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl p-8 rounded-2xl border border-purple-500/20 hover:border-purple-400/50 transition transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
              <Users className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition" />
              <h3 className="text-xl font-bold text-white mb-2">Team Control</h3>
              <p className="text-gray-300">Manage teams, players, stats, and performance metrics effortlessly</p>
            </div>

            {/* Card 3 */}
            <div className="group bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl p-8 rounded-2xl border border-orange-500/20 hover:border-orange-400/50 transition transform hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20">
              <Target className="w-12 h-12 text-orange-400 mb-4 group-hover:scale-110 transition" />
              <h3 className="text-xl font-bold text-white mb-2">Match Scheduling</h3>
              <p className="text-gray-300">Plan, schedule, and track matches with automated notifications</p>
            </div>

            {/* Card 4 */}
            <div className="group bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl p-8 rounded-2xl border border-green-500/20 hover:border-green-400/50 transition transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/20">
              <Zap className="w-12 h-12 text-green-400 mb-4 group-hover:scale-110 transition" />
              <h3 className="text-xl font-bold text-white mb-2">Analytics Hub</h3>
              <p className="text-gray-300">Track statistics and generate detailed performance reports</p>
            </div>
          </div>
        </div>


        {/* Footer */}
        <div className="border-t border-blue-500/20 py-8">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <p className="text-gray-400">© 2025 SportsHub. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-gray-400">Secure • Reliable • Professional</span>
            </div>
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
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Landing;
