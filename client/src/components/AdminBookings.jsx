import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminBookings = ({ userId, isOpen, onClose }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchBookings();
    }
  }, [isOpen, userId]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/bookings/admin/${userId}`);
      console.log(response);

      setBookings(response.data.data);
    } catch (err) {
      setError('Failed to fetch bookings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const generateWhatsAppLink = (booking) => {
    const message = `Hello, I have a query about my booking:
- Name: ${booking.name}
- Email: ${booking.email}
- Phone: ${booking.phone || 'N/A'}
- Post: ${booking?.listingId?.name || 'N/A'}
- Booking Date: ${new Date(booking?.bookingDate).toLocaleDateString()}`;
    return `https://wa.me/${booking.phone}?text=${encodeURIComponent(message)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          User Bookings
        </h2>

        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : bookings.length === 0 ? (
          <p className="text-center text-gray-600">No bookings found.</p>
        ) : (
          <ul className="space-y-4">
            {bookings.map((booking) => (
              <li
                key={booking.id}
                className="border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition"
              >
                <Link to={`/listing/${booking?.listingId?._id}`}>
                <p className="text-sm font-medium text-gray-700 underline">
                  <strong>Post:</strong> {booking?.listingId?.name}
                </p>
                </Link>
                <p className="text-sm text-gray-600">
                  <strong>Date:</strong> {new Date(booking?.bookingDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Name:</strong> {booking?.name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {booking.email}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Phone:</strong> {booking.phone || 'N/A'}
                </p>
                <a
                  href={generateWhatsAppLink(booking)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-white bg-green-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition"
                >
                  Contact on WhatsApp
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;
