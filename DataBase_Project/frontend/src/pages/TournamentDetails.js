import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Users, Calendar } from 'lucide-react';
import apiService from '../services/apiService';

const TournamentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [topScorers, setTopScorers] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournamentData();
  }, [id]);

  const fetchTournamentData = async () => {
    try {
      setLoading(true);
      const [tournamentData, teamsData, matchesData] = await Promise.all([
        apiService.tournaments.getById(id),
        apiService.tournaments.getTeams(id),
        apiService.matches.getAll()
      ]);

      setTournament(tournamentData);
      setTeams(teamsData);
      
      // Filter matches for this tournament
      const tournamentMatches = matchesData.filter(m => 
        (m.TournamentID || m.tournamentId) == id
      );
      setMatches(tournamentMatches);

      // Calculate standings
      calculateStandings(tournamentMatches, teamsData);

      // Get top scorers for this tournament
      await fetchTopScorers();
      
    } catch (error) {
      console.error('Error fetching tournament data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopScorers = async () => {
    try {
      // Note: This would need a backend endpoint to filter by tournament
      const scorers = await apiService.statistics.getTopScorers({ limit: 10 });
      setTopScorers(scorers.slice(0, 5));
    } catch (error) {
      console.error('Error fetching top scorers:', error);
    }
  };

  const calculateStandings = (matchesData, teamsData) => {
    const teamStats = {};

    // Initialize stats for all teams
    teamsData.forEach(team => {
      teamStats[team.TeamID] = {
        teamId: team.TeamID,
        teamName: team.TeamName,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
      };
    });

    // Calculate stats from completed matches
    matchesData
      .filter(m => m.Status === 'Completed' || m.status === 'completed')
      .forEach(match => {
        const team1Id = match.Team1ID || match.team1Id;
        const team2Id = match.Team2ID || match.team2Id;
        const team1Score = match.Team1Score || match.homeScore || 0;
        const team2Score = match.Team2Score || match.awayScore || 0;

        if (teamStats[team1Id] && teamStats[team2Id]) {
          teamStats[team1Id].played++;
          teamStats[team2Id].played++;
          teamStats[team1Id].goalsFor += team1Score;
          teamStats[team1Id].goalsAgainst += team2Score;
          teamStats[team2Id].goalsFor += team2Score;
          teamStats[team2Id].goalsAgainst += team1Score;

          if (team1Score > team2Score) {
            teamStats[team1Id].won++;
            teamStats[team1Id].points += 3;
            teamStats[team2Id].lost++;
          } else if (team2Score > team1Score) {
            teamStats[team2Id].won++;
            teamStats[team2Id].points += 3;
            teamStats[team1Id].lost++;
          } else {
            teamStats[team1Id].drawn++;
            teamStats[team2Id].drawn++;
            teamStats[team1Id].points += 1;
            teamStats[team2Id].points += 1;
          }

          teamStats[team1Id].goalDifference = teamStats[team1Id].goalsFor - teamStats[team1Id].goalsAgainst;
          teamStats[team2Id].goalDifference = teamStats[team2Id].goalsFor - teamStats[team2Id].goalsAgainst;
        }
      });

    const standingsArray = Object.values(teamStats)
      .filter(team => team.played > 0)
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });

    setStandings(standingsArray);
  };

  if (loading) {
    return <div className="text-center py-8">Loading tournament data...</div>;
  }

  if (!tournament) {
    return <div className="text-center py-8">Tournament not found</div>;
  }

  const completedMatches = matches.filter(m => m.Status === 'Completed' || m.status === 'completed').length;
  const upcomingMatches = matches.filter(m => m.Status === 'Scheduled' || m.status === 'scheduled').length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/tournaments')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Tournaments
        </button>
        
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-10 h-10" />
            <div>
              <h1 className="text-4xl font-bold">{tournament.TournamentName || tournament.name}</h1>
              <p className="text-blue-100 mt-2">{tournament.TournamentType || tournament.type}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5" />
                <span className="text-sm">Start Date</span>
              </div>
              <p className="text-2xl font-bold">
                {tournament.StartDate ? new Date(tournament.StartDate).toLocaleDateString() : 'TBD'}
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5" />
                <span className="text-sm">Participating Teams</span>
              </div>
              <p className="text-2xl font-bold">{teams.length}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5" />
                <span className="text-sm">Status</span>
              </div>
              <p className="text-2xl font-bold capitalize">{tournament.Status || tournament.status}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Standings */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tournament Standings</h2>
            {standings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pos</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">P</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">W</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">D</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">L</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">GF</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">GA</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">GD</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {standings.map((team, index) => (
                      <tr key={team.teamId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{index + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{team.teamName}</td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">{team.played}</td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">{team.won}</td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">{team.drawn}</td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">{team.lost}</td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">{team.goalsFor}</td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">{team.goalsAgainst}</td>
                        <td className={`px-4 py-3 text-sm text-center font-medium ${team.goalDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                        </td>
                        <td className="px-4 py-3 text-sm text-center font-bold text-blue-600">{team.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No matches completed yet</p>
            )}
          </div>

          {/* Recent Matches */}
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Matches</h2>
            <div className="space-y-4">
              {matches.filter(m => m.Status === 'Completed' || m.status === 'completed').slice(0, 5).map(match => (
                <div key={match.MatchID || match.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 text-right">
                      <p className="font-semibold text-gray-900">{match.Team1Name || match.homeTeamName}</p>
                    </div>
                    <div className="px-6 text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {match.Team1Score || match.homeScore || 0} - {match.Team2Score || match.awayScore || 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {match.MatchDate ? new Date(match.MatchDate).toLocaleDateString() : 'Date TBD'}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{match.Team2Name || match.awayTeamName}</p>
                    </div>
                  </div>
                </div>
              ))}
              {matches.filter(m => m.Status === 'Completed' || m.status === 'completed').length === 0 && (
                <p className="text-gray-500 text-center py-8">No completed matches yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Tournament Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Matches</span>
                <span className="text-2xl font-bold text-blue-600">{matches.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed</span>
                <span className="text-lg font-semibold text-green-600">{completedMatches}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Upcoming</span>
                <span className="text-lg font-semibold text-orange-600">{upcomingMatches}</span>
              </div>
            </div>
          </div>

          {/* Top Scorers */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Top Scorers</h3>
            <div className="space-y-3">
              {topScorers.map((player, index) => (
                <div key={player.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{player.name}</p>
                      <p className="text-xs text-gray-600">{player.TeamName}</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-blue-600">{player.goals}</p>
                </div>
              ))}
              {topScorers.length === 0 && (
                <p className="text-gray-500 text-center py-4">No stats available yet</p>
              )}
            </div>
          </div>

          {/* Participating Teams */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Participating Teams</h3>
            <div className="space-y-2">
              {teams.map(team => (
                <div key={team.TeamID} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <p className="font-medium text-gray-900">{team.TeamName}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetails;
