import React, { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2, Plus, X } from 'lucide-react';
import apiService from '../services/apiService';

const Leagues = () => {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLeague, setEditingLeague] = useState(null);
  const [formData, setFormData] = useState({
    leagueName: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await apiService.leagues.getAll();
      setLeagues(data);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingLeague(null);
    setFormData({
      leagueName: '',
      startDate: '',
      endDate: ''
    });
    setShowModal(true);
  };

  const handleView = (league) => {
    const details = `
League: ${league.LeagueName}
Start Date: ${league.StartDate ? new Date(league.StartDate).toLocaleDateString() : 'N/A'}
End Date: ${league.EndDate ? new Date(league.EndDate).toLocaleDateString() : 'N/A'}
Created: ${league.CreatedAt ? new Date(league.CreatedAt).toLocaleDateString() : 'N/A'}
    `.trim();
    alert(details);
  };

  const handleEdit = (league) => {
    setEditingLeague(league);
    setFormData({
      leagueName: league.LeagueName || '',
      startDate: league.StartDate ? league.StartDate.split('T')[0] : '',
      endDate: league.EndDate ? league.EndDate.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (leagueId) => {
    if (!window.confirm('Are you sure you want to delete this league?')) return;
    try {
      await apiService.leagues.delete(leagueId);
      setLeagues(leagues.filter(l => l.LeagueID !== leagueId));
      alert('League deleted successfully');
    } catch (error) {
      alert('Failed to delete league: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLeague) {
        await apiService.leagues.update(editingLeague.LeagueID, formData);
        alert('League updated successfully');
      } else {
        await apiService.leagues.create(formData);
        alert('League created successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert('Failed to save league: ' + error.message);
    }
  };

  if (loading) return <div className="text-center py-8">Loading leagues...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Leagues</h1>
        <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-5 h-5" />
          Add League
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">League ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">League Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Start Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">End Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {leagues.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <p className="text-lg font-medium mb-2">No leagues found</p>
                    <p className="text-sm">Click "Add League" to create your first league</p>
                  </div>
                </td>
              </tr>
            ) : (
              leagues.map(league => (
                <tr key={league.LeagueID} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">
                    #{league.LeagueID}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {league.LeagueName}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {league.StartDate ? new Date(league.StartDate).toLocaleDateString() : 'Not set'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {league.EndDate ? new Date(league.EndDate).toLocaleDateString() : 'Not set'}
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button onClick={() => handleView(league)} className="text-blue-600 hover:text-blue-800" title="View">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEdit(league)} className="text-yellow-600 hover:text-yellow-800" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(league.LeagueID)} className="text-red-600 hover:text-red-800" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit League Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingLeague ? 'Edit League' : 'Add New League'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  League Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.leagueName}
                  onChange={(e) => setFormData({...formData, leagueName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Enter league name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
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
                  {editingLeague ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leagues;
