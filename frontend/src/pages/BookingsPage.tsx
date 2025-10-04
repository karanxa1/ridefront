import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  User,
  Clock,
  MapPin,
  Phone,
  Star,
  MessageSquare,
  Calendar,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../hooks/useStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatDate, formatTime } from '../utils';

interface Booking {
  booking_id: string;
  ride_id: string;
  passenger_id: string;
  driver_id: string;
  seats_booked: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  passenger_name?: string;
  passenger_phone?: string;
  passenger_rating?: number;
  passenger_message?: string;
  driver_message?: string;
  created_at: string;
  role?: 'passenger' | 'driver';
  ride?: any;
}

export function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected' | 'cancelled'>(
    'all'
  );
  const [viewMode, setViewMode] = useState<'as_passenger' | 'as_driver' | 'both'>('both');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { user } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, filter, viewMode]);

  const fetchBookings = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);

      const asPassenger = viewMode === 'both' || viewMode === 'as_passenger';
      const asDriver = viewMode === 'both' || viewMode === 'as_driver';

      params.append('as_passenger', String(asPassenger));
      params.append('as_driver', String(asDriver));

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/bookings/user/${user.uid}?${params.toString()}`
      );

      const data = await response.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (
    bookingId: string,
    action: 'accept' | 'reject' | 'cancel',
    message?: string
  ) => {
    if (!user) return;

    setActionLoading(bookingId);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/bookings/${bookingId}/action?actor_id=${user.uid}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, message: message || '' }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(
          action === 'accept'
            ? 'Booking accepted!'
            : action === 'reject'
              ? 'Booking rejected'
              : 'Booking cancelled'
        );
        fetchBookings();
      } else {
        toast.error(data.message || `Failed to ${action} booking`);
      }
    } catch (error) {
      console.error('Error handling booking action:', error);
      toast.error(`Failed to ${action} booking`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles]
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your ride bookings and requests</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* View Mode */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">View As</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="both">Both Driver & Passenger</option>
                <option value="as_passenger">As Passenger</option>
                <option value="as_driver">As Driver</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Bookings</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-6">Start by booking a ride or offering one</p>
            <button
              onClick={() => navigate('/map')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Available Rides
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.booking_id} className="bg-white rounded-lg shadow-sm p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.role === 'driver' ? 'Booking Request' : 'Your Booking'}
                      </h3>
                      {getStatusBadge(booking.status)}
                    </div>
                    <p className="text-sm text-gray-600">
                      <Clock className="inline h-4 w-4 mr-1" />
                      {formatDate(new Date(booking.created_at))} at{' '}
                      {formatTime(new Date(booking.created_at))}
                    </p>
                  </div>
                  <div
                    className={`p-2 rounded-full ${
                      booking.role === 'driver' ? 'bg-blue-100' : 'bg-green-100'
                    }`}
                  >
                    {booking.role === 'driver' ? (
                      <Car className="h-5 w-5 text-blue-600" />
                    ) : (
                      <User className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </div>

                {/* Ride Details */}
                {booking.ride && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-600">From</p>
                          <p className="font-medium text-gray-900 truncate">
                            {booking.ride.origin?.address || 'Not specified'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-600">To</p>
                          <p className="font-medium text-gray-900 truncate">
                            {booking.ride.destination?.address || 'Not specified'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                          <Calendar className="inline h-4 w-4 mr-1" />
                          {formatDate(new Date(booking.ride.departure_time || Date.now()))}
                        </div>
                        <div className="text-sm text-gray-600">
                          <Clock className="inline h-4 w-4 mr-1" />
                          {formatTime(new Date(booking.ride.departure_time || Date.now()))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Passenger/Driver Info */}
                {booking.role === 'driver' && (
                  <div className="border-t pt-4 mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Passenger Information
                    </h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.passenger_name || 'Unknown'}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                            {booking.passenger_phone && (
                              <>
                                <Phone className="h-4 w-4" />
                                <span>{booking.passenger_phone}</span>
                              </>
                            )}
                            {booking.passenger_rating && (
                              <>
                                <span>•</span>
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span>{booking.passenger_rating.toFixed(1)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Seats</p>
                        <p className="font-semibold text-gray-900">{booking.seats_booked}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages */}
                {(booking.passenger_message || booking.driver_message) && (
                  <div className="border-t pt-4 mb-4">
                    {booking.passenger_message && (
                      <div className="mb-2">
                        <p className="text-sm text-gray-600 mb-1">
                          <MessageSquare className="inline h-4 w-4 mr-1" />
                          Passenger's message:
                        </p>
                        <p className="text-sm bg-gray-50 p-2 rounded">
                          {booking.passenger_message}
                        </p>
                      </div>
                    )}
                    {booking.driver_message && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          <MessageSquare className="inline h-4 w-4 mr-1" />
                          Driver's response:
                        </p>
                        <p className="text-sm bg-gray-50 p-2 rounded">{booking.driver_message}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                  {booking.status === 'pending' && booking.role === 'driver' && (
                    <>
                      <button
                        onClick={() => handleAction(booking.booking_id, 'accept')}
                        disabled={actionLoading === booking.booking_id}
                        className="flex-1 min-w-[120px] px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {actionLoading === booking.booking_id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleAction(booking.booking_id, 'reject')}
                        disabled={actionLoading === booking.booking_id}
                        className="flex-1 min-w-[120px] px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {actionLoading === booking.booking_id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </>
                        )}
                      </button>
                    </>
                  )}
                  {(booking.status === 'pending' || booking.status === 'accepted') && (
                    <button
                      onClick={() => handleAction(booking.booking_id, 'cancel')}
                      disabled={actionLoading === booking.booking_id}
                      className="flex-1 min-w-[120px] px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {actionLoading === booking.booking_id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Cancel Booking
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/ride/${booking.ride_id}`)}
                    className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    View Ride
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
