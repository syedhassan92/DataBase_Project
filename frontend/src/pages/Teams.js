import React, { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2, X } from 'lucide-react';
import apiService from '../services/apiService';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({
    teamName: '',
    leagueId: '',
    coachId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamsData, leaguesData] = await Promise.all([
        apiService.teams.getAll(),
        apiService.leagues.getAll()
      ]);
      setTeams(teamsData);
      setLeagues(leaguesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCoaches = async (currentCoachId = null) => {
    try {
      // Fetch unassigned coaches
      const unassignedCoaches = await apiService.get('/coaches', { unassigned: 'true' });
      
      // If editing and team has a coach, include that coach in the list
      if (currentCoachId) {
        const currentCoach = await apiService.coaches.getById(currentCoachId);
        // Add current coach if not already in the list
        const coachExists = unassignedCoaches.some(c => c.CoachID === currentCoachId);
        if (!coachExists) {
          setCoaches([currentCoach, ...unassignedCoaches]);
        } else {
          setCoaches(unassignedCoaches);
        }
      } else {
        setCoaches(unassignedCoaches);
      }
    } catch (error) {
      console.error('Error fetching coaches:', error);
      setCoaches([]);
    }
  };

  const handleAdd = async () => {
    setEditingTeam(null);
    setFormData({
      teamName: '',
      leagueId: '',
      coachId: ''
    });
    await fetchAvailableCoaches();
    setShowModal(true);
  };

  const handleEdit = async (team) => {
    setEditingTeam(team);
    setFormData({
      teamName: team.TeamName,
      leagueId: team.LeagueID || '',
      coachId: team.CoachID || ''
    });
    await fetchAvailableCoaches(team.CoachID);
    setShowModal(true);
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    
    try {
      await apiService.teams.delete(teamId);
      fetchData();
      alert('Team deleted successfully');
    } catch (error) {
      alert('Failed to delete team: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields (only teamName and leagueId are required)
    if (!formData.teamName || !formData.leagueId) {
      alert('Team Name and League are required fields');
      return;
    }
    
    try {
      const payload = {
        teamName: formData.teamName,
        leagueId: formData.leagueId,
        coachId: formData.coachId || null
      };

      if (editingTeam) {
        await apiService.teams.update(editingTeam.TeamID, payload);
        alert('Team updated successfully');
      } else {
        await apiService.teams.create(payload);
        alert('Team created successfully');
      }
      
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert('Failed to save team: ' + error.message);
    }
  };

  if (loading) return <div className="text-center py-8">Loading teams...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
        <button onClick={handleAdd} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Add Team
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map(team => (
          <div key={team.TeamID} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
            <h3 className="text-lg font-semibold text-gray-900">{team.TeamName}</h3>
            <p className="text-sm text-gray-600 mt-1">{team.TeamID}</p>
            
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p><strong>League:</strong> {team.LeagueNames || 'No League'}</p>
              <p><strong>Coach:</strong> {team.CoachNames || 'No Coach'}</p>
              <p><strong>Team ID:</strong> {team.TeamID}</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-center py-3 bg-gray-50 rounded">
              <div>
                <p className="text-sm font-bold text-gray-600">{new Date(team.CreatedAt).toLocaleDateString()}</p>
                <p className="text-xs text-gray-600">Created</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{team.TeamID}</p>
                <p className="text-xs text-gray-600">Team ID</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <button onClick={() => handleEdit(team)} className="text-yellow-600 hover:text-yellow-800">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(team.TeamID)} className="text-red-600 hover:text-red-800">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingTeam ? 'Edit Team' : 'Add New Team'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                  <input
                    type="text"
                    value={formData.teamName}
                    onChange={(e) => setFormData({...formData, teamName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">League *</label>
                  <select
                    value={formData.leagueId}
                    onChange={(e) => setFormData({...formData, leagueId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    required
                  >
                    <option value="">Select a league</option>
                    {leagues.map(league => (
                      <option key={league.LeagueID} value={league.LeagueID}>
                        {league.LeagueName} (ID: {league.LeagueID})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Required: Every team must belong to a league</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coach (Optional)</label>
                  <select
                    value={formData.coachId}
                    onChange={(e) => setFormData({...formData, coachId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Select a coach</option>
                    {coaches.map(coach => (
                      <option key={coach.CoachID} value={coach.CoachID}>
                        {coach.CoachName} - {coach.Experience} years exp (ID: {coach.CoachID})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">⚠️ Each coach can only coach one team</p>
                </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingTeam ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
