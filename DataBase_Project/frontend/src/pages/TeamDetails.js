import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Trophy, TrendingUp, User } from 'lucide-react';
import apiService from '../services/apiService';

const TeamDetails = () => {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [teamStats, setTeamStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamData, playersData, matchesData] = await Promise.all([
          apiService.teams.getById(id),
          apiService.players.getAll({ teamId: id }),
          apiService.matches.getAll({ teamId: id })
        ]);
        setTeam(teamData);
        setPlayers(playersData);
        setMatches(matchesData);

        // Calculate team statistics from matches
        const completedMatches = matchesData.filter(m => m.Status === 'Completed');
        const wins = completedMatches.filter(m => m.WinnerTeamID === parseInt(id)).length;
        const draws = completedMatches.filter(m => m.WinnerTeamID === null).length;
        const losses = completedMatches.length - wins - draws;
        
        setTeamStats({
          played: completedMatches.length,
          wins,
          draws,
          losses
        });
      } catch (error) {
        console.error('Error fetching team details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="text-center py-10">Loading team details...</div>;
  if (!team) return <div className="text-center py-10">Team not found</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{team.TeamName}</h1>
            <p className="text-gray-600 mt-1">Team Overview</p>
          </div>
        </div>
      </div>

      {/* Team Statistics */}
      {teamStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Matches Played" value={teamStats.played} color="blue" />
          <StatCard label="Wins" value={teamStats.wins} color="green" />
          <StatCard label="Draws" value={teamStats.draws} color="yellow" />
          <StatCard label="Losses" value={teamStats.losses} color="red" />
        </div>
      )}

      {/* Squad */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5" />
            Squad ({players.length} players)
          </h2>
        </div>
        <div className="p-6">
          {players.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map((player) => (
                <Link
                  key={player.PlayerID}
                  to={`/players/${player.PlayerID}`}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition"
                >
                  <p className="font-semibold text-gray-900">{player.PlayerName}</p>
                  <p className="text-sm text-gray-600">{player.PlayerRole || 'Unknown Position'}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No players in this team</p>
          )}
        </div>
      </div>

      {/* Recent Matches */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Recent Matches
          </h2>
        </div>
        <div className="p-6 space-y-3">
          {matches.length > 0 ? (
            matches.slice(0, 10).map((match) => (
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
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    match.Status === 'Completed' ? 'bg-green-100 text-green-800' :
                    match.Status === 'Live' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {match.Status}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{match.Team2Name}</p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No matches found for this team</p>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <p className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</p>
    </div>
  );
};

export default TeamDetails;
