import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, X } from 'lucide-react';
import apiService from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const Matches = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);
  const [referees, setReferees] = useState([]);
  const [allVenues, setAllVenues] = useState([]);
  const [allReferees, setAllReferees] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showPlayerStatsModal, setShowPlayerStatsModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [matchScores, setMatchScores] = useState({ team1Score: 0, team2Score: 0 });
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
  const [statsData, setStatsData] = useState({
    team1Score: '',
    team2Score: '',
    team1Possession: '',
    team2Possession: '',
    winnerTeamId: '',
    highlights: ''
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
      console.log('Teams data:', teamsData);
      console.log('Leagues data:', leaguesData);
      console.log('Tournaments data:', tournamentsData);
      setMatches(matchesData);
      setTeams(teamsData);
      setAllVenues(venuesData);
      setAllReferees(refereesData);
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

  const fetchAvailableVenuesAndReferees = async (matchDate, matchTime, excludeMatchId = null) => {
    if (!matchDate || !matchTime) {
      setVenues(allVenues);
      setReferees(allReferees);
      return;
    }

    try {
      const params = { matchDate, matchTime };
      if (excludeMatchId) params.excludeMatchId = excludeMatchId;

      const [availableVenues, availableReferees] = await Promise.all([
        apiService.get('/matches/available/venues', params),
        apiService.get('/matches/available/referees', params)
      ]);

      setVenues(availableVenues);
      setReferees(availableReferees);
    } catch (error) {
      console.error('Error fetching available venues/referees:', error);
    }
  };

  const fetchTeamsByContext = async (leagueId, tournamentId) => {
    try {
      if (leagueId) {
        const leagueTeams = await apiService.teams.getByLeague(leagueId);
        setFilteredTeams(leagueTeams);
      } else if (tournamentId) {
        const tournamentTeams = await apiService.teams.getByTournament(tournamentId);
        setFilteredTeams(tournamentTeams);
      } else {
        setFilteredTeams(teams);
      }
    } catch (error) {
      console.error('Error fetching filtered teams:', error);
      setFilteredTeams(teams);
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
    setFilteredTeams(teams);
    setShowModal(true);
  };

  const handleEdit = async (match) => {
    setEditingMatch(match);
    let matchDate = match.MatchDate || match.matchDate || '';
    const matchTime = match.MatchTime || match.matchTime || '';

    // Format date to YYYY-MM-DD for input field
    if (matchDate) {
      const dateObj = new Date(matchDate);
      matchDate = dateObj.toISOString().split('T')[0];
    }

    const leagueId = match.LeagueID || match.leagueId || '';
    const tournamentId = match.TournamentID || match.tournamentId || '';

    setFormData({
      team1Id: match.Team1ID || match.team1Id || '',
      team2Id: match.Team2ID || match.team2Id || '',
      leagueId: leagueId,
      tournamentId: tournamentId,
      venueId: match.VenueID || match.venueId || '',
      refereeId: match.RefereeID || match.refereeId || '',
      matchDate: matchDate,
      matchTime: matchTime,
      status: match.Status || match.status || 'Scheduled'
    });

    // Fetch filtered teams based on league or tournament
    await fetchTeamsByContext(leagueId, tournamentId);

    // Don't fetch available venues/referees when just opening edit
    // Let them remain as is, user can change date/time to trigger refresh if needed
    setVenues(allVenues);
    setReferees(allReferees);
    setShowModal(true);
  };

  const handleDateTimeChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Fetch available venues and referees when both date and time are set
    if (newFormData.matchDate && newFormData.matchTime) {
      fetchAvailableVenuesAndReferees(
        newFormData.matchDate,
        newFormData.matchTime,
        editingMatch ? (editingMatch.MatchID || editingMatch.id) : null
      );
    }
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

    // If changing status to Completed, show stats modal
    if (editingMatch && formData.status === 'Completed' &&
      (editingMatch.Status !== 'Completed' || !editingMatch.Team1Score)) {
      setShowModal(false);
      setShowStatsModal(true);
      return;
    }

    try {
      // Clean the form data - convert empty strings to null for optional fields
      const cleanedData = {
        ...formData,
        leagueId: formData.leagueId || null,
        tournamentId: formData.tournamentId || null,
        venueId: formData.venueId || null,
        refereeId: formData.refereeId || null
      };

      if (editingMatch) {
        await apiService.matches.update(editingMatch.MatchID || editingMatch.id, cleanedData);
        alert('Match updated successfully');
      } else {
        await apiService.matches.create(cleanedData);
        alert('Match scheduled successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert('Failed to save match: ' + error.message);
    }
  };

  const handleStatsSubmit = async (e) => {
    e.preventDefault();
    try {
      const team1Poss = statsData.team1Possession ? parseInt(statsData.team1Possession) : 0;
      const team2Poss = statsData.team2Possession ? parseInt(statsData.team2Possession) : 0;

      // Validate possession sum
      if (team1Poss + team2Poss > 100) {
        alert('Error: Total possession cannot exceed 100%. Please adjust the possession values.');
        return;
      }

      const updateData = {
        ...formData,
        team1Score: parseInt(statsData.team1Score),
        team2Score: parseInt(statsData.team2Score),
        team1Possession: team1Poss,
        team2Possession: team2Poss,
        winnerTeamId: statsData.winnerTeamId || null,
        highlights: statsData.highlights || null,
        status: 'Completed'
      };

      await apiService.matches.update(editingMatch.MatchID || editingMatch.id, updateData);

      // Try to fetch players from both teams for player stats
      try {
        const [team1PlayersData, team2PlayersData] = await Promise.all([
          apiService.get(`/players?teamId=${formData.team1Id}`),
          apiService.get(`/players?teamId=${formData.team2Id}`)
        ]);

        setTeam1Players(team1PlayersData);
        setTeam2Players(team2PlayersData);
        setPlayerStats([]);
        setMatchScores({
          team1Score: parseInt(statsData.team1Score),
          team2Score: parseInt(statsData.team2Score)
        });

        // Show player stats modal
        setShowStatsModal(false);
        setShowPlayerStatsModal(true);
      } catch (playerError) {
        // If player fetch fails, just complete without player stats
        console.error('Could not fetch players:', playerError);
        alert('Match completed successfully! (Player stats not available)');
        setShowStatsModal(false);
        setStatsData({ team1Score: '', team2Score: '', team1Possession: '', team2Possession: '', winnerTeamId: '', highlights: '' });
        fetchData();
      }
    } catch (error) {
      alert('Failed to update match stats: ' + error.message);
    }
  };

  if (loading) return <div className="text-center py-8">Loading matches...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Matches</h1>
        {isAdmin && (
          <button
            onClick={handleSchedule}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Schedule Match
          </button>
        )}
      </div>

      <div className="space-y-4">
        {matches.map(match => {
          const matchDate = match.MatchDate || match.date;
          const matchTime = match.MatchTime || match.time;
          const formattedDate = matchDate ? new Date(matchDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'TBD';
          const formattedTime = matchTime ? matchTime.substring(0, 5) : 'TBD';

          return (
            <div key={match.MatchID || match.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">
                    {formattedDate} at {formattedTime} • {(match.Status || match.status || 'Scheduled').toUpperCase()}
                  </p>

                  <div className="flex items-center gap-6">
                    <div className="text-center flex-1">
                      <p className="font-semibold text-gray-900 text-lg">{match.Team1Name || match.homeTeamName || 'TBD'}</p>
                      {(match.Status === 'Completed' || match.status === 'completed') && (
                        <p className="text-2xl font-bold text-blue-600 mt-2">{match.Team1Score || match.homeScore || 0}</p>
                      )}
                    </div>

                    <div className="text-center">
                      <p className="text-gray-600">vs</p>
                      {(match.Status === 'Completed' || match.status === 'completed') && (
                        <p className="text-sm text-gray-600 mt-2">Final</p>
                      )}
                      {(match.Status === 'Scheduled' || match.status === 'scheduled') && (
                        <p className="text-sm text-gray-600 mt-2">-</p>
                      )}
                    </div>

                    <div className="text-center flex-1">
                      <p className="font-semibold text-gray-900 text-lg">{match.Team2Name || match.awayTeamName || 'TBD'}</p>
                      {(match.Status === 'Completed' || match.status === 'completed') && (
                        <p className="text-2xl font-bold text-red-600 mt-2">{match.Team2Score || match.awayScore || 0}</p>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mt-3">Venue: {match.VenueName || match.venue || 'TBD'} • Ref: {match.RefereeName || match.referee || 'TBD'}</p>
                </div>

                {isAdmin && (
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
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule/Edit Match Modal - Only render if admin */}
      {showModal && isAdmin && (
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
                    onChange={(e) => setFormData({ ...formData, team1Id: e.target.value })}
                    disabled={!formData.leagueId && !formData.tournamentId}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100"
                  >
                    <option value="">Select Team 1</option>
                    {filteredTeams.map(team => (
                      <option key={team.TeamID || team.id} value={team.TeamID || team.id}>
                        {team.TeamName || team.name}
                      </option>
                    ))}
                  </select>
                  {!formData.leagueId && !formData.tournamentId && (
                    <p className="text-xs text-gray-500 mt-1">Select a league or tournament first</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team 2 *
                  </label>
                  <select
                    required
                    value={formData.team2Id}
                    onChange={(e) => setFormData({ ...formData, team2Id: e.target.value })}
                    disabled={!formData.leagueId && !formData.tournamentId}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100"
                  >
                    <option value="">Select Team 2</option>
                    {filteredTeams.filter(t => String(t.TeamID || t.id) !== formData.team1Id).map(team => (
                      <option key={team.TeamID || team.id} value={team.TeamID || team.id}>
                        {team.TeamName || team.name}
                      </option>
                    ))}
                  </select>
                  {!formData.leagueId && !formData.tournamentId && (
                    <p className="text-xs text-gray-500 mt-1">Select a league or tournament first</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    League *
                  </label>
                  <select
                    value={formData.leagueId}
                    onChange={(e) => {
                      const newLeagueId = e.target.value;
                      setFormData({ ...formData, leagueId: newLeagueId, tournamentId: '', team1Id: '', team2Id: '' });
                      fetchTeamsByContext(newLeagueId, '');
                    }}
                    disabled={!!formData.tournamentId}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100"
                  >
                    <option value="">Select League</option>
                    {leagues.map(league => (
                      <option key={league.LeagueID || league.id} value={league.LeagueID || league.id}>
                        {league.LeagueName || league.name}
                      </option>
                    ))}
                  </select>
                  {formData.tournamentId && (
                    <p className="text-xs text-gray-500 mt-1">Disabled (Tournament selected)</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tournament *
                  </label>
                  <select
                    value={formData.tournamentId}
                    onChange={(e) => {
                      const newTournamentId = e.target.value;
                      setFormData({ ...formData, tournamentId: newTournamentId, leagueId: '', team1Id: '', team2Id: '' });
                      fetchTeamsByContext('', newTournamentId);
                    }}
                    disabled={!!formData.leagueId}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100"
                  >
                    <option value="">Select Tournament</option>
                    {tournaments.map(tournament => (
                      <option key={tournament.TournamentID || tournament.id} value={tournament.TournamentID || tournament.id}>
                        {tournament.TournamentName || tournament.tournamentName || tournament.name}
                      </option>
                    ))}
                  </select>
                  {formData.leagueId && (
                    <p className="text-xs text-gray-500 mt-1">Disabled (League selected)</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue
                  </label>
                  <select
                    value={formData.venueId}
                    onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, refereeId: e.target.value })}
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
                    onChange={(e) => handleDateTimeChange('matchDate', e.target.value)}
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
                    onChange={(e) => handleDateTimeChange('matchTime', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">Available venues and referees will update based on selected date/time</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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

      {/* Match Stats Modal - Only render if admin */}
      {showStatsModal && editingMatch && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">Complete Match Stats</h2>
              <button
                onClick={() => {
                  setShowStatsModal(false);
                  setStatsData({ team1Score: '', team2Score: '', team1Possession: '', team2Possession: '', winnerTeamId: '', highlights: '' });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleStatsSubmit} className="p-6">
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900">
                  {teams.find(t => t.TeamID === formData.team1Id)?.TeamName} vs {teams.find(t => t.TeamID === formData.team2Id)?.TeamName}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {formData.matchDate && new Date(formData.matchDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {teams.find(t => t.TeamID === formData.team1Id)?.TeamName} Score *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={statsData.team1Score}
                    onChange={(e) => setStatsData({ ...statsData, team1Score: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {teams.find(t => t.TeamID === formData.team2Id)?.TeamName} Score *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={statsData.team2Score}
                    onChange={(e) => setStatsData({ ...statsData, team2Score: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {teams.find(t => t.TeamID === formData.team1Id)?.TeamName} Possession (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={statsData.team1Possession}
                    onChange={(e) => setStatsData({ ...statsData, team1Possession: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {teams.find(t => t.TeamID === formData.team2Id)?.TeamName} Possession (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={statsData.team2Possession}
                    onChange={(e) => setStatsData({ ...statsData, team2Possession: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Winner Team
                  </label>
                  <select
                    value={statsData.winnerTeamId}
                    onChange={(e) => setStatsData({ ...statsData, winnerTeamId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Draw / No Winner</option>
                    <option value={formData.team1Id}>{teams.find(t => t.TeamID === formData.team1Id)?.TeamName}</option>
                    <option value={formData.team2Id}>{teams.find(t => t.TeamID === formData.team2Id)?.TeamName}</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Match Highlights
                  </label>
                  <textarea
                    value={statsData.highlights}
                    onChange={(e) => setStatsData({ ...statsData, highlights: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    rows="4"
                    placeholder="Enter match highlights, key moments, or summary..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowStatsModal(false);
                    setStatsData({ team1Score: '', team2Score: '', team1Possession: '', team2Possession: '', winnerTeamId: '', highlights: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Complete Match
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Player Stats Modal - Only render if admin */}
      {showPlayerStatsModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">Enter Player Statistics</h2>
              <button
                onClick={() => {
                  setShowPlayerStatsModal(false);
                  setPlayerStats([]);
                  setStatsData({ team1Score: '', team2Score: '', team1Possession: '', team2Possession: '', winnerTeamId: '', highlights: '' });
                  fetchData();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-semibold text-yellow-900 mb-2">
                  Match Score: {teams.find(t => t.TeamID === formData.team1Id)?.TeamName} {matchScores.team1Score} - {matchScores.team2Score} {teams.find(t => t.TeamID === formData.team2Id)?.TeamName}
                </p>
                <p className="text-xs text-yellow-700">
                  <strong>Important:</strong> Total goals for each team cannot exceed their score. Total assists must equal total goals (every goal needs an assist).
                </p>
              </div>

              {/* Player Stats Entries */}
              <div className="space-y-4 mb-6">
                {playerStats.map((stat, index) => (
                  <div key={index} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Player *
                        </label>
                        <select
                          value={stat.playerId}
                          onChange={(e) => {
                            const newStats = [...playerStats];
                            newStats[index].playerId = e.target.value;
                            setPlayerStats(newStats);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        >
                          <option value="">Select Player</option>
                          <optgroup label={teams.find(t => t.TeamID === formData.team1Id)?.TeamName}>
                            {team1Players.map(player => (
                              <option key={player.PlayerID} value={player.PlayerID}>
                                {player.PlayerName}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label={teams.find(t => t.TeamID === formData.team2Id)?.TeamName}>
                            {team2Players.map(player => (
                              <option key={player.PlayerID} value={player.PlayerID}>
                                {player.PlayerName}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Goals
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={stat.goals}
                          onChange={(e) => {
                            const newStats = [...playerStats];
                            newStats[index].goals = e.target.value;
                            setPlayerStats(newStats);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          placeholder="0"
                        />
                      </div>

                      {/* Add other stat fields here if needed */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Matches;
