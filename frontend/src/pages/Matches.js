import React, { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2, Plus, X } from 'lucide-react';
import apiService from '../services/apiService';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);
  const [referees, setReferees] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [formData, setFormData] = useState({
    team1Id: '',
    team2Id: '',
    leagueId: '',
    tournamentId: '',
    venueId: '',
    refereeId: '',
    matchDate: '',
    matchTime: '',
    status: 'Scheduled'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [matchesData, teamsData, venuesData, refereesData, leaguesData, tournamentsData] = await Promise.all([
        apiService.matches.getAll(),
        apiService.teams.getAll(),
        apiService.venues.getAll(),
        apiService.referees.getAll(),
        apiService.leagues.getAll(),
        apiService.tournaments.getAll()
      ]);
      setMatches(matchesData);
      setTeams(teamsData);
      setVenues(venuesData);
      setReferees(refereesData);
      setLeagues(leaguesData);
      setTournaments(tournamentsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = () => {
    setEditingMatch(null);
    setFormData({
      team1Id: '',
      team2Id: '',
      leagueId: '',
      tournamentId: '',
      venueId: '',
      refereeId: '',
      matchDate: '',
      matchTime: '',
      status: 'Scheduled'
    });
    setShowModal(true);
  };

  const handleEdit = (match) => {
    setEditingMatch(match);
    setFormData({
      team1Id: match.Team1ID || match.team1Id || '',
      team2Id: match.Team2ID || match.team2Id || '',
      leagueId: match.LeagueID || match.leagueId || '',
      tournamentId: match.TournamentID || match.tournamentId || '',
      venueId: match.VenueID || match.venueId || '',
      refereeId: match.RefereeID || match.refereeId || '',
      matchDate: match.MatchDate || match.matchDate || '',
      matchTime: match.MatchTime || match.matchTime || '',
      status: match.Status || match.status || 'Scheduled'
    });
    setShowModal(true);
  };

  const handleDelete = async (matchId) => {
    if (!window.confirm('Are you sure you want to delete this match?')) return;
    try {
      await apiService.matches.delete(matchId);
      fetchData();
      alert('Match deleted successfully');
    } catch (error) {
      alert('Failed to delete match: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMatch) {
        await apiService.matches.update(editingMatch.MatchID || editingMatch.id, formData);
        alert('Match updated successfully');
      } else {
        await apiService.matches.create(formData);
        alert('Match scheduled successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert('Failed to save match: ' + error.message);
    }
  };

  if (loading) return <div className="text-center py-8">Loading matches...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Matches</h1>
        <button 
          onClick={handleSchedule}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Schedule Match
        </button>
      </div>

      <div className="space-y-4">
        {matches.map(match => (
          <div key={match.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">
                  {match.date} at {match.time} • {match.status.toUpperCase()}
                </p>
                
                <div className="flex items-center gap-6">
                  <div className="text-center flex-1">
                    <p className="font-semibold text-gray-900 text-lg">{match.homeTeamName}</p>
                    {match.status === 'completed' && (
                      <p className="text-2xl font-bold text-blue-600 mt-2">{match.homeScore}</p>
                    )}
                  </div>

                  <div className="text-center">
                    <p className="text-gray-600">vs</p>
                    {match.status === 'completed' && (
                      <p className="text-sm text-gray-600 mt-2">Final</p>
                    )}
                    {match.status === 'scheduled' && (
                      <p className="text-sm text-gray-600 mt-2">-</p>
                    )}
                  </div>

                  <div className="text-center flex-1">
                    <p className="font-semibold text-gray-900 text-lg">{match.awayTeamName}</p>
                    {match.status === 'completed' && (
                      <p className="text-2xl font-bold text-red-600 mt-2">{match.awayScore}</p>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-3">Venue: {match.venue} • Ref: {match.referee}</p>
              </div>

              <div className="flex gap-2 ml-6">
                <button 
                  onClick={() => handleEdit(match)}
                  className="text-yellow-600 hover:text-yellow-800 p-2 hover:bg-yellow-50 rounded"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(match.MatchID || match.id)}
                  className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule/Edit Match Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingMatch ? 'Edit Match' : 'Schedule New Match'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team 1 *
                  </label>
                  <select
                    required
                    value={formData.team1Id}
                    onChange={(e) => setFormData({...formData, team1Id: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Select Team 1</option>
                    {teams.map(team => (
                      <option key={team.TeamID || team.id} value={team.TeamID || team.id}>
                        {team.TeamName || team.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team 2 *
                  </label>
                  <select
                    required
                    value={formData.team2Id}
                    onChange={(e) => setFormData({...formData, team2Id: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Select Team 2</option>
                    {teams.filter(t => (t.TeamID || t.id) != formData.team1Id).map(team => (
                      <option key={team.TeamID || team.id} value={team.TeamID || team.id}>
                        {team.TeamName || team.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    League
                  </label>
                  <select
                    value={formData.leagueId}
                    onChange={(e) => setFormData({...formData, leagueId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">None</option>
                    {leagues.map(league => (
                      <option key={league.LeagueID || league.id} value={league.LeagueID || league.id}>
                        {league.LeagueName || league.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tournament
                  </label>
                  <select
                    value={formData.tournamentId}
                    onChange={(e) => setFormData({...formData, tournamentId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">None</option>
                    {tournaments.map(tournament => (
                      <option key={tournament.TournamentID || tournament.id} value={tournament.TournamentID || tournament.id}>
                        {tournament.TournamentName || tournament.tournamentName || tournament.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue
                  </label>
                  <select
                    value={formData.venueId}
                    onChange={(e) => setFormData({...formData, venueId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Select Venue</option>
                    {venues.map(venue => (
                      <option key={venue.VenueID || venue.id} value={venue.VenueID || venue.id}>
                        {venue.VenueName || venue.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referee
                  </label>
                  <select
                    value={formData.refereeId}
                    onChange={(e) => setFormData({...formData, refereeId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Select Referee</option>
                    {referees.map(referee => (
                      <option key={referee.RefereeID || referee.id} value={referee.RefereeID || referee.id}>
                        {referee.RefereeName || referee.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Match Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.matchDate}
                    onChange={(e) => setFormData({...formData, matchDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Match Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.matchTime}
                    onChange={(e) => setFormData({...formData, matchTime: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Live">Live</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingMatch ? 'Update Match' : 'Schedule Match'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Matches;
