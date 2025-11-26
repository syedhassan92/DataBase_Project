import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiService from '../services/apiService';

const Statistics = () => {
  const [topScorers, setTopScorers] = useState([]);
  const [topAssists, setTopAssists] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const leaguesData = await apiService.leagues.getAll();
        setLeagues(leaguesData);
      } catch (error) {
        console.error('Error fetching leagues:', error);
      }
    };
    fetchLeagues();
  }, []);

  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      try {
        const params = selectedLeague ? { leagueId: selectedLeague } : {};
        const scorersData = await apiService.statistics.getTopScorers(params);
        const assistsData = await apiService.statistics.getTopAssists(params);
        setTopScorers(scorersData);
        setTopAssists(assistsData);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [selectedLeague]);

  if (loading) return <div className="text-center py-8">Loading statistics...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Performance Statistics</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Filter by League:</label>
          <select
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          >
            <option value="" className="bg-white text-gray-900">All Leagues</option>
            {leagues.map((league) => (
              <option key={league.LeagueID} value={league.LeagueID} className="bg-white text-gray-900">
                {league.LeagueName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Scorers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Scorers</h2>
          <div className="space-y-3">
            {topScorers.slice(0, 10).map((player, index) => (
              <div key={player.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{player.name}</p>
                    <p className="text-sm text-gray-600">{player.position} • {player.TeamName}</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-blue-600">{player.goals}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Assists */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Assisters</h2>
          <div className="space-y-3">
            {topAssists.slice(0, 10).map((player, index) => (
              <div key={player.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{player.name}</p>
                    <p className="text-sm text-gray-600">{player.position} • {player.TeamName}</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-600">{player.assists}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Goals vs Assists</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topScorers.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="goals" fill="#3b82f6" name="Goals" />
            <Bar dataKey="assists" fill="#10b981" name="Assists" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Statistics;
