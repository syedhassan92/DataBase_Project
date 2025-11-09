import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Trophy, MapPin } from 'lucide-react';
import apiService from '../services/apiService';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiService.statistics.getOverall();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  const chartData = [
    { name: 'Leagues', value: stats?.leagues || 0 },
    { name: 'Teams', value: stats?.teams || 0 },
    { name: 'Players', value: stats?.players || 0 },
    { name: 'Venues', value: stats?.venues || 0 },
  ];

  const matchData = [
    { name: 'Upcoming', value: stats?.upcomingMatches || 0 },
    { name: 'Completed', value: stats?.completedMatches || 0 },
  ];

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Trophy />} label="Teams" value={stats?.teams || 0} color="blue" />
        <StatCard icon={<Users />} label="Players" value={stats?.players || 0} color="green" />
        <StatCard icon={<MapPin />} label="Venues" value={stats?.venues || 0} color="orange" />
        <StatCard icon={<TrendingUp />} label="Matches" value={stats?.totalMatches || 0} color="red" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Overview Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Matches Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={matchData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <QuickLink href="/admin/leagues" label="Manage Leagues" />
        <QuickLink href="/admin/teams" label="Manage Teams" />
        <QuickLink href="/admin/players" label="Manage Players" />
        <QuickLink href="/admin/matches" label="Schedule Matches" />
        <QuickLink href="/admin/venues" label="Manage Venues" />
        <QuickLink href="/admin/tournaments" label="Manage Tournaments" />
        <QuickLink href="/admin/statistics" label="View Statistics" />
        <QuickLink href="/admin/reports" label="Generate Reports" />
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-3xl opacity-20">{icon}</div>
      </div>
    </div>
  );
};

const QuickLink = ({ href, label }) => (
  <a
    href={href}
    className="bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-lg p-4 text-center font-semibold text-blue-700 transition"
  >
    {label}
  </a>
);

export default AdminDashboard;
