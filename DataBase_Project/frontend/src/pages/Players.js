import React, { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2, Plus, X } from 'lucide-react';
import apiService from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const Players = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [players, setPlayers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [formData, setFormData] = useState({
    playerName: '',
    playerRole: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const playersData = await apiService.players.getAll();
      setPlayers(playersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingPlayer(null);
    setFormData({
      playerName: '',
      playerRole: ''
    });
    setShowModal(true);
  };

  const handleView = (player) => {
    alert(`View player: ${player.name || player.PlayerName}`);
  };

  const handleEdit = (player) => {
    setEditingPlayer(player);
    setFormData({
      playerName: player.PlayerName || player.name || '',
      playerRole: player.PlayerRole || player.role || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (playerId) => {
    if (!window.confirm('Are you sure you want to delete this player?')) return;
    try {
      await apiService.players.delete(playerId);
      setPlayers(players.filter(p => (p.id || p.PlayerID) !== playerId));
      alert('Player deleted successfully');
    } catch (error) {
      alert('Failed to delete player: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlayer) {
        await apiService.players.update(editingPlayer.PlayerID || editingPlayer.id, formData);
        alert('Player updated successfully');
      } else {
        await apiService.players.create(formData);
        alert('Player created successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert('Failed to save player: ' + error.message);
    }
  };

  if (loading) return <div className="text-center py-8">Loading players...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Players</h1>
        {isAdmin && (
          <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            <Plus className="w-5 h-5" />
            Add Player
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Player ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Player Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Player Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {players.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <p className="text-lg font-medium mb-2">No players found</p>
                    {isAdmin && <p className="text-sm">Click "Add Player" to create your first player</p>}
                  </div>
                </td>
              </tr>
            ) : (
              players.map(player => (
                <tr key={player.PlayerID} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">
                    #{player.PlayerID}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {player.PlayerName}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {player.PlayerRole || 'Not specified'}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button onClick={() => handleView(player)} className="text-blue-600 hover:text-blue-800" title="View">
                      <Eye className="w-4 h-4" />
                    </button>
                    {isAdmin && (
                      <>
                        <button onClick={() => handleEdit(player)} className="text-yellow-600 hover:text-yellow-800" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(player.PlayerID)} className="text-red-600 hover:text-red-800" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Player Modal - Only render if admin */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingPlayer ? 'Edit Player' : 'Add New Player'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Player Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.playerName}
                  onChange={(e) => setFormData({ ...formData, playerName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Enter player name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Player Role
                </label>
                <input
                  type="text"
                  value={formData.playerRole}
                  onChange={(e) => setFormData({ ...formData, playerRole: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="e.g., Forward, Midfielder, Defender, Goalkeeper"
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
                  {editingPlayer ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Players;
