# 🚗 RideFront - College Ride Sharing Platform

A modern, full-stack ride-sharing application built specifically for college students to connect and share rides efficiently. Features real-time tracking, chat, secure authentication, and an intuitive user interface.

![React](https://img.shields.io/badge/React-19.1.1-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.1.7-purple?logo=vite)
![Firebase](https://img.shields.io/badge/Firebase-12.3.0-orange?logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-cyan?logo=tailwindcss)

## ✨ Features

### Core Features
- 🔐 **Secure Authentication** - Firebase-based user authentication with role-based access
- 🚘 **Ride Management** - Create, search, book, and manage rides
- 🗺️ **Real-time Maps** - Interactive maps powered by Mapbox GL JS
- 📍 **Live Tracking** - Real-time driver location tracking
- 💬 **In-Ride Chat** - Direct messaging between drivers and passengers
- 🔔 **Push Notifications** - Firebase Cloud Messaging integration
- ⭐ **Reviews & Ratings** - Rate and review drivers and passengers
- 📱 **Responsive Design** - Mobile-first, works on all devices
- 🌓 **Theme Support** - Light, dark, and system theme options

### Technical Highlights
- ⚡ **Fast Development** - Vite for lightning-fast HMR
- 🎯 **Type Safety** - Full TypeScript support with strict mode
- 🎨 **Modern UI** - Tailwind CSS for beautiful, responsive interfaces
- 🔄 **State Management** - Zustand for lightweight, efficient state
- 📦 **Code Splitting** - Optimized bundle sizes with smart chunking
- 🛡️ **Error Boundaries** - Graceful error handling throughout the app
- ✅ **Environment Validation** - Automatic validation of configuration
- 🔧 **Developer Tools** - ESLint, Prettier, TypeScript for code quality

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v9.0.0 or higher) or **yarn** (v1.22.0 or higher)
- **Git** - [Download](https://git-scm.com/)

You'll also need accounts for:
- [Firebase](https://firebase.google.com/) - For authentication and real-time features
- [Mapbox](https://www.mapbox.com/) - For maps and geocoding services

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ridefront.git
cd ridefront
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

Copy the example environment file and update it with your credentials:

```bash
cp env.example .env
```

Edit `.env` and replace the placeholder values:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:8000

# Mapbox Token (Get from: https://account.mapbox.com/access-tokens/)
VITE_MAPBOX_TOKEN=your_actual_mapbox_token

# Firebase Configuration (Get from: https://console.firebase.google.com/)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

### 4. Start the Development Server

```bash
npm run dev
# or
yarn dev
```

The application will open at [http://localhost:3000](http://localhost:3000)

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production-ready bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |
| `npm run lint:fix` | Auto-fix ESLint errors |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check if code is properly formatted |
| `npm run type-check` | Run TypeScript type checking |
| `npm run validate` | Run all checks (types, lint, format) |
| `npm run clean` | Remove build artifacts |

## 📁 Project Structure

```
ridefront/
├── public/                  # Static assets
│   ├── manifest.json       # PWA manifest
│   └── icons/              # App icons
├── src/
│   ├── assets/             # Images, fonts, etc.
│   ├── components/         # Reusable React components
│   │   ├── AuthGuard.tsx   # Route protection component
│   │   ├── ErrorBoundary.tsx # Error handling component
│   │   ├── LoadingSpinner.tsx
│   │   └── MapboxMap.tsx
│   ├── hooks/              # Custom React hooks
│   │   └── useStore.ts     # Zustand store
│   ├── pages/              # Page components
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RideSearchPage.tsx
│   │   └── ...
│   ├── services/           # API and external services
│   │   ├── api.ts          # Backend API service
│   │   ├── auth.ts         # Authentication service
│   │   ├── firebase.ts     # Firebase configuration
│   │   └── location.ts     # Location services
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/              # Utility functions
│   │   ├── index.ts        # Common utilities
│   │   └── validateEnv.ts  # Environment validation
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── .env.example            # Environment variables template
├── .prettierrc             # Prettier configuration
├── eslint.config.js        # ESLint configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── package.json            # Project dependencies
```

## 🔐 Setting Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or select existing)
3. Enable **Authentication** with Email/Password
4. Enable **Firestore Database**
5. Enable **Cloud Messaging** for push notifications
6. Get your configuration from Project Settings → General
7. Add the configuration to your `.env` file

## 🗺️ Setting Up Mapbox

1. Create account at [Mapbox](https://www.mapbox.com/)
2. Go to [Access Tokens](https://account.mapbox.com/access-tokens/)
3. Create a new token with these scopes:
   - `styles:read`
   - `fonts:read`
   - `datasets:read`
   - `geocoding:read`
   - `directions:read`
4. Copy the token to your `.env` file

## 🏗️ Building for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

The production files will be in the `dist/` directory, ready for deployment.

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

### Environment Variables for Production

Make sure to set all environment variables in your hosting platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Build & Deploy → Environment

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Check formatting
npm run format:check

# Run all validations
npm run validate
```

## 🎨 Code Style

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety

To maintain consistency:

```bash
# Auto-format code
npm run format

# Auto-fix lint issues
npm run lint:fix
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run validations (`npm run validate`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Commit Message Format

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

## 🐛 Troubleshooting

### Port Already in Use

If port 3000 is in use, Vite will automatically use the next available port. You can also specify a port:

```bash
npm run dev -- --port 3001
```

### Environment Variables Not Loading

1. Ensure `.env` file exists in the root directory
2. Restart the development server
3. Check that variables start with `VITE_`
4. Verify no syntax errors in `.env`

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

### Firebase Connection Issues

1. Check Firebase configuration in `.env`
2. Ensure Firebase services are enabled in console
3. Verify domain is authorized in Firebase Authentication settings

### Mapbox Not Loading

1. Verify Mapbox token is valid
2. Check token has required scopes
3. Ensure token is not restricted to other domains

## 📚 Additional Documentation

- [APP_FEATURES.md](./APP_FEATURES.md) - Complete list of features
- [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) - Detailed setup guide
- [PROJECT_RESEARCH_REFERENCES.md](./PROJECT_RESEARCH_REFERENCES.md) - Research and references
- [apidocs.md](./apidocs.md) - API documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Development Team** - [Your Team/Organization]
- **Contact** - support@rideshare.com

## 🙏 Acknowledgments

- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Firebase](https://firebase.google.com/) - Backend services
- [Mapbox](https://www.mapbox.com/) - Maps platform
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [Lucide React](https://lucide.dev/) - Icon library

## 📞 Support

- 📧 Email: support@rideshare.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/ridefront/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/ridefront/discussions)

---

Made with ❤️ for college students

**Happy Ride Sharing! 🚗💨**