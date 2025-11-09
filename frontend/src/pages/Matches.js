import React, { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import apiService from '../services/apiService';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await apiService.matches.getAll();
        setMatches(data);
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (loading) return <div className="text-center py-8">Loading matches...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Matches</h1>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Schedule Match
        </button>
      </div>

      <div className="space-y-4">
        {matches.map(match => (
          <div key={match.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">
                  {match.date} at {match.time} • {match.status.toUpperCase()}
                </p>
                
                <div className="flex items-center gap-6">
                  <div className="text-center flex-1">
                    <p className="font-semibold text-gray-900 text-lg">{match.homeTeamName}</p>
                    {match.status === 'completed' && (
                      <p className="text-2xl font-bold text-blue-600 mt-2">{match.homeScore}</p>
                    )}
                  </div>

                  <div className="text-center">
                    <p className="text-gray-600">vs</p>
                    {match.status === 'completed' && (
                      <p className="text-sm text-gray-600 mt-2">Final</p>
                    )}
                    {match.status === 'scheduled' && (
                      <p className="text-sm text-gray-600 mt-2">-</p>
                    )}
                  </div>

                  <div className="text-center flex-1">
                    <p className="font-semibold text-gray-900 text-lg">{match.awayTeamName}</p>
                    {match.status === 'completed' && (
                      <p className="text-2xl font-bold text-red-600 mt-2">{match.awayScore}</p>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-3">Venue: {match.venue} • Ref: {match.referee}</p>
              </div>

              <div className="flex gap-2 ml-6">
                <button className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="text-yellow-600 hover:text-yellow-800 p-2 hover:bg-yellow-50 rounded">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Matches;
