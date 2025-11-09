import React, { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import apiService from '../services/apiService';

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const data = await apiService.players.getAll();
        setPlayers(data);
      } catch (error) {
        console.error('Error fetching players:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  if (loading) return <div className="text-center py-8">Loading players...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Players</h1>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Add Player
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Position</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nationality</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Age</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Goals</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Assists</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Market Value</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {players.map(player => (
              <tr key={player.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">
                  <div>
                    <p>{player.name}</p>
                    <p className="text-sm text-gray-600">#{player.number}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{player.position}</td>
                <td className="px-6 py-4 text-gray-600">{player.nationality}</td>
                <td className="px-6 py-4 text-gray-600">{player.age}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-semibold">
                    {player.goals}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-semibold">
                    {player.assists}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-gray-900">
                  €{(player.marketValue / 1000000).toFixed(0)}M
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="text-yellow-600 hover:text-yellow-800">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Players;
