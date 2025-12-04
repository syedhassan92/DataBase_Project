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
  const [editingMatch, setEditingMatch] = useState(null);
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [formData, setFormData] = useState({
    team1Id: '',
    team2Id: '',
    leagueId: '',
    tournamentId: '',
    venueId: '',
    refereeId: '',
    matchDate: '',
    matchTime: '',
    status: 'Scheduled',
    team1Score: '',
    team2Score: '',
    winnerTeamId: '',
    highlights: '',
    team1Possession: '',
    team2Possession: ''
  });


  useEffect(() => {
    fetchData();
  }, []);

  const fetchPlayersForMatch = async () => {
    if (!formData.team1Id || !formData.team2Id) return;
    
    try {
      const [team1PlayersData, team2PlayersData] = await Promise.all([
        apiService.players.getAll({ teamId: formData.team1Id }),
        apiService.players.getAll({ teamId: formData.team2Id })
      ]);
      setTeam1Players(team1PlayersData);
      setTeam2Players(team2PlayersData);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  useEffect(() => {
    // Fetch players when teams are selected and status is Completed
    if (formData.status === 'Completed' && formData.team1Id && formData.team2Id) {
      fetchPlayersForMatch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.team1Id, formData.team2Id, formData.status]);

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
      status: 'Scheduled',
      team1Score: '',
      team2Score: '',
      winnerTeamId: '',
      highlights: '',
      team1Possession: '',
      team2Possession: ''
    });
    setFilteredTeams(teams);
    setPlayerStats([]);
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
      status: match.Status || match.status || 'Scheduled',
      team1Score: match.Team1Score || match.team1Score || '',
      team2Score: match.Team2Score || match.team2Score || '',
      winnerTeamId: match.WinnerTeamID || match.winnerTeamId || '',
      highlights: match.Highlights || match.highlights || '',
      team1Possession: '',
      team2Possession: ''
    });

    // Fetch filtered teams based on league or tournament
    await fetchTeamsByContext(leagueId, tournamentId);

    // Don't fetch available venues/referees when just opening edit
    // Let them remain as is, user can change date/time to trigger refresh if needed
    setVenues(allVenues);
    setReferees(allReferees);
    setPlayerStats([]);
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

    // Validate possession if status is Completed
    if (formData.status === 'Completed' && (formData.team1Possession || formData.team2Possession)) {
      const team1Poss = parseInt(formData.team1Possession) || 0;
      const team2Poss = parseInt(formData.team2Possession) || 0;
      if (team1Poss + team2Poss > 100) {
        alert('Error: Total possession cannot exceed 100%. Please adjust the possession values.');
        return;
      }
    }

    try {
      // Clean the form data - convert empty strings to null for optional fields
      const cleanedData = {
        ...formData,
        leagueId: formData.leagueId || null,
        tournamentId: formData.tournamentId || null,
        venueId: formData.venueId || null,
        refereeId: formData.refereeId || null,
        team1Possession: formData.team1Possession || 0,
        team2Possession: formData.team2Possession || 0
      };

      let matchId;
      if (editingMatch) {
        await apiService.matches.update(editingMatch.MatchID || editingMatch.id, cleanedData);
        matchId = editingMatch.MatchID || editingMatch.id;
        alert('Match updated successfully');
      } else {
        const createdMatch = await apiService.matches.create(cleanedData);
        matchId = createdMatch.matchId || createdMatch.MatchID || createdMatch.id || createdMatch.insertId;
        
        // If creating a completed match with player stats, save them
        if (formData.status === 'Completed' && playerStats.length > 0) {
          try {
            const validPlayerStats = playerStats.filter(stat => stat.playerId);
            if (validPlayerStats.length > 0) {
              await apiService.post('/stats/players', {
                matchId: matchId,
                playerStats: validPlayerStats.map(stat => ({
                  playerId: stat.playerId,
                  goals: parseInt(stat.goals) || 0,
                  assists: parseInt(stat.assists) || 0,
                  rating: parseFloat(stat.rating) || 0
                }))
              });
              console.log('Player stats submitted successfully');
            }
          } catch (statsError) {
            console.error('Failed to save player stats:', statsError);
            alert('Match created successfully, but failed to save player stats: ' + statsError.message);
            setShowModal(false);
            setPlayerStats([]);
            fetchData();
            return;
          }
        }
        
        alert('Match scheduled successfully');
      }

      setShowModal(false);
      setPlayerStats([]); // Clear player stats
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
          const leagueName = match.LeagueName || match.leagueName || '';
          const tournamentName = match.TournamentName || match.tournamentName || '';
          const context = leagueName || tournamentName || 'No Context';

          return (
            <div key={match.MatchID || match.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-sm text-gray-600">
                      {formattedDate} at {formattedTime}
                    </p>
                    <span className="text-gray-400">•</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      (match.Status || match.status || 'Scheduled').toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                      (match.Status || match.status || 'Scheduled').toLowerCase() === 'live' ? 'bg-red-100 text-red-800' :
                      (match.Status || match.status || 'Scheduled').toLowerCase() === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {(match.Status || match.status || 'Scheduled').toUpperCase()}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      leagueName ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {leagueName ? `⚽ ${leagueName}` : `🏆 ${tournamentName}`}
                    </span>
                  </div>

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
                    {(match.Status !== 'Completed' && match.status !== 'completed') && (
                      <button
                        onClick={() => handleEdit(match)}
                        className="text-yellow-600 hover:text-yellow-800 p-2 hover:bg-yellow-50 rounded"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
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
                    Venue {formData.status === 'Completed' && '*'}
                  </label>
                  <select
                    value={formData.venueId}
                    onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
                    required={formData.status === 'Completed'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Select Venue</option>
                    {venues.map(venue => (
                      <option key={venue.VenueID || venue.id} value={venue.VenueID || venue.id}>
                        {venue.VenueName || venue.name}
                      </option>
                    ))}
                  </select>
                  {formData.status === 'Completed' && (
                    <p className="text-xs text-red-600 mt-1">Required for completed matches</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referee {formData.status === 'Completed' && '*'}
                  </label>
                  <select
                    value={formData.refereeId}
                    onChange={(e) => setFormData({ ...formData, refereeId: e.target.value })}
                    required={formData.status === 'Completed'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Select Referee</option>
                    {referees.map(referee => (
                      <option key={referee.RefereeID || referee.id} value={referee.RefereeID || referee.id}>
                        {referee.RefereeName || referee.name}
                      </option>
                    ))}
                  </select>
                  {formData.status === 'Completed' && (
                    <p className="text-xs text-red-600 mt-1">Required for completed matches</p>
                  )}
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
                    {(() => {
                      const currentDate = new Date();
                      const matchDate = formData.matchDate ? new Date(formData.matchDate) : null;
                      const matchTime = formData.matchTime || '';
                      
                      // Reset time for date comparison
                      if (matchDate) {
                        currentDate.setHours(0, 0, 0, 0);
                        matchDate.setHours(0, 0, 0, 0);
                      }
                      
                      const currentTimeString = new Date().toTimeString().slice(0, 5);
                      
                      // Match is in the past
                      if (matchDate && matchDate < currentDate) {
                        return (
                          <>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </>
                        );
                      }
                      // Match is today but time has passed or is equal to current time
                      else if (matchDate && matchDate.getTime() === currentDate.getTime() && matchTime && matchTime <= currentTimeString) {
                        return (
                          <>
                            <option value="Completed">Completed</option>
                            <option value="Live">Live</option>
                            <option value="Cancelled">Cancelled</option>
                          </>
                        );
                      }
                      // Future match or match is today with time still in the future
                      else {
                        return (
                          <>
                            <option value="Scheduled">Scheduled</option>
                            <option value="Live">Live</option>
                            <option value="Cancelled">Cancelled</option>
                          </>
                        );
                      }
                    })()}
                  </select>
                  {(() => {
                    const currentDate = new Date();
                    const matchDate = formData.matchDate ? new Date(formData.matchDate) : null;
                    const matchTime = formData.matchTime || '';
                    
                    if (matchDate) {
                      currentDate.setHours(0, 0, 0, 0);
                      matchDate.setHours(0, 0, 0, 0);
                      
                      const currentTimeString = new Date().toTimeString().slice(0, 5);
                      
                      if (matchDate < currentDate) {
                        return <p className="text-xs text-amber-600 mt-1">⚠️ Past date: Only Completed or Cancelled allowed</p>;
                      } else if (matchDate.getTime() === currentDate.getTime() && matchTime && matchTime <= currentTimeString) {
                        return <p className="text-xs text-amber-600 mt-1">⚠️ Time has passed: Scheduled status not allowed</p>;
                      }
                    }
                    return null;
                  })()}
                </div>
              </div>

              {/* Show score fields if status is Completed */}
              {formData.status === 'Completed' && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Results (Required for Completed Status)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Team 1 Score *
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formData.team1Score || ''}
                        onChange={(e) => setFormData({ ...formData, team1Score: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Team 2 Score *
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formData.team2Score || ''}
                        onChange={(e) => setFormData({ ...formData, team2Score: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Team 1 Possession (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.team1Possession || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          if (value >= 0 && value <= 100) {
                            setFormData({ ...formData, team1Possession: e.target.value });
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="0-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Team 2 Possession (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.team2Possession || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          if (value >= 0 && value <= 100) {
                            setFormData({ ...formData, team2Possession: e.target.value });
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="0-100"
                      />
                    </div>
                  </div>
                  {(formData.team1Possession || formData.team2Possession) && (
                    <p className="text-xs text-gray-500 mt-1">
                      Total: {(parseInt(formData.team1Possession) || 0) + (parseInt(formData.team2Possession) || 0)}%
                      {(parseInt(formData.team1Possession) || 0) + (parseInt(formData.team2Possession) || 0) > 100 && (
                        <span className="text-red-600 ml-2">⚠ Total cannot exceed 100%</span>
                      )}
                    </p>
                  )}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Winner Team
                    </label>
                    <select
                      value={formData.winnerTeamId || ''}
                      onChange={(e) => setFormData({ ...formData, winnerTeamId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">Draw (No Winner)</option>
                      {formData.team1Id && (
                        <option value={formData.team1Id}>
                          {filteredTeams.find(t => t.TeamID === parseInt(formData.team1Id))?.TeamName || 'Team 1'}
                        </option>
                      )}
                      {formData.team2Id && (
                        <option value={formData.team2Id}>
                          {filteredTeams.find(t => t.TeamID === parseInt(formData.team2Id))?.TeamName || 'Team 2'}
                        </option>
                      )}
                    </select>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Highlights
                    </label>
                    <textarea
                      value={formData.highlights || ''}
                      onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="Enter match highlights..."
                    />
                  </div>

                  {/* Player Stats Section - Only show when status is Completed */}
                  {formData.status === 'Completed' && formData.team1Id && formData.team2Id && (
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-semibold text-gray-900">Player Statistics (Optional)</h4>
                      <button
                        type="button"
                        onClick={() => {
                          setPlayerStats([...playerStats, {
                            playerId: '',
                            goals: '',
                            assists: '',
                            rating: ''
                          }]);
                        }}
                        className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        + Add Player
                      </button>
                    </div>

                    {playerStats.length === 0 && (
                      <p className="text-sm text-gray-500 italic mb-4">No player statistics added. Click "Add Player" to add stats.</p>
                    )}

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {playerStats.map((stat, index) => (
                        <div key={index} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-sm font-medium text-gray-700">Player {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newStats = playerStats.filter((_, i) => i !== index);
                                setPlayerStats(newStats);
                              }}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Player *
                              </label>
                              <select
                                value={stat.playerId}
                                onChange={(e) => {
                                  const newStats = [...playerStats];
                                  newStats[index].playerId = e.target.value;
                                  setPlayerStats(newStats);
                                }}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                              >
                                <option value="">Select Player</option>
                                {formData.team1Id && (
                                  <optgroup label={`${filteredTeams.find(t => t.TeamID === parseInt(formData.team1Id))?.TeamName || 'Team 1'} Players`}>
                                    {team1Players.map(player => (
                                      <option key={player.PlayerID} value={player.PlayerID}>
                                        {player.PlayerName}
                                      </option>
                                    ))}
                                  </optgroup>
                                )}
                                {formData.team2Id && (
                                  <optgroup label={`${filteredTeams.find(t => t.TeamID === parseInt(formData.team2Id))?.TeamName || 'Team 2'} Players`}>
                                    {team2Players.map(player => (
                                      <option key={player.PlayerID} value={player.PlayerID}>
                                        {player.PlayerName}
                                      </option>
                                    ))}
                                  </optgroup>
                                )}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Assists
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={stat.assists}
                                onChange={(e) => {
                                  const newStats = [...playerStats];
                                  newStats[index].assists = e.target.value;
                                  setPlayerStats(newStats);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                placeholder="0"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Rating (0-10)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                value={stat.rating}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value);
                                  if ((value >= 0 && value <= 10) || e.target.value === '') {
                                    const newStats = [...playerStats];
                                    newStats[index].rating = e.target.value;
                                    setPlayerStats(newStats);
                                  }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                placeholder="0.0"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {playerStats.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-900">
                          <strong>Note:</strong> Player statistics are optional. You can add them now or update them later. 
                          Total goals from all players should match team scores.
                        </p>
                      </div>
                    )}
                  </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setPlayerStats([]);
                  }}
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
