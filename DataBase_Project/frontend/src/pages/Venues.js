import React, { useState, useEffect } from 'react';
import { Eye, Edit2, Trash2, MapPin, Plus, X } from 'lucide-react';
import apiService from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const Venues = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [formData, setFormData] = useState({
    venueId: '',
    venueName: '',
    location: '',
    capacity: '',
    isAvailable: true
  });

  useEffect(() => {
    fetchVenues();
  }, []);

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

  const handleAdd = () => {
    setEditingVenue(null);
    setFormData({
      venueId: '',
      venueName: '',
      location: '',
      capacity: '',
      isAvailable: true
    });
    setShowModal(true);
  };

  const handleView = (venue) => {
    alert(`View venue: ${venue.VenueName || venue.name}`);
  };

  const handleEdit = (venue) => {
    setEditingVenue(venue);
    setFormData({
      venueId: venue.VenueID || venue.id || '',
      venueName: venue.VenueName || venue.name || '',
      location: venue.Location || venue.location || '',
      capacity: venue.Capacity || venue.capacity || '',
      isAvailable: venue.IsAvailable !== undefined ? venue.IsAvailable : true
    });
    setShowModal(true);
  };

  const handleDelete = async (venueId) => {
    if (!window.confirm('Are you sure you want to delete this venue?')) return;
    try {
      await apiService.venues.delete(venueId);
      setVenues(venues.filter(v => (v.id || v.VenueID) !== venueId));
      alert('Venue deleted successfully');
    } catch (error) {
      alert('Failed to delete venue: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVenue) {
        await apiService.venues.update(editingVenue.VenueID || editingVenue.id, formData);
        alert('Venue updated successfully');
      } else {
        await apiService.venues.create(formData);
        alert('Venue created successfully');
      }
      setShowModal(false);
      fetchVenues();
    } catch (error) {
      alert('Failed to save venue: ' + error.message);
    }
  };

  if (loading) return <div className="text-center py-8">Loading venues...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Venues</h1>
        {isAdmin && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Add Venue
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {venues.map(venue => (
          <div key={venue.VenueID || venue.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <h3 className="text-lg font-semibold text-gray-900">{venue.VenueName || venue.name}</h3>
                </div>
                <p className="text-sm text-gray-500 font-medium">Venue ID: #{venue.VenueID || venue.id}</p>

                <div className="space-y-2 text-sm text-gray-600 mt-4">
                  <p><strong>Location:</strong> {venue.Location || (venue.city && venue.country ? `${venue.city}, ${venue.country}` : 'N/A')}</p>
                  <p><strong>Capacity:</strong> {(venue.Capacity || venue.capacity) ? (venue.Capacity || venue.capacity).toLocaleString() : 'N/A'}</p>
                  <p><strong>Status:</strong> {(venue.IsAvailable !== undefined ? venue.IsAvailable : venue.opened) ? 'Available' : 'Not Available'}</p>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button onClick={() => handleView(venue)} className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded" title="View">
                  <Eye className="w-4 h-4" />
                </button>
                {isAdmin && (
                  <>
                    <button onClick={() => handleEdit(venue)} className="text-yellow-600 hover:text-yellow-800 p-2 hover:bg-yellow-50 rounded" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(venue.id || venue.VenueID)} className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Venue Modal - Only render if admin */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingVenue ? 'Edit Venue' : 'Add New Venue'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.venueName}
                  onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="e.g., Old Trafford"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="e.g., Manchester, England"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="e.g., 75000"
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Venue is available for booking
                  </span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  {editingVenue ? 'Update Venue' : 'Create Venue'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Venues;
