import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, User, Phone, Award, Search, Users } from 'lucide-react';
import apiService from '../services/apiService';

const Coaches = () => {
  const [coaches, setCoaches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCoach, setEditingCoach] = useState(null);
  const [formData, setFormData] = useState({
    coachName: '',
    contact: '',
    experience: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coachesData, teamsData] = await Promise.all([
        apiService.coaches.getAll(),
        apiService.teams.getAll(),
      ]);
      setCoaches(coachesData);
      setTeams(teamsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCoach(null);
    setFormData({
      coachName: '',
      contact: '',
      experience: '',
    });
    setShowModal(true);
  };

  const handleEdit = (coach) => {
    setEditingCoach(coach);
    setFormData({
      coachName: coach.CoachName,
      contact: coach.Contact,
      experience: coach.Experience,
    });
    setShowModal(true);
  };

  const handleDelete = async (coachId) => {
    if (window.confirm('Are you sure you want to delete this coach?')) {
      try {
        await apiService.coaches.delete(coachId);
        alert('Coach deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting coach:', error);
        alert('Failed to delete coach: ' + error.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const coachData = {
        coachName: formData.coachName,
        contact: formData.contact,
        experience: parseInt(formData.experience) || 0,
      };

      if (editingCoach) {
        await apiService.coaches.update(editingCoach.CoachID, coachData);
        alert('Coach updated successfully');
      } else {
        await apiService.coaches.create(coachData);
        alert('Coach created successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving coach:', error);
      alert('Failed to save coach: ' + error.message);
    }
  };

  const getCoachTeams = (coachId) => {
    return teams.filter(team => team.CoachID === coachId);
  };

  const filteredCoaches = coaches.filter(coach =>
    coach.CoachName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coach.Contact?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading coaches...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Coach Management</h1>
          <p className="text-gray-600 mt-2">Manage coaching staff</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-3 rounded-lg hover:from-orange-700 hover:to-orange-600 transition shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Coach
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search coaches by name or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Coaches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCoaches.map((coach) => {
          const coachTeams = getCoachTeams(coach.CoachID);
          return (
            <div key={coach.CoachID} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">#{coach.CoachID}</div>
                    <h3 className="text-xl font-bold text-gray-900">{coach.CoachName}</h3>
                    <div className="flex items-center gap-1 text-sm text-orange-600">
                      <Award className="w-4 h-4" />
                      <span>{coach.Experience} years exp.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{coach.Contact}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>
                    {coachTeams.length > 0 
                      ? coachTeams.map(t => t.TeamName).join(', ')
                      : 'No team assigned'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => handleEdit(coach)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(coach.CoachID)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCoaches.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No coaches found</h3>
          <p className="text-gray-500">Add your first coach to get started</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingCoach ? 'Edit Coach' : 'Add New Coach'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coach Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.coachName}
                    onChange={(e) => setFormData({ ...formData, coachName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                    placeholder="Enter coach name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                    placeholder="+44 123 456 7890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                    placeholder="15"
                  />
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
                  {editingCoach ? 'Update Coach' : 'Add Coach'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coaches;
