import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  MapPin, 
  Car, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  Smartphone,
  Mail,
  MessageSquare,
  Eye,
  Lock,
  Trash2,
  Download
} from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { toast } from 'sonner';

interface NotificationSettings {
  push_notifications: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  ride_updates: boolean;
  chat_messages: boolean;
  promotional: boolean;
}

interface PrivacySettings {
  profile_visibility: 'public' | 'private' | 'friends';
  location_sharing: boolean;
  ride_history_visible: boolean;
  contact_info_visible: boolean;
}

export function SettingsPage() {
  const { user, signOut, theme, setTheme, isLoading } = useStore();
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    push_notifications: true,
    email_notifications: true,
    sms_notifications: false,
    ride_updates: true,
    chat_messages: true,
    promotional: false
  });
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profile_visibility: 'public',
    location_sharing: true,
    ride_history_visible: true,
    contact_info_visible: false
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    // Load user settings from store or API
    if (user?.settings) {
      if (typeof user.settings.notifications === 'object') {
        setNotifications(user.settings.notifications);
      }
      setPrivacy(privacy); // Use default privacy settings
    }
  }, [user]);

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    saveSettings({ notifications: { ...notifications, [key]: value } });
  };

  const handlePrivacyChange = (key: keyof PrivacySettings, value: any) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
    saveSettings({ privacy: { ...privacy, [key]: value } });
  };

  const saveSettings = async (_settings: any) => {
    setSaving(true);
    try {
      // Save settings to backend
      await new Promise(resolve => setTimeout(resolve, 500)); // Mock API call
      toast.success('Settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // Delete account logic
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
      toast.success('Account deleted successfully');
      await signOut();
    } catch (error) {
      toast.error('Failed to delete account');
    }
    setShowDeleteConfirm(false);
  };

  const exportData = async () => {
    try {
      // Export user data
      const data = {
        profile: user,
        settings: { notifications, privacy },
        exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rideshare-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  if (isLoading || !user) {
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
              <h1 className={`ml-6 text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Settings</h1>
            </div>
            
            {saving && (
              <div className={`flex items-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving...
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Appearance */}
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
            <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center`}>
                <Sun className="h-5 w-5 mr-2" />
                Appearance
              </h2>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Theme</h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Choose your preferred theme</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-2 rounded-lg border ${
                      theme === 'light' 
                        ? 'border-blue-500 bg-blue-50 text-blue-600' 
                        : theme === 'dark' 
                        ? 'border-gray-600 text-gray-400 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Sun className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-2 rounded-lg border ${
                      theme === 'dark' 
                        ? 'border-blue-500 bg-blue-50 text-blue-600' 
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Moon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    className={`p-2 rounded-lg border ${
                      theme === 'system' 
                        ? 'border-blue-500 bg-blue-50 text-blue-600' 
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">Push Notifications</h3>
                    <p className="text-sm text-gray-600">Receive notifications on your device</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('push_notifications', !notifications.push_notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.push_notifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.push_notifications ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-600">Receive updates via email</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('email_notifications', !notifications.email_notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.email_notifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.email_notifications ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">Chat Messages</h3>
                    <p className="text-sm text-gray-600">Notifications for new messages</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('chat_messages', !notifications.chat_messages)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.chat_messages ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.chat_messages ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Car className="h-5 w-5 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">Ride Updates</h3>
                    <p className="text-sm text-gray-600">Status changes and arrival notifications</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('ride_updates', !notifications.ride_updates)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.ride_updates ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.ride_updates ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Privacy & Security
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Eye className="h-5 w-5 text-gray-400" />
                    <div>
                      <h3 className="font-medium text-gray-900">Profile Visibility</h3>
                      <p className="text-sm text-gray-600">Who can see your profile information</p>
                    </div>
                  </div>
                </div>
                
                <select
                  value={privacy.profile_visibility}
                  onChange={(e) => handlePrivacyChange('profile_visibility', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="public">Public - Anyone can see</option>
                  <option value="friends">Friends only</option>
                  <option value="private">Private - Only you</option>
                </select>
              </div>
              
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">Location Sharing</h3>
                    <p className="text-sm text-gray-600">Share your location during rides</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePrivacyChange('location_sharing', !privacy.location_sharing)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    privacy.location_sharing ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacy.location_sharing ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Account Management */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Account Management
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              <button
                onClick={exportData}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Download className="h-5 w-5 text-gray-400" />
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">Export Data</h3>
                    <p className="text-sm text-gray-600">Download your account data</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
              
              <button
                onClick={handleSignOut}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <LogOut className="h-5 w-5 text-gray-400" />
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">Sign Out</h3>
                    <p className="text-sm text-gray-600">Sign out of your account</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full p-6 flex items-center justify-between hover:bg-red-50 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <Trash2 className="h-5 w-5 text-red-400 group-hover:text-red-600" />
                  <div className="text-left">
                    <h3 className="font-medium text-red-600 group-hover:text-red-700">Delete Account</h3>
                    <p className="text-sm text-red-500 group-hover:text-red-600">Permanently delete your account</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-red-400 group-hover:text-red-600" />
              </button>
            </div>
          </div>

          {/* Support */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <HelpCircle className="h-5 w-5 mr-2" />
                Support
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              <Link
                to="/help"
                className="block p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Help Center</h3>
                    <p className="text-sm text-gray-600">Get help and support</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Link>
              
              <Link
                to="/contact"
                className="block p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Contact Us</h3>
                    <p className="text-sm text-gray-600">Send us a message</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 rounded-full p-2">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}