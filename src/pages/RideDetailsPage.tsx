import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Car,
  Phone,
  MessageCircle,
  ArrowLeft,
  User,
  Calendar,
  IndianRupee,
  AlertCircle,
  CheckCircle,
  Navigation
} from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatTime, formatDate, formatPrice } from '../utils';
import { toast } from 'sonner';
import type { Ride } from '../types';

export function RideDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, getRideById, bookRide, isLoading } = useStore();
  const [ride, setRide] = useState<Ride | null>(null);
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadRide(id);
    }
  }, [id]);

  const loadRide = async (rideId: string) => {
    try {
      const rideData = await getRideById(rideId);
      setRide(rideData);
    } catch (error) {
      toast.error('Failed to load ride details');
      navigate('/search');
    }
  };

  const handleBookRide = async () => {
    if (!ride || !user) return;
    
    setBookingLoading(true);
    try {
      await bookRide(ride.id, seatsToBook);
      toast.success('Ride booked successfully!');
      navigate('/history');
    } catch (error) {
      toast.error('Failed to book ride. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const canBook = ride && user && user.uid !== ride.driver_id && ride.status === 'active' && ride.available_seats >= seatsToBook;
  const isDriver = ride && user && user.uid === ride.driver_id;
  const totalPrice = ride ? ride.price_per_seat * seatsToBook : 0;

  if (isLoading || !ride) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span>Back</span>
            </button>
            <h1 className="ml-6 text-xl font-semibold text-gray-900">Ride Details</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Route</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 rounded-full p-2 mt-1">
                    <MapPin className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Pickup Location</p>
                    <p className="text-gray-600">{ride.pickup_location.address}</p>
                  </div>
                </div>
                
                <div className="ml-6 border-l-2 border-gray-200 h-8"></div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-red-100 rounded-full p-2 mt-1">
                    <MapPin className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Destination</p>
                    <p className="text-gray-600">{ride.destination.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium text-gray-900">{formatDate(ride.departure_time)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Departure Time</p>
                    <p className="font-medium text-gray-900">{formatTime(ride.departure_time)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Available Seats</p>
                    <p className="font-medium text-gray-900">
                      {ride.available_seats} of {ride.total_seats}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <IndianRupee className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Price per Seat</p>
                    <p className="font-medium text-gray-900">{formatPrice(ride.price_per_seat)}</p>
                  </div>
                </div>
              </div>
              
              <div className={`mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                ride.status === 'active' ? 'bg-green-100 text-green-800' :
                ride.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                ride.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {ride.status === 'active' && <CheckCircle className="h-4 w-4 mr-1" />}
                {ride.status === 'cancelled' && <AlertCircle className="h-4 w-4 mr-1" />}
                {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
              </div>
            </div>

            {/* Driver Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Driver</h2>
              
              <div className="flex items-center space-x-4">
                {ride.driver.profile_pic ? (
                  <img
                    src={ride.driver.profile_pic}
                    alt={ride.driver.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-600" />
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{ride.driver.name}</h3>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm text-gray-600">
                      {ride.driver_rating ? `${ride.driver_rating.toFixed(1)} rating` : 'New driver'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Member since {new Date(ride.driver.created_at).getFullYear()}
                  </p>
                </div>
                
                {!isDriver && (
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg">
                      <Phone className="h-5 w-5" />
                    </button>
                    <Link
                      to={`/chat/${ride.id}`}
                      className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg"
                    >
                      <MessageCircle className="h-5 w-5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle</h2>
              
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 rounded-lg p-3">
                  <Car className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {ride.vehicle_info.year} {ride.vehicle_info.make} {ride.vehicle_info.model}
                  </p>
                  <p className="text-sm text-gray-600">
                    {ride.vehicle_info.color} • {ride.vehicle_info.license_plate}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            {ride.description && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h2>
                <p className="text-gray-700">{ride.description}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            {canBook && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Book This Ride</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Seats
                    </label>
                    <select
                      value={seatsToBook}
                      onChange={(e) => setSeatsToBook(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Array.from({ length: Math.min(ride.available_seats, 4) }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>
                          {num} seat{num > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Price per seat:</span>
                      <span className="font-medium">{formatPrice(ride.price_per_seat)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-600">Seats:</span>
                      <span className="font-medium">{seatsToBook}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total:</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleBookRide}
                    disabled={bookingLoading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {bookingLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      'Book Ride'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Driver Actions */}
            {isDriver && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Ride</h3>
                
                <div className="space-y-3">
                  <Link
                    to={`/ride/${ride.id}/track`}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Start Trip
                  </Link>
                  
                  <Link
                    to={`/chat/${ride.id}`}
                    className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 flex items-center justify-center"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Group Chat
                  </Link>
                  
                  <button className="w-full bg-red-100 text-red-700 py-2 px-4 rounded-lg font-medium hover:bg-red-200">
                    Cancel Ride
                  </button>
                </div>
              </div>
            )}

            {/* Ride Status */}
            {!canBook && !isDriver && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ride Status</h3>
                
                {ride.status !== 'active' ? (
                  <div className="text-center py-4">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">
                      This ride is {ride.status} and cannot be booked.
                    </p>
                  </div>
                ) : ride.available_seats === 0 ? (
                  <div className="text-center py-4">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">This ride is fully booked.</p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600">You cannot book your own ride.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}