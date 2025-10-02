import { useNavigate } from 'react-router-dom';
import {
  Car,
  Shield,
  Menu,
  X,
  Users,
  MapPin,
  Clock,
  Award,
  Zap,
  TrendingUp,
  CheckCircle,
  BookOpen,
  ChevronRight,
  Star,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [animatedCount, setAnimatedCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedCount((prev) => (prev < 1000 ? prev + 50 : 1000));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="relative">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Car className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  RideFront
                </span>
                <p className="text-xs text-gray-500 -mt-1">Campus Carpool</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a
                href="#features"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                How it Works
              </a>
              <a
                href="#sih"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                SIH 2025
              </a>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 animate-fadeIn">
              <div className="flex flex-col space-y-4">
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-blue-600 transition-colors px-2 py-2 rounded-lg hover:bg-gray-50"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-blue-600 transition-colors px-2 py-2 rounded-lg hover:bg-gray-50"
                >
                  How it Works
                </a>
                <a
                  href="#sih"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-blue-600 transition-colors px-2 py-2 rounded-lg hover:bg-gray-50"
                >
                  SIH 2025
                </a>
                <button
                  onClick={() => navigate('/login')}
                  className="text-left px-2 py-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors rounded-lg hover:bg-blue-50"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold transition-all text-center shadow-lg"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fadeIn">
              <Award className="h-4 w-4" />
              <span>Smart India Hackathon 2025 Project</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6 animate-slideUp">
              Share Your Ride,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 animate-gradient">
                Save Your Money
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-slideUp animation-delay-200">
              The smartest way for college students to commute together. Share rides, split costs,
              and build campus connections.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slideUp animation-delay-400">
              <button
                onClick={() => navigate('/signup')}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center space-x-2"
              >
                <span>Get Started Free</span>
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() =>
                  document.getElementById('sih')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-gray-200"
              >
                SIH Team Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto animate-slideUp animation-delay-600">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">{animatedCount}+</div>
                <div className="text-gray-600">Students Connected</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="text-3xl font-bold text-green-600 mb-2">₹500+</div>
                <div className="text-gray-600">Avg. Monthly Savings</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="text-3xl font-bold text-purple-600 mb-2">30%</div>
                <div className="text-gray-600">CO₂ Reduction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SIH 2025 Special Section */}
      <section
        id="sih"
        className="py-20 bg-gradient-to-br from-indigo-600 to-purple-600 text-white relative overflow-hidden"
      >
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 border-4 border-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 border-4 border-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Award className="h-4 w-4" />
              <span>Smart India Hackathon 2025</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Welcome, SIH Evaluation Team! 🎉
            </h2>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
              Thank you for evaluating our project. We've prepared a seamless demo experience for
              you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Demo Credentials Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold">Demo Credentials</h3>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <p className="text-sm text-indigo-200 mb-1">Email</p>
                  <p className="font-mono text-lg">karanravirajput2@gmail.com</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <p className="text-sm text-indigo-200 mb-1">Password</p>
                  <p className="font-mono text-lg">Ka12345678</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/login', { state: { sihDemo: true } })}
                className="w-full px-6 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center space-x-2 group"
              >
                <span>Auto-Login for SIH Team</span>
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-sm text-indigo-200 mt-4 text-center">
                Click to login automatically - no typing needed!
              </p>
            </div>

            {/* Quick Guide Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold">Quick Guide</h3>
              </div>

              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <div className="mt-1 h-6 w-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-semibold">Auto-Login</p>
                    <p className="text-sm text-indigo-200">Use the button for instant access</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="mt-1 h-6 w-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-semibold">Explore Features</p>
                    <p className="text-sm text-indigo-200">Create rides, search, book & chat</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="mt-1 h-6 w-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-semibold">Test Real-time</p>
                    <p className="text-sm text-indigo-200">Live tracking, notifications & more</p>
                  </div>
                </li>
              </ul>

              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-sm text-indigo-200 text-center">
                  <strong>Note:</strong> You can also manually register on the signup page
                </p>
              </div>
            </div>
          </div>

          {/* Project Highlights */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Real-time Features</h4>
              <p className="text-sm text-indigo-200">Live tracking, instant notifications</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <Shield className="h-8 w-8 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Secure Platform</h4>
              <p className="text-sm text-indigo-200">Firebase auth & encrypted data</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
              <Users className="h-8 w-8 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Social Features</h4>
              <p className="text-sm text-indigo-200">In-app chat, reviews & ratings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Why Choose RideFront?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for students, by students. Every feature designed for your campus commute.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-blue-100">
              <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <MapPin className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Route Matching</h3>
              <p className="text-gray-600 leading-relaxed">
                AI-powered algorithm matches you with students going your way. Save time and money
                together.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-green-100">
              <div className="h-14 w-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Verified Students Only</h3>
              <p className="text-gray-600 leading-relaxed">
                College email verification ensures you ride with verified students from your campus.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-purple-100">
              <div className="h-14 w-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-time Tracking</h3>
              <p className="text-gray-600 leading-relaxed">
                Know exactly where your ride is. Live GPS tracking keeps everyone informed and safe.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-yellow-100">
              <div className="h-14 w-14 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">In-App Chat</h3>
              <p className="text-gray-600 leading-relaxed">
                Coordinate pickup points and timing through secure, built-in messaging.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-red-100">
              <div className="h-14 w-14 bg-gradient-to-br from-red-600 to-rose-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Star className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Rating System</h3>
              <p className="text-gray-600 leading-relaxed">
                Build trust through transparent ratings and reviews from your campus community.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-cyan-100">
              <div className="h-14 w-14 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Bookings</h3>
              <p className="text-gray-600 leading-relaxed">
                Book a ride in seconds. Simple, fast, and designed for busy student life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start carpooling in three simple steps
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transform -translate-y-1/2 rounded-full"></div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
              {/* Step 1 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-2">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      1
                    </div>
                  </div>
                  <div className="mt-8 text-center">
                    <div className="h-20 w-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Users className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Sign Up</h3>
                    <p className="text-gray-600">
                      Create your account with college email. Quick verification, get started in
                      minutes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-indigo-100 hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-2">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="h-12 w-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      2
                    </div>
                  </div>
                  <div className="mt-8 text-center">
                    <div className="h-20 w-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <MapPin className="h-10 w-10 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Find or Offer</h3>
                    <p className="text-gray-600">
                      Search for rides or offer your seats. Flexible matching for your schedule.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-2">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="h-12 w-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      3
                    </div>
                  </div>
                  <div className="mt-8 text-center">
                    <div className="h-20 w-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Car className="h-10 w-10 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Ride & Save</h3>
                    <p className="text-gray-600">
                      Connect, coordinate, and carpool. Track your ride in real-time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <button
              onClick={() => navigate('/signup')}
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 inline-flex items-center space-x-2"
            >
              <span>Start Your Journey Today</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials / Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Join The Community
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Be part of the sustainable transport revolution on your campus
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Save Money</h3>
              <p className="text-gray-600">Share costs and save up to ?500+ monthly on commute</p>
            </div>

            <div className="text-center p-6">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Make Friends</h3>
              <p className="text-gray-600">Connect with classmates and expand your social circle</p>
            </div>

            <div className="text-center p-6">
              <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Stay Safe</h3>
              <p className="text-gray-600">Verified students only, ratings & real-time tracking</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Car className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">RideFront</span>
              </div>
              <p className="text-gray-400 mb-4">
                Making campus commute smarter, safer, and more sustainable through shared rides.
              </p>
              <p className="text-sm text-gray-500">Smart India Hackathon 2025 Project</p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-white transition-colors">
                    How it Works
                  </a>
                </li>
                <li>
                  <a href="#sih" className="hover:text-white transition-colors">
                    SIH 2025
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="mailto:support@ridefront.com"
                    className="hover:text-white transition-colors"
                  >
                    Support
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">�20254 RideFront. All rights reserved.</p>
            <p className="text-sm text-gray-500 mt-4 md:mt-0">
              Built with ?? for Smart India Hackathon 2025
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
