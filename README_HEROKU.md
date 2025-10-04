# College Ride-Share Backend - Heroku Deployment

This guide will help you deploy your FastAPI backend to Heroku.

## 🚀 Quick Start

### Prerequisites
- Heroku CLI installed
- Git repository
- Firebase service account credentials

### 1. Install Heroku CLI
```bash
# Windows (using Chocolatey)
choco install heroku-cli

# Or download from: https://devcenter.heroku.com/articles/heroku-cli
```

### 2. Login to Heroku
```bash
heroku login
```

### 3. Create Heroku App
```bash
# Navigate to backend directory
cd backend

# Create Heroku app
heroku create your-ride-share-backend

# Or create with specific region
heroku create your-ride-share-backend --region us
```

### 4. Set Environment Variables
```bash
# Set Firebase credentials (replace with your actual values)
heroku config:set FIREBASE_PROJECT_ID=your-project-id
heroku config:set FIREBASE_PRIVATE_KEY="your-private-key"
heroku config:set FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
heroku config:set FIREBASE_CLIENT_ID=your-client-id
heroku config:set FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
heroku config:set FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
heroku config:set FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
heroku config:set FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com
heroku config:set FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app

# Set Mapbox token
heroku config:set MAPBOX_ACCESS_TOKEN=your-mapbox-token

# Set app configuration
heroku config:set DEBUG=False
heroku config:set SECRET_KEY=your-production-secret-key
heroku config:set ACCESS_TOKEN_EXPIRE_MINUTES=11520
heroku config:set BACKEND_CORS_ORIGINS=["https://your-frontend.vercel.app"]
```

### 5. Deploy
```bash
# Initialize git if not already done
git init

# Add Heroku remote
heroku git:remote -a your-ride-share-backend

# Add and commit files
git add .
git commit -m "Initial deployment"

# Deploy to Heroku
git push heroku main
```

### 6. Scale and Test
```bash
# Scale to 1 dyno (free tier)
heroku ps:scale web=1

# Open your app
heroku open

# Check logs
heroku logs --tail
```

## 📁 Files Created for Heroku

- `Procfile` - Tells Heroku how to run your app
- `runtime.txt` - Specifies Python version
- `requirements.txt` - Python dependencies (updated with gunicorn)
- `deploy.sh` - Bash deployment script
- `deploy.ps1` - PowerShell deployment script
- `test-heroku.py` - Test script for deployment
- `HEROKU_DEPLOYMENT.md` - Detailed deployment guide
- `heroku-env-setup.md` - Environment variables setup guide

## 🔧 Configuration

### Procfile
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Runtime
```
python-3.11.7
```

### Dependencies
All required dependencies are listed in `requirements.txt`, including:
- FastAPI
- Uvicorn
- Firebase Admin SDK
- Gunicorn (for production)

## 🌐 Environment Variables

### Required Variables:
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_CLIENT_ID`
- `FIREBASE_AUTH_URI`
- `FIREBASE_TOKEN_URI`
- `FIREBASE_AUTH_PROVIDER_X509_CERT_URL`
- `FIREBASE_CLIENT_X509_CERT_URL`
- `FIREBASE_STORAGE_BUCKET`
- `MAPBOX_ACCESS_TOKEN`
- `SECRET_KEY`
- `DEBUG`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `BACKEND_CORS_ORIGINS`

## 🧪 Testing

### Test Your Deployment
```bash
# Test the deployed app
python test-heroku.py https://your-app-name.herokuapp.com
```

### Manual Testing
```bash
# Health check
curl https://your-app-name.herokuapp.com/health

# API docs
open https://your-app-name.herokuapp.com/docs
```

## 📊 Monitoring

### View Logs
```bash
# Real-time logs
heroku logs --tail

# Recent logs
heroku logs -n 100
```

### Check App Status
```bash
# App info
heroku info

# Process status
heroku ps
```

## 🔄 Updates

### Deploy Updates
```bash
# Make your changes
git add .
git commit -m "Update backend"

# Deploy
git push heroku main
```

### Restart App
```bash
heroku restart
```

## 🚨 Troubleshooting

### Common Issues:

1. **Build Failures**
   ```bash
   heroku logs --tail
   ```

2. **Environment Variables**
   ```bash
   heroku config
   ```

3. **CORS Issues**
   - Check `BACKEND_CORS_ORIGINS` includes your frontend domain
   - Verify frontend is making requests to correct backend URL

4. **Firebase Issues**
   - Verify all Firebase environment variables are set correctly
   - Check Firebase service account permissions

### Useful Commands:
```bash
# Run commands in Heroku
heroku run python -c "print('Hello from Heroku')"

# Check environment
heroku run env

# Restart app
heroku restart

# Scale dynos
heroku ps:scale web=1
```

## 💰 Cost Considerations

- **Free Tier**: 550-1000 dyno hours per month
- **Hobby Tier**: $7/month for unlimited dyno hours
- **Production**: Consider scaling based on traffic

## 🔒 Security

- Use strong, random secret keys
- Never commit credentials to git
- Regularly rotate Firebase service account keys
- Monitor logs for security issues
- Use HTTPS (automatically provided by Heroku)

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale to multiple dynos
heroku ps:scale web=3
```

### Vertical Scaling
- Upgrade to paid dyno types for better performance
- Add Heroku Postgres for database needs
- Use Redis for caching

## 🎯 Production Checklist

- [ ] Set `DEBUG=False`
- [ ] Use strong `SECRET_KEY`
- [ ] Configure proper CORS origins
- [ ] Set up monitoring
- [ ] Configure custom domain (optional)
- [ ] Set up SSL (automatic with Heroku)
- [ ] Configure backup strategy
- [ ] Set up logging and monitoring
