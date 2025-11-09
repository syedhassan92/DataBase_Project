import React, { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import apiService from '../services/apiService';

const Leagues = () => {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const data = await apiService.leagues.getAll();
        setLeagues(data);
      } catch (error) {
        console.error('Error fetching leagues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, []);

  if (loading) return <div className="text-center py-8">Loading leagues...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Leagues</h1>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Add League
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Country</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Season</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Teams</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {leagues.map(league => (
              <tr key={league.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{league.name}</td>
                <td className="px-6 py-4 text-gray-600">{league.country}</td>
                <td className="px-6 py-4 text-gray-600">{league.season}</td>
                <td className="px-6 py-4 text-gray-600">{league.totalTeams}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold capitalize">
                    {league.status}
                  </span>
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

export default Leagues;
