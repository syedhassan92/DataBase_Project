import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import apiService from '../services/apiService';

const LeagueTable = () => {
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leagueName, setLeagueName] = useState('');

  useEffect(() => {
    fetchLeagues();
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      fetchStandings();
    }
  }, [selectedLeague]);

  const fetchLeagues = async () => {
    try {
      const data = await apiService.leagues.getAll();
      setLeagues(data);
      if (data.length > 0) {
        setSelectedLeague(data[0].LeagueID);
        setLeagueName(data[0].LeagueName);
      }
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStandings = async () => {
    try {
      setLoading(true);
      
      // Get league details including start date
      const league = leagues.find(l => l.LeagueID === parseInt(selectedLeague));
      if (league) {
        setLeagueName(league.LeagueName);
        
        // Check if league has started
        const startDate = new Date(league.StartDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (startDate > today) {
          // League hasn't started yet
          setStandings([]);
          setLoading(false);
          return;
        }
      }
      
      const data = await apiService.get(`/stats/standings/${selectedLeague}`);
      setStandings(data);
    } catch (error) {
      console.error('Error fetching standings:', error);
      setStandings([]);
    } finally {
      setLoading(false);
    }
  };

  const getPositionColor = (position) => {
    if (position === 1) return 'bg-yellow-500';
    if (position <= 4) return 'bg-green-500';
    if (position >= standings.length - 2) return 'bg-red-500';
    return 'bg-gray-400';
  };

  const getPositionIcon = (position) => {
    if (position === 1) return <Trophy className="w-4 h-4 text-white" />;
    if (position <= 4) return <TrendingUp className="w-4 h-4 text-white" />;
    if (position >= standings.length - 2) return <TrendingDown className="w-4 h-4 text-white" />;
    return null;
  };

  if (loading && leagues.length === 0) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">League Table</h1>
        
        {/* League Selector */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <label htmlFor="league-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select League
          </label>
          <select
            id="league-select"
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {leagues.map((league) => (
              <option key={league.LeagueID} value={league.LeagueID}>
                {league.LeagueName}
              </option>
            ))}
          </select>
        </div>

        {/* League Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white">{leagueName} - Standings</h2>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading standings...</div>
          ) : (() => {
              // Check if league has started
              const league = leagues.find(l => l.LeagueID === parseInt(selectedLeague));
              if (league) {
                const startDate = new Date(league.StartDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (startDate > today) {
                  return (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <Trophy className="w-16 h-16 mx-auto mb-2" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">League Not Started Yet</h3>
                      <p className="text-gray-500">
                        This league will start on {startDate.toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  );
                }
              }
              
              if (standings.length === 0) {
                return (
                  <div className="text-center py-8 text-gray-500">
                    No standings data available for this league
                  </div>
                );
              }
              
              return (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Pos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      MP
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      W
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      D
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      L
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      GF
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      GD
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Pts
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {standings.map((team, index) => (
                    <tr 
                      key={team.TeamID}
                      className={`hover:bg-gray-50 transition ${
                        index === 0 ? 'bg-yellow-50' : 
                        index <= 3 ? 'bg-green-50' : 
                        index >= standings.length - 3 ? 'bg-red-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full ${getPositionColor(index + 1)} flex items-center justify-center text-white text-xs font-bold`}>
                            {index + 1}
                          </span>
                          {getPositionIcon(index + 1)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{team.TeamName}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                        {team.MatchesPlayed}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium text-green-600">
                        {team.Wins}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                        {team.Draws}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-medium text-red-600">
                        {team.Losses}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                        {team.GoalsFor}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                        <span className={`font-semibold ${
                          team.GoalDifference > 0 ? 'text-green-600' : 
                          team.GoalDifference < 0 ? 'text-red-600' : 
                          'text-gray-600'
                        }`}>
                          {team.GoalDifference > 0 ? '+' : ''}{team.GoalDifference}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-lg font-bold text-blue-600">
                          {team.Points}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              );
            })()}

          {/* Legend */}
          {standings.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Champion</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Qualification</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Relegation</span>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                <strong>MP:</strong> Matches Played | <strong>W:</strong> Wins | <strong>D:</strong> Draws | <strong>L:</strong> Losses | 
                <strong> GF:</strong> Goals For | <strong>GD:</strong> Goal Difference | <strong>Pts:</strong> Points
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeagueTable;
