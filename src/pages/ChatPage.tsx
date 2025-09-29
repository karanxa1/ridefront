import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  Paperclip, 
  MoreVertical,
  User,
  MapPin,
  Clock,
  Phone,
  Info
} from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatTime, getRelativeTime } from '../utils';
import { toast } from 'sonner';
import type { Ride, ChatMessage } from '../types';

export function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const { user, getRideById, getChatMessages, sendMessage, isLoading } = useStore();
  const [ride, setRide] = useState<Ride | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id) {
      loadRideAndMessages(id);
    }
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadRideAndMessages = async (rideId: string) => {
    try {
      const [rideData, chatMessages] = await Promise.all([
        getRideById(rideId),
        getChatMessages(rideId)
      ]);
      setRide(rideData);
      setMessages(chatMessages);
    } catch (error) {
      toast.error('Failed to load chat');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !id || !user || sending) return;
    
    setSending(true);
    
    try {
      const message = await sendMessage(id, newMessage.trim());
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      inputRef.current?.focus();
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const isDriver = ride && user && user.uid === ride.driver_id;
  const isPassenger = ride && user && ride.passengers?.some(p => p.user_id === user.uid);
  const otherParticipants = ride ? (
    isDriver 
      ? ride.passengers || []
      : [{ user_id: ride.driver_id, name: ride.driver.name, profile_pic: ride.driver.profile_pic }]
  ) : [];

  if (isLoading || !ride) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isDriver && !isPassenger) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 text-gray-400 mx-auto mb-4">
            <Info className="h-full w-full" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this chat.</p>
          <Link to="/" className="mt-4 inline-block text-blue-600 hover:text-blue-500">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to={`/ride/${ride.id}`} className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span>Back</span>
              </Link>
              
              <div className="ml-6 flex items-center space-x-3">
                {otherParticipants.length === 1 ? (
                  <>
                    {otherParticipants[0].profile_pic ? (
                      <img
                        src={otherParticipants[0].profile_pic}
                        alt={otherParticipants[0].name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <h1 className="text-lg font-semibold text-gray-900">{otherParticipants[0].name}</h1>
                      <p className="text-sm text-gray-500">
                        {isDriver ? 'Passenger' : 'Driver'}
                      </p>
                    </div>
                  </>
                ) : (
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">Group Chat</h1>
                    <p className="text-sm text-gray-500">
                      {otherParticipants.length + 1} participants
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link
                to={`/ride/${ride.id}/track`}
                className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
                title="Track ride"
              >
                <MapPin className="h-5 w-5" />
              </Link>
              
              {!isDriver && (
                <button 
                  className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
                  title="Call driver"
                >
                  <Phone className="h-5 w-5" />
                </button>
              )}
              
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Trip Info Banner */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-blue-700">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">{ride.pickup_location.address}</span>
              <span>→</span>
              <span className="font-medium">{ride.destination.address}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-blue-700">
            <Clock className="h-4 w-4" />
            <span>{formatTime(ride.departure_time)}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-600">Start the conversation with your {isDriver ? 'passengers' : 'driver'}!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.sender_id === user?.id;
              const sender = message.sender_id === ride.driver_id 
                ? ride.driver 
                : ride.passengers?.find(p => p.user_id === message.sender_id);
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                    isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    {!isOwnMessage && (
                      <div className="flex-shrink-0">
                        {sender?.profile_pic ? (
                          <img
                            src={sender.profile_pic}
                            alt={sender.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className={`rounded-lg px-4 py-2 ${
                      isOwnMessage 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}>
                      {!isOwnMessage && (
                        <p className="text-xs text-gray-500 mb-1">{sender?.name}</p>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {getRelativeTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            
            <div className="flex-1">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={sending}
              />
            </div>
            
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {sending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}