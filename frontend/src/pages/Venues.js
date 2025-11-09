import React, { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2, MapPin } from 'lucide-react';
import apiService from '../services/apiService';

const Venues = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const data = await apiService.venues.getAll();
        setVenues(data);
      } catch (error) {
        console.error('Error fetching venues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  if (loading) return <div className="text-center py-8">Loading venues...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Venues</h1>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Add Venue
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {venues.map(venue => (
          <div key={venue.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <h3 className="text-lg font-semibold text-gray-900">{venue.name}</h3>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mt-4">
                  <p><strong>City:</strong> {venue.city}, {venue.country}</p>
                  <p><strong>Capacity:</strong> {venue.capacity.toLocaleString()}</p>
                  <p><strong>Opened:</strong> {venue.opened}</p>
                  <p><strong>Surface:</strong> {venue.surface}</p>
                  <p className="mt-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                      {venue.lights ? '💡 Floodlights' : 'No Lights'}
                    </span>
                  </p>
                </div>

                <p className="text-sm text-gray-600 mt-4">
                  Available Events: <span className="font-semibold text-blue-600">{venue.availableEvents}</span>
                </p>
              </div>

              <div className="flex gap-2 ml-4">
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

export default Venues;
