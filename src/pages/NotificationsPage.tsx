import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bell, 
  Car, 
  MessageSquare, 
  Star, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Trash2, 
  MoreVertical,
  Filter,
  RefreshCw,
  Settings,
  BellOff,
  CalendarDays
} from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatDate, formatTime, getRelativeTime } from '../utils';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'ride_update' | 'booking' | 'message' | 'review' | 'system' | 'promotion';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    rideId?: string;
    userId?: string;
    rating?: number;
    [key: string]: any;
  };
}

type FilterType = 'all' | 'unread' | 'ride_update' | 'booking' | 'message' | 'review' | 'system';

export function NotificationsPage() {
  const { user, isLoading } = useStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showActions, setShowActions] = useState(false);

  // Mock notifications data
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'ride_update',
      title: 'Ride Confirmed',
      message: 'Your ride to Downtown Mall has been confirmed. Driver will pick you up at 2:30 PM.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false,
      actionUrl: '/rides/123',
      metadata: { rideId: '123' }
    },
    {
      id: '2',
      type: 'message',
      title: 'New Message',
      message: 'John Smith: "I\'m running 5 minutes late, will be there soon!"',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      actionUrl: '/chat/123',
      metadata: { rideId: '123', userId: 'john123' }
    },
    {
      id: '3',
      type: 'review',
      title: 'New Review Received',
      message: 'Sarah Johnson left you a 5-star review: "Great driver, very punctual!"',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      read: true,
      actionUrl: '/profile',
      metadata: { userId: 'sarah456', rating: 5 }
    },
    {
      id: '4',
      type: 'booking',
      title: 'Booking Request',
      message: 'Emma Davis wants to book your ride to Airport. 1 seat requested.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      read: true,
      actionUrl: '/rides/456',
      metadata: { rideId: '456', userId: 'emma789' }
    },
    {
      id: '5',
      type: 'ride_update',
      title: 'Ride Completed',
      message: 'Your ride to Shopping Center has been completed. Don\'t forget to rate your driver!',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      actionUrl: '/rides/789',
      metadata: { rideId: '789' }
    },
    {
      id: '6',
      type: 'system',
      title: 'Profile Update Required',
      message: 'Please update your vehicle information to continue offering rides.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      read: true,
      actionUrl: '/profile',
      metadata: {}
    },
    {
      id: '7',
      type: 'promotion',
      title: 'Special Offer',
      message: 'Get 20% off your next 3 rides! Use code SAVE20 at checkout.',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      read: true,
      metadata: { promoCode: 'SAVE20' }
    }
  ];

  useEffect(() => {
    setNotifications(mockNotifications);
  }, []);

  useEffect(() => {
    let filtered = notifications;

    if (activeFilter !== 'all') {
      if (activeFilter === 'unread') {
        filtered = filtered.filter(n => !n.read);
      } else {
        filtered = filtered.filter(n => n.type === activeFilter);
      }
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredNotifications(filtered);
  }, [notifications, activeFilter]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'ride_update':
        return <Car className="h-5 w-5" />;
      case 'booking':
        return <CalendarDays className="h-5 w-5" />;
      case 'message':
        return <MessageSquare className="h-5 w-5" />;
      case 'review':
        return <Star className="h-5 w-5" />;
      case 'system':
        return <AlertCircle className="h-5 w-5" />;
      case 'promotion':
        return <Bell className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'ride_update':
        return 'text-blue-600 bg-blue-100';
      case 'booking':
        return 'text-green-600 bg-green-100';
      case 'message':
        return 'text-purple-600 bg-purple-100';
      case 'review':
        return 'text-yellow-600 bg-yellow-100';
      case 'system':
        return 'text-red-600 bg-red-100';
      case 'promotion':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = async () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    toast.success('All notifications marked as read');
  };

  const deleteNotification = async (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast.success('Notification deleted');
  };

  const deleteSelected = async () => {
    setNotifications(prev => 
      prev.filter(n => !selectedNotifications.includes(n.id))
    );
    setSelectedNotifications([]);
    setShowActions(false);
    toast.success(`${selectedNotifications.length} notifications deleted`);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh notifications from API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
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
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span>Back</span>
              </Link>
              <h1 className="ml-6 text-xl font-semibold text-gray-900 flex items-center">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {selectedNotifications.length > 0 && (
                <button
                  onClick={deleteSelected}
                  className="flex items-center px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete ({selectedNotifications.length})
                </button>
              )}
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-3 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                >
                  Mark all read
                </button>
              )}
              
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
              
              <Link
                to="/settings"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg border p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All', count: notifications.length },
                { key: 'unread', label: 'Unread', count: unreadCount },
                { key: 'ride_update', label: 'Ride Updates', count: notifications.filter(n => n.type === 'ride_update').length },
                { key: 'booking', label: 'Bookings', count: notifications.filter(n => n.type === 'booking').length },
                { key: 'message', label: 'Messages', count: notifications.filter(n => n.type === 'message').length },
                { key: 'review', label: 'Reviews', count: notifications.filter(n => n.type === 'review').length },
                { key: 'system', label: 'System', count: notifications.filter(n => n.type === 'system').length }
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key as FilterType)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors flex items-center space-x-1 ${
                    activeFilter === filter.key
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{filter.label}</span>
                  {filter.count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeFilter === filter.key
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {filter.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <BellOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">
              {activeFilter === 'unread' 
                ? 'You\'re all caught up! No unread notifications.'
                : activeFilter !== 'all'
                ? `No ${activeFilter.replace('_', ' ')} notifications found.`
                : 'You don\'t have any notifications yet.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg border transition-all hover:shadow-md ${
                  !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : 'hover:border-gray-300'
                } ${
                  selectedNotifications.includes(notification.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => toggleSelectNotification(notification.id)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    
                    {/* Notification Icon */}
                    <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className={`mt-1 text-sm ${
                            !notification.read ? 'text-gray-700' : 'text-gray-600'
                          }`}>
                            {notification.message}
                          </p>
                          
                          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {getRelativeTime(notification.timestamp)}
                            </span>
                            
                            {notification.metadata?.rating && (
                              <span className="flex items-center">
                                <Star className="h-3 w-3 mr-1 text-yellow-400 fill-current" />
                                {notification.metadata.rating} stars
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                              title="Mark as read"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                            title="Delete notification"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      {notification.actionUrl && (
                        <div className="mt-3">
                          <Link
                            to={notification.actionUrl}
                            onClick={() => markAsRead(notification.id)}
                            className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
                          >
                            View Details
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}