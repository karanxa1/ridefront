# Heroku Deployment Guide

## Prerequisites
1. Heroku CLI installed
2. Git repository with your backend code
3. Firebase service account credentials

## Deployment Steps

### 1. Create Heroku App
```bash
# Login to Heroku
heroku login

# Create a new app (replace 'your-app-name' with your desired name)
heroku create your-ride-share-backend

# Or create with a specific region
heroku create your-ride-share-backend --region us
```

### 2. Set Environment Variables
Set the following environment variables in your Heroku app:

```bash
# Firebase Configuration
heroku config:set FIREBASE_PROJECT_ID=your-firebase-project-id
heroku config:set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR-FIREBASE-PRIVATE-KEY-HERE\n-----END PRIVATE KEY-----"
heroku config:set FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
heroku config:set FIREBASE_CLIENT_ID=your-client-id
heroku config:set FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
heroku config:set FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
heroku config:set FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
heroku config:set FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com
heroku config:set FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app

# Mapbox Configuration
heroku config:set MAPBOX_ACCESS_TOKEN=your-mapbox-access-token

# Application Configuration
heroku config:set DEBUG=False
heroku config:set SECRET_KEY=your-production-secret-key
heroku config:set ACCESS_TOKEN_EXPIRE_MINUTES=11520

# CORS Configuration (add your frontend URLs)
heroku config:set BACKEND_CORS_ORIGINS=["https://your-frontend-domain.vercel.app","https://your-frontend-domain.com"]
```

### 3. Deploy to Heroku
```bash
# Navigate to your backend directory
cd backend

# Initialize git if not already done
git init

# Add Heroku remote
heroku git:remote -a your-ride-share-backend

# Add all files
git add .

# Commit changes
git commit -m "Initial commit for Heroku deployment"

# Deploy to Heroku
git push heroku main
```

### 4. Scale the App
```bash
# Scale to 1 web dyno (free tier)
heroku ps:scale web=1

# Or scale to multiple dynos for production
heroku ps:scale web=2
```

### 5. View Logs
```bash
# View real-time logs
heroku logs --tail

# View recent logs
heroku logs
```

### 6. Open Your App
```bash
# Open the app in browser
heroku open

# Or get the URL
heroku info
```

## Important Notes

1. **Firebase Credentials**: Make sure to use your actual Firebase service account credentials
2. **CORS Origins**: Update the CORS origins to include your frontend domain
3. **Secret Key**: Use a strong, random secret key for production
4. **Debug Mode**: Set DEBUG=False for production
5. **Database**: If you need a database, consider adding Heroku Postgres addon

## Troubleshooting

### Common Issues:
1. **Build Failures**: Check the build logs with `heroku logs --tail`
2. **Environment Variables**: Verify all required environment variables are set
3. **CORS Issues**: Ensure your frontend domain is in the CORS origins
4. **Firebase Issues**: Verify Firebase credentials are correct

### Useful Commands:
```bash
# Check app status
heroku ps

# Restart the app
heroku restart

# Run commands in the app
heroku run python -c "print('Hello from Heroku')"

# Check environment variables
heroku config
```

## Production Considerations

1. **Add-ons**: Consider adding Heroku Postgres for database needs
2. **Monitoring**: Use Heroku metrics and logs for monitoring
3. **Scaling**: Scale dynos based on traffic
4. **SSL**: Heroku provides SSL certificates automatically
5. **Custom Domain**: Configure custom domain if needed
