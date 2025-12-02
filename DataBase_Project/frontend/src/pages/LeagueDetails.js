import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, Calendar, Users, TrendingUp } from 'lucide-react';
import apiService from '../services/apiService';

const LeagueDetails = () => {
  const { id } = useParams();
  const [league, setLeague] = useState(null);
  const [standings, setStandings] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leagueData, standingsData, matchesData] = await Promise.all([
          apiService.leagues.getById(id),
          apiService.statistics.getStandings(id),
          apiService.matches.getAll({ leagueId: id })
        ]);
        setLeague(leagueData);
        setStandings(standingsData);
        setMatches(matchesData);
      } catch (error) {
        console.error('Error fetching league details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="text-center py-10">Loading league details...</div>;
  if (!league) return <div className="text-center py-10">League not found</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Trophy className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{league.LeagueName}</h1>
            <p className="text-gray-600 flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4" />
              {new Date(league.StartDate).toLocaleDateString()} - {new Date(league.EndDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* League Standings */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Standings
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">P</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">W</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">D</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">L</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">GF</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">GD</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pts</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {standings.map((team, index) => (
                <tr key={team.TeamID} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/teams/${team.TeamID}`} className="text-blue-600 hover:text-blue-800 font-medium">
                      {team.TeamName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{team.MatchesPlayed}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{team.Wins}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{team.Draws}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{team.Losses}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{team.GoalsFor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{team.GoalDifference}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-900">{team.Points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Matches */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Recent Matches
          </h2>
        </div>
        <div className="p-6 space-y-3">
          {matches.slice(0, 10).map((match) => (
            <Link 
              key={match.MatchID} 
              to={`/matches/${match.MatchID}`}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition"
            >
              <div className="flex-1 text-right">
                <p className="font-semibold text-gray-900">{match.Team1Name}</p>
              </div>
              <div className="px-6 text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {match.Team1Score} - {match.Team2Score}
                </p>
                <p className="text-xs text-gray-500">{new Date(match.MatchDate).toLocaleDateString()}</p>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{match.Team2Name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeagueDetails;
