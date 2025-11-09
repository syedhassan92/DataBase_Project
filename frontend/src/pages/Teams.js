import React, { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import apiService from '../services/apiService';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await apiService.teams.getAll();
        setTeams(data);
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  if (loading) return <div className="text-center py-8">Loading teams...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Add Team
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map(team => (
          <div key={team.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
            <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{team.abbreviation}</p>
            
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p><strong>City:</strong> {team.city}</p>
              <p><strong>Stadium:</strong> {team.stadium}</p>
              <p><strong>Coach:</strong> {team.coach}</p>
              <p><strong>Founded:</strong> {team.founded}</p>
              <p><strong>Players:</strong> {team.totalPlayers}</p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center py-3 bg-gray-50 rounded">
              <div>
                <p className="text-2xl font-bold text-green-600">{team.wins}</p>
                <p className="text-xs text-gray-600">Wins</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{team.draws}</p>
                <p className="text-xs text-gray-600">Draws</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{team.losses}</p>
                <p className="text-xs text-gray-600">Losses</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <button className="text-blue-600 hover:text-blue-800">
                <Eye className="w-4 h-4" />
              </button>
              <button className="text-yellow-600 hover:text-yellow-800">
                <Edit2 className="w-4 h-4" />
              </button>
              <button className="text-red-600 hover:text-red-800">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teams;
