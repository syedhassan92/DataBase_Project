import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Calendar, Trophy, Users, Search, Filter, BarChart3 } from 'lucide-react';
import apiService from '../services/apiService';

const Tournaments = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTournament, setEditingTournament] = useState(null);
  const [formData, setFormData] = useState({
    tournamentName: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'upcoming',
    leagueId: '',
    selectedTeams: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tournamentsData, leaguesData, teamsData] = await Promise.all([
        apiService.tournaments.getAll(),
        apiService.leagues.getAll(),
        apiService.teams.getAll(),
      ]);
      setTournaments(tournamentsData);
      setLeagues(leaguesData);
      setTeams(
        teamsData.map((team) => ({
          id: team.TeamID ?? team.id,
          name: team.TeamName ?? team.name,
        }))
      );
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTournament(null);
    setFormData({
      tournamentName: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'upcoming',
      leagueId: '',
      selectedTeams: [],
    });
    setShowModal(true);
  };

  const handleEdit = (tournament) => {
    setEditingTournament(tournament);
    setFormData({
      tournamentName: tournament.tournamentName || tournament.name || '',
      description: tournament.description || '',
      startDate: tournament.startDate || '',
      endDate: tournament.endDate || '',
      status: tournament.status || 'upcoming',
      leagueId: tournament.leagueId ? tournament.leagueId.toString() : '',
      selectedTeams: tournament.teams || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this tournament?')) {
      try {
        await apiService.tournaments.delete(id);
        setTournaments(tournaments.filter(t => t.id !== id));
      } catch (error) {
        console.error('Error deleting tournament:', error);
        alert('Failed to delete tournament');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        tournamentName: formData.tournamentName,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        leagueId: formData.leagueId || null,
        selectedTeams: formData.selectedTeams,
      };

      if (editingTournament) {
        const updatedTournament = await apiService.tournaments.update(editingTournament.id, payload);
        setTournaments(tournaments.map(t => 
          t.id === editingTournament.id ? updatedTournament : t
        ));
        alert('Tournament updated successfully');
      } else {
        const createdTournament = await apiService.tournaments.create(payload);
        setTournaments([createdTournament, ...tournaments]);
        alert('Tournament created successfully');
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error saving tournament:', error);
      alert('Failed to save tournament');
    }
  };

  const handleTeamToggle = (teamId) => {
    setFormData(prev => ({
      ...prev,
      selectedTeams: prev.selectedTeams.includes(teamId)
        ? prev.selectedTeams.filter(id => id !== teamId)
        : [...prev.selectedTeams, teamId]
    }));
  };

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.tournamentName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || tournament.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading tournaments...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Tournament Management</h1>
          <p className="text-gray-600 mt-2">Organize and manage tournaments</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-3 rounded-lg hover:from-orange-700 hover:to-orange-600 transition shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Create Tournament
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tournaments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none text-gray-900 bg-white"
            >
              <option value="all" className="text-gray-900">All Status</option>
              <option value="upcoming" className="text-gray-900">Upcoming</option>
              <option value="ongoing" className="text-gray-900">Ongoing</option>
              <option value="completed" className="text-gray-900">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTournaments.map((tournament) => (
          <div key={tournament.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-orange-600" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {tournament.tournamentName || tournament.name}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">Tournament ID: #{tournament.id}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(tournament.status)}`}>
                {tournament.status}
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{tournament.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{tournament.startDate} - {tournament.endDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Users className="w-4 h-4 text-gray-400" />
                <span>{tournament.totalTeams || tournament.teams?.length || 0} Teams</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t">
              <button
                onClick={() => navigate(`/tournaments/${tournament.id}`)}
                className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition font-semibold"
              >
                <BarChart3 className="w-4 h-4" />
                View Tournament Stats
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(tournament)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(tournament.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTournaments.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No tournaments found</h3>
          <p className="text-gray-500">Create your first tournament to get started</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingTournament ? 'Edit Tournament' : 'Create New Tournament'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tournament Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tournamentName}
                    onChange={(e) => setFormData({ ...formData, tournamentName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    placeholder="Enter tournament name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    placeholder="Enter tournament description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white"
                    >
                      <option value="upcoming" className="text-gray-900">Upcoming</option>
                      <option value="ongoing" className="text-gray-900">Ongoing</option>
                      <option value="completed" className="text-gray-900">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      League
                    </label>
                    <select
                      value={formData.leagueId}
                      onChange={(e) => setFormData({ ...formData, leagueId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-white"
                    >
                      <option value="" className="text-gray-900">Select League</option>
                      {leagues.map(league => (
                        <option key={league.id} value={league.leagueId || league.id} className="text-gray-900">
                          {league.leagueName || league.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Participating Teams
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <div className="space-y-2">
                      {teams.map(team => (
                        <label key={team.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.selectedTeams.includes(team.id)}
                            onChange={() => handleTeamToggle(team.id)}
                            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                          />
                          <span className="text-sm text-gray-700">{team.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.selectedTeams.length} team(s) selected
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg hover:from-orange-700 hover:to-orange-600 transition"
                >
                  {editingTournament ? 'Update Tournament' : 'Create Tournament'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tournaments;
