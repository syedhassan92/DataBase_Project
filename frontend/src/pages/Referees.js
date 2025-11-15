import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, CheckCircle, XCircle } from 'lucide-react';
import apiService from '../services/apiService';

const Referees = () => {
  const [referees, setReferees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingReferee, setEditingReferee] = useState(null);
  const [formData, setFormData] = useState({
    refereeName: '',
    contact: '',
    availabilityStatus: 'Available'
  });

  useEffect(() => {
    fetchReferees();
  }, []);

  const fetchReferees = async () => {
    try {
      const data = await apiService.referees.getAll();
      setReferees(data);
    } catch (error) {
      console.error('Error fetching referees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingReferee(null);
    setFormData({
      refereeName: '',
      contact: '',
      availabilityStatus: 'Available'
    });
    setShowModal(true);
  };

  const handleEdit = (referee) => {
    setEditingReferee(referee);
    setFormData({
      refereeName: referee.RefereeName || referee.refereeName || '',
      contact: referee.Contact || referee.contact || '',
      availabilityStatus: referee.AvailabilityStatus || referee.availabilityStatus || 'Available'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this referee?')) {
      try {
        await apiService.referees.delete(id);
        setReferees(referees.filter(r => (r.RefereeID || r.id) !== id));
        alert('Referee deleted successfully');
      } catch (error) {
        console.error('Error deleting referee:', error);
        alert('Failed to delete referee');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingReferee) {
        const updated = await apiService.referees.update(editingReferee.RefereeID || editingReferee.id, formData);
        setReferees(referees.map(r => 
          (r.RefereeID || r.id) === (editingReferee.RefereeID || editingReferee.id) ? updated : r
        ));
        alert('Referee updated successfully');
      } else {
        const created = await apiService.referees.create(formData);
        setReferees([created, ...referees]);
        alert('Referee created successfully');
      }
      setShowModal(false);
    } catch (error) {
      console.error('Error saving referee:', error);
      alert('Failed to save referee');
    }
  };

  const filteredReferees = referees.filter(referee => {
    const matchesSearch = (referee.RefereeName || referee.refereeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (referee.Contact || referee.contact || '').toLowerCase().includes(searchTerm.toLowerCase());
    const status = referee.AvailabilityStatus || referee.availabilityStatus;
    const matchesFilter = filterStatus === 'all' || status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading referees...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Referee Management</h1>
          <p className="text-gray-600 mt-2">Manage match officials and their availability</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-600 transition shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Referee
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search referees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </div>
      </div>

      {/* Referees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReferees.map((referee) => {
          const id = referee.RefereeID || referee.id;
          const name = referee.RefereeName || referee.refereeName;
          const contact = referee.Contact || referee.contact;
          const status = referee.AvailabilityStatus || referee.availabilityStatus;
          
          return (
            <div key={id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
                  <p className="text-gray-600 text-sm">{contact}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(referee)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {status === 'Available' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`font-semibold ${
                  status === 'Available' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {status}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredReferees.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No referees found</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-6">
              {editingReferee ? 'Edit Referee' : 'Add New Referee'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referee Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.refereeName}
                    onChange={(e) => setFormData({...formData, refereeName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Enter referee name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact
                  </label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Email or phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability Status *
                  </label>
                  <select
                    required
                    value={formData.availabilityStatus}
                    onChange={(e) => setFormData({...formData, availabilityStatus: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>
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
                  {editingReferee ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Referees;
