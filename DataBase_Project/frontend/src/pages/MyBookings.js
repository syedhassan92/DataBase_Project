import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import apiService from '../services/apiService';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // In real app, would pass userId
        const data = await apiService.bookings.getUserBookings(1);
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) return <div className="text-center py-8">Loading bookings...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">You haven't booked any tickets yet.</p>
          <a
            href="/user/ticket-booking"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Book Tickets Now
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Booking ID</p>
                  <p className="font-semibold text-gray-900">#{booking.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Match</p>
                  <p className="font-semibold text-gray-900">Match #{booking.matchId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Booking Date</p>
                  <p className="font-semibold text-gray-900">{booking.bookingDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-semibold text-blue-600 text-lg">€{booking.totalAmount}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    booking.bookingStatus === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    booking.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button className="flex items-center gap-2 text-blue-600 hover:text-blue-800 px-4 py-2 hover:bg-blue-50 rounded">
                    <Download className="w-4 h-4" />
                    Download Tickets
                  </button>
                  <button className="flex items-center gap-2 text-red-600 hover:text-red-800 px-4 py-2 hover:bg-red-50 rounded">
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
