import React, { useState, useEffect } from 'react';
import { Calendar, Ticket, TrendingUp, MapPin } from 'lucide-react';
import apiService from '../services/apiService';

const UserDashboard = () => {
  const [stats, setStats] = useState(null);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await apiService.statistics.getOverall();
        const matchesData = await apiService.matches.getUpcomingMatches();
        setStats(statsData);
        setUpcomingMatches(matchesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Welcome to Sports Management</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard icon={<Calendar />} label="Upcoming Matches" value={stats?.upcomingMatches || 0} color="blue" />
        <StatCard icon={<TrendingUp />} label="Teams" value={stats?.teams || 0} color="purple" />
        <StatCard icon={<MapPin />} label="Venues" value={stats?.venues || 0} color="orange" />
      </div>

      {/* Upcoming Matches */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Matches</h2>
        <div className="space-y-4">
          {upcomingMatches.length > 0 ? (
            upcomingMatches.slice(0, 5).map(match => (
              <div key={match.id} className="border-l-4 border-blue-500 p-4 hover:bg-gray-50 rounded cursor-pointer transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-lg">
                      {match.homeTeamName} vs {match.awayTeamName}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {match.date} at {match.time} • {match.venue}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No upcoming matches available</p>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <QuickLink href="/user/performance-stats" label="📊 Performance Stats" />
        <QuickLink href="/leagues" label="🏆 View Leagues" />
        <QuickLink href="/teams" label="⚽ View Teams" />
        <QuickLink href="/players" label="👥 View Players" />
        <QuickLink href="/matches" label="🎮 View Matches" />
        <QuickLink href="/venues" label="🏟️ View Venues" />
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-4xl opacity-20">{icon}</div>
      </div>
    </div>
  );
};

const QuickLink = ({ href, label }) => (
  <a
    href={href}
    className="bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg p-6 text-center font-semibold text-blue-700 transition"
  >
    {label}
  </a>
);

export default UserDashboard;
