import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Clock, 
  Filter, 
  Search,
  Car,
  User,
  ChevronRight,
  Download,
  RefreshCw
} from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatDate, formatTime, formatPrice, formatDistance } from '../utils';
import ApiService from '../services/api';

// Define Ride type locally to avoid import issues
interface Ride {
  id: string;
  driverId: string;
  driverName: string;
  driverRating: number;
  driverPhoto: string;
  from: string;
  to: string;
  departureTime: Date;
  arrivalTime: Date;
  price: number;
  availableSeats: number;
  totalSeats: number;
  status: 'completed' | 'cancelled' | 'active';
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
  };
  route: {
    distance: number;
    duration: number;
    waypoints: any[];
  };
  passengers: {
    id: string;
    name: string;
    rating: number;
    photo: string;
  }[];
  createdAt: Date;
}

type FilterType = 'all' | 'driver' | 'passenger' | 'completed' | 'cancelled';
type SortType = 'date_desc' | 'date_asc' | 'price_desc' | 'price_asc';

export function RideHistoryPage() {
  const { user, isLoading, theme } = useStore();
  const [filteredRides, setFilteredRides] = useState<Ride[]>([]);
  const [allRides, setAllRides] = useState<Ride[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('date_desc');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch ride history data
  const fetchRideHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let rides: Ride[] = [];
      
      if (user.role === 'driver') {
        // Fetch rides where user is the driver
        const response = await ApiService.getUserRides(user.uid, 'driver');
        if (response.success && response.data) {
          rides = response.data.rides || [];
        }
      } else {
        // Fetch bookings where user is a passenger
        const response = await ApiService.getPassengerBookings(user.uid);
        if (response.success && response.data) {
          const bookings = response.data.bookings || [];
          // Convert bookings to rides format
          rides = bookings.map((booking: any) => ({
            id: booking.ride_id,
            driverId: booking.ride?.driver_id || '',
            driverName: booking.ride?.driver?.name || 'Unknown Driver',
            driverRating: booking.ride?.driver?.rating || 0,
            driverPhoto: booking.ride?.driver?.profile_pic || '',
            from: booking.ride?.origin?.address || 'Unknown Location',
            to: booking.ride?.destination?.address || 'Unknown Location',
            departureTime: new Date(booking.ride?.departure_time || booking.created_at),
            arrivalTime: new Date(booking.ride?.departure_time || booking.created_at),
            price: booking.ride?.price_per_seat || 0,
            availableSeats: booking.ride?.available_seats || 0,
            totalSeats: booking.ride?.total_seats || 0,
            status: booking.status === 'confirmed' ? 'completed' : booking.status,
            vehicleInfo: booking.ride?.vehicle_info || {
              make: '',
              model: '',
              year: 0,
              color: '',
              licensePlate: ''
            },
            route: {
              distance: 0,
              duration: 0,
              waypoints: []
            },
            passengers: [],
            createdAt: new Date(booking.created_at)
          }));
        }
      }
      
      setAllRides(rides);
    } catch (error) {
      console.error('Failed to fetch ride history:', error);
      setError('Failed to load ride history');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchRideHistory();
  }, [user]);

  useEffect(() => {
    let filtered = allRides;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(ride => 
        ride.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ride.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ride.driverName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(ride => {
        switch (activeFilter) {
          case 'driver':
            return user?.role === 'driver' && ride.driverId === user.uid;
          case 'passenger':
            return user?.role === 'passenger' || ride.driverId !== user?.uid;
          case 'completed':
            return ride.status === 'completed';
          case 'cancelled':
            return ride.status === 'cancelled';
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime();
        case 'date_asc':
          return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
        case 'price_desc':
          return b.price - a.price;
        case 'price_asc':
          return a.price - b.price;
        default:
          return 0;
      }
    });

    setFilteredRides(filtered);
  }, [searchQuery, activeFilter, sortBy, allRides]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchRideHistory();
    } catch (error) {
      console.error('Failed to refresh ride history:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const exportHistory = () => {
    const data = {
      rides: filteredRides,
      exportDate: new Date().toISOString(),
      user: user?.name
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ride-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading || loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/profile" className={`flex items-center ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span>Back</span>
              </Link>
              <h1 className={`ml-6 text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Ride History</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={exportHistory}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filters */}
        <div className="mb-6">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search rides by location or driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-white rounded-lg border p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'all', label: 'All Rides' },
                    { key: 'driver', label: 'As Driver' },
                    { key: 'passenger', label: 'As Passenger' },
                    { key: 'completed', label: 'Completed' },
                    { key: 'cancelled', label: 'Cancelled' }
                  ].map(filter => (
                    <button
                      key={filter.key}
                      onClick={() => setActiveFilter(filter.key as FilterType)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        activeFilter === filter.key
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortType)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date_desc">Newest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="price_desc">Highest Price</option>
                  <option value="price_asc">Lowest Price</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className={`${theme === 'dark' ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-200'} border rounded-lg p-4 mb-6`}>
            <div className="flex items-center">
              <div className="text-red-600 mr-3">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-red-300' : 'text-red-800'}`}>
                  Error loading ride history
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-red-400' : 'text-red-600'} mt-1`}>
                  {error}
                </p>
                <button
                  onClick={handleRefresh}
                  className={`mt-2 text-sm ${theme === 'dark' ? 'text-red-300 hover:text-red-200' : 'text-red-600 hover:text-red-500'}`}
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ride History List */}
        {filteredRides.length === 0 ? (
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-8 text-center`}>
            <Car className={`h-12 w-12 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mx-auto mb-4`} />
            <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>No rides found</h3>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              {searchQuery || activeFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'You haven\'t taken any rides yet'
              }
            </p>
            {!searchQuery && activeFilter === 'all' && (
              <Link
                to="/search"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Find a Ride
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRides.map((ride) => (
              <div key={ride.id} className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border hover:shadow-md transition-shadow`}>
                <div className="p-6">
                  {/* Ride Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={ride.driverPhoto}
                        alt={ride.driverName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ride.driverName}</h3>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} ml-1`}>{ride.driverRating}</span>
                          </div>
                          <span className={`${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}>•</span>
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatDate(ride.departureTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        ride.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : ride.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                      </div>
                      <div className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mt-1`}>
                        {formatPrice(ride.price)}
                      </div>
                    </div>
                  </div>

                  {/* Route Information */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div className="w-0.5 h-8 bg-gray-300"></div>
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div>
                            <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ride.from}</div>
                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {formatTime(ride.departureTime)}
                            </div>
                          </div>
                          
                          <div>
                            <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{ride.to}</div>
                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {formatTime(ride.arrivalTime)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`text-right text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {ride.route.duration} min
                      </div>
                      <div className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {formatDistance(ride.route.distance)}
                      </div>
                    </div>
                  </div>

                  {/* Vehicle and Passenger Info */}
                  <div className={`flex items-center justify-between pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className={`flex items-center space-x-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <div className="flex items-center">
                        <Car className="h-4 w-4 mr-1" />
                        {ride.vehicleInfo.color} {ride.vehicleInfo.make} {ride.vehicleInfo.model}
                      </div>
                      
                      {user?.role === 'driver' && ride.passengers.length > 0 && (
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {ride.passengers.length} passenger{ride.passengers.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                    
                    <Link
                      to={`/rides/${ride.id}`}
                      className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {filteredRides.length > 0 && (
          <div className={`mt-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>Summary</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{filteredRides.length}</div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Rides</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredRides.filter(r => r.status === 'completed').length}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Completed</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatDistance(filteredRides.reduce((sum, r) => sum + r.route.distance, 0))}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Distance</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {formatPrice(filteredRides.reduce((sum, r) => sum + r.price, 0))}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Spent</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}