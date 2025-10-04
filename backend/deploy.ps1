# Heroku Deployment Script for College Ride-Share Backend (PowerShell)

param(
    [Parameter(Mandatory=$true)]
    [string]$AppName
)

Write-Host "🚀 Starting Heroku deployment..." -ForegroundColor Green

# Check if Heroku CLI is installed
try {
    heroku --version | Out-Null
    Write-Host "✅ Heroku CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Heroku CLI is not installed. Please install it first." -ForegroundColor Red
    Write-Host "Visit: https://devcenter.heroku.com/articles/heroku-cli" -ForegroundColor Yellow
    exit 1
}

# Check if user is logged in to Heroku
try {
    heroku auth:whoami | Out-Null
    Write-Host "✅ Logged in to Heroku" -ForegroundColor Green
} catch {
    Write-Host "❌ Please login to Heroku first:" -ForegroundColor Red
    Write-Host "heroku login" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Deploying to Heroku app: $AppName" -ForegroundColor Cyan

# Check if app exists
try {
    heroku apps:info -a $AppName | Out-Null
    Write-Host "✅ App '$AppName' exists" -ForegroundColor Green
} catch {
    Write-Host "❌ App '$AppName' does not exist. Creating it..." -ForegroundColor Yellow
    heroku create $AppName
}

# Set up git remote if not exists
$remotes = git remote
if ($remotes -notcontains "heroku") {
    Write-Host "🔗 Adding Heroku remote..." -ForegroundColor Yellow
    heroku git:remote -a $AppName
}

# Add and commit changes
Write-Host "📝 Adding changes to git..." -ForegroundColor Yellow
git add .

Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m "Deploy to Heroku - $(Get-Date)"

# Deploy to Heroku
Write-Host "🚀 Deploying to Heroku..." -ForegroundColor Yellow
git push heroku main

# Check deployment status
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Your app is available at: https://$AppName.herokuapp.com" -ForegroundColor Cyan

# Show logs
Write-Host "📋 Recent logs:" -ForegroundColor Yellow
heroku logs --tail -n 20 -a $AppName
