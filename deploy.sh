#!/bin/bash

# Heroku Deployment Script for College Ride-Share Backend

echo "🚀 Starting Heroku deployment..."

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI is not installed. Please install it first."
    echo "Visit: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if user is logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo "❌ Please login to Heroku first:"
    echo "heroku login"
    exit 1
fi

# Get app name from user or use default
if [ -z "$1" ]; then
    echo "Usage: ./deploy.sh <heroku-app-name>"
    echo "Example: ./deploy.sh my-ride-share-backend"
    exit 1
fi

APP_NAME=$1

echo "📦 Deploying to Heroku app: $APP_NAME"

# Check if app exists
if ! heroku apps:info -a $APP_NAME &> /dev/null; then
    echo "❌ App '$APP_NAME' does not exist. Creating it..."
    heroku create $APP_NAME
fi

# Set up git remote if not exists
if ! git remote | grep -q heroku; then
    echo "🔗 Adding Heroku remote..."
    heroku git:remote -a $APP_NAME
fi

# Add and commit changes
echo "📝 Adding changes to git..."
git add .

echo "💾 Committing changes..."
git commit -m "Deploy to Heroku - $(date)"

# Deploy to Heroku
echo "🚀 Deploying to Heroku..."
git push heroku main

# Check deployment status
echo "✅ Deployment complete!"
echo "🌐 Your app is available at: https://$APP_NAME.herokuapp.com"

# Show logs
echo "📋 Recent logs:"
heroku logs --tail -n 20 -a $APP_NAME
