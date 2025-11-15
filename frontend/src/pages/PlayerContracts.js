import React, { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2, Plus, X, Users, FileText } from 'lucide-react';
import apiService from '../services/apiService';

const PlayerContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [formData, setFormData] = useState({
    playerId: '',
    teamId: '',
    contractDetails: '',
    startDate: '',
    endDate: '',
    isCurrent: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [contractsData, playersData, teamsData] = await Promise.all([
        apiService.playerContracts.getAll(),
        apiService.players.getAll(),
        apiService.teams.getAll()
      ]);
      setContracts(contractsData);
      setPlayers(playersData);
      setTeams(teamsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingContract(null);
    setFormData({
      playerId: '',
      teamId: '',
      contractDetails: '',
      startDate: '',
      endDate: '',
      isCurrent: true
    });
    setShowModal(true);
  };

  const handleView = (contract) => {
    const player = players.find(p => p.PlayerID === contract.PlayerID);
    const team = teams.find(t => t.TeamID === contract.TeamID);
    
    const details = `
Player: ${player?.PlayerName || 'Unknown'} (${player?.PlayerRole || 'N/A'})
Team: ${team?.TeamName || 'Unknown'}
Contract Details: ${contract.ContractDetails || 'Not specified'}
Start Date: ${contract.StartDate ? new Date(contract.StartDate).toLocaleDateString() : 'N/A'}
End Date: ${contract.EndDate ? new Date(contract.EndDate).toLocaleDateString() : 'N/A'}
Status: ${contract.IsCurrent ? 'Active' : 'Inactive'}
    `.trim();
    
    alert(details);
  };

  const handleEdit = (contract) => {
    setEditingContract(contract);
    setFormData({
      playerId: contract.PlayerID,
      teamId: contract.TeamID,
      contractDetails: contract.ContractDetails || '',
      startDate: contract.StartDate ? contract.StartDate.split('T')[0] : '',
      endDate: contract.EndDate ? contract.EndDate.split('T')[0] : '',
      isCurrent: contract.IsCurrent === 1 || contract.IsCurrent === true
    });
    setShowModal(true);
  };

  const handleDelete = async (contractId) => {
    if (!window.confirm('Are you sure you want to delete this contract?')) return;
    try {
      await apiService.playerContracts.delete(contractId);
      setContracts(contracts.filter(c => c.PlayerTeamID !== contractId));
      alert('Contract deleted successfully');
    } catch (error) {
      alert('Failed to delete contract: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingContract) {
        await apiService.playerContracts.update(editingContract.PlayerTeamID, formData);
        alert('Contract updated successfully');
      } else {
        await apiService.playerContracts.create(formData);
        alert('Contract created successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert('Failed to save contract: ' + error.message);
    }
  };

  const getPlayerName = (playerId) => {
    const player = players.find(p => p.PlayerID === playerId);
    return player?.PlayerName || 'Unknown';
  };

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.TeamID === teamId);
    return team?.TeamName || 'Unknown';
  };

  if (loading) return <div className="text-center py-8">Loading contracts...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Player Contracts</h1>
          <p className="text-gray-600 mt-2">Manage player-team assignments and contract details</p>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-5 h-5" />
          Assign Player to Team
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Contract ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Player</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Team</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Contract Period</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {contracts.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-lg font-medium mb-2">No contracts found</p>
                    <p className="text-sm">Assign players to teams to create contracts</p>
                  </div>
                </td>
              </tr>
            ) : (
              contracts.map(contract => (
                <tr key={contract.PlayerTeamID} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900">
                    #{contract.PlayerTeamID}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {getPlayerName(contract.PlayerID)}
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      {getTeamName(contract.TeamID)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="text-sm">
                      {contract.StartDate ? new Date(contract.StartDate).toLocaleDateString() : 'N/A'} - 
                      {contract.EndDate ? new Date(contract.EndDate).toLocaleDateString() : 'Open'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {contract.IsCurrent ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button onClick={() => handleView(contract)} className="text-blue-600 hover:text-blue-800" title="View">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEdit(contract)} className="text-yellow-600 hover:text-yellow-800" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(contract.PlayerTeamID)} className="text-red-600 hover:text-red-800" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Contract Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  {editingContract ? 'Edit Contract' : 'Assign Player to Team'}
                </h2>
                <p className="text-gray-600 text-sm mt-1">Create or update player-team contract</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Player *
                  </label>
                  <select
                    required
                    value={formData.playerId}
                    onChange={(e) => setFormData({...formData, playerId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    disabled={editingContract}
                  >
                    <option value="">Select Player</option>
                    {players.map(player => (
                      <option key={player.PlayerID} value={player.PlayerID}>
                        {player.PlayerName} ({player.PlayerRole || 'N/A'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team *
                  </label>
                  <select
                    required
                    value={formData.teamId}
                    onChange={(e) => setFormData({...formData, teamId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Select Team</option>
                    {teams.map(team => (
                      <option key={team.TeamID} value={team.TeamID}>
                        {team.TeamName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contract Details
                </label>
                <textarea
                  value={formData.contractDetails}
                  onChange={(e) => setFormData({...formData, contractDetails: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  rows="3"
                  placeholder="Enter contract terms, salary, clauses, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isCurrent"
                  checked={formData.isCurrent}
                  onChange={(e) => setFormData({...formData, isCurrent: e.target.checked})}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isCurrent" className="text-sm font-medium text-gray-700">
                  This is the current active contract
                </label>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
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
                  {editingContract ? 'Update Contract' : 'Create Contract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerContracts;
