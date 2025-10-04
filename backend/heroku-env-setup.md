# Heroku Environment Variables Setup

## Required Environment Variables

Set these environment variables in your Heroku app using the Heroku CLI or dashboard:

### Firebase Configuration
```bash
# Firebase Project ID
heroku config:set FIREBASE_PROJECT_ID=durvesh-ff5c1

# Firebase Private Key (replace with your actual private key)
heroku config:set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCgzxtyjMHOi2O2
cZZRej8s4Q0Py9THv+AG9CcnCtcvbXI4U5r8f2Tk6CPwUhwSmV+/af8eU8xjoB+H
s9XckUl998/uBn65dlLgahV63MabXvfnnbqWtWasVTjmfRAMu18SUE/RjqyTo857
MfNIrsWNynedx8mndDUd+n0QOw+Wklc/4EPvrKUnYeP8QyXU8Ux4kJzmHV/bNGzS
+KX7S08LaxcxcXoU7fBwB0KWjgHEhE8pL7Xg2QnqJa/nrA/ItBYTBP/UPBy+s60N
Po7KRGOK8FJjJkBxWofW+dODdGYr6fiO1oU/3Y2gVHtV8Q8pwXKfZqgyDn3IU5jr
OPLhav3TAgMBAAECggEAL33a8lKlrjU2ZpxXM4rx+3QfommlVrTRGdyjb4FhGc2t
7PqsDCQnjP8OFhx50/hd8a8BPFitRUL17OLspy51UPGOBBMA/A743PQXkeh/80Tx
3AKWJ4o9X2nv2wpWYhw4MLVtTUtgpl27TmDrI60SBRUljICDiqPkSA1BQDjhGqt3
cuKSUURGonUJEBMaV40X7T2lb3bHMLhFGwZ1CZntCznmUvSOZlqTm/pKlSqhvLGp
qPSeEiKFB3smT7NX1I4xAu40s4EwKZh/AE4T+YdqSzV8I9WhO980AxMP1bQocAZR
Xnujq5Q5x7xDEKwQmMmySr6LOnGNDxdK1BIia+V5uQKBgQDXDkYkdHOBdD/6jOMM
ufPr71fKso2d6rT8vIjDDuDRE9TZEPGqLJr8tV6s8CKZfxX3f43SsK7NZdkxKxRQ
Y/r5WoMiLEjGZXdn2G0MZG2NWEShkjNep0giVCOhwNnxfY3Oq/PN87r9rMZ89H/x
PqjaDlNKawOa/3vCagPTAVYQrQKBgQC/bN62lWrLEnXriWBo9W8NkxuboI8MRB+M
MK8wGYTe2YKsX0mNVuX6nOMJ3aM5gtLLH04tHVlY40NbtvneUYf0blfWMzpGldt1
EAjHicipAfyUZr4YCb0c/HeWBUPpnVqZAVVBhncq95aUka1pxkvBVp3PHbSx6sqB
sPS0ZVqYfwKBgFSuTDRinnDlI6Q3AdirCD9pGXq5YEZEe0vhuUCFhUUOuAtZPq+x
rL3BdSxHyngCsNWqJmBGLi624hUYT4FwPQ0e9O/p3CYzIheEAzyT9wdnMG8msI+e
8yqBUx6IX8lVlRdCYlhAlur4s5fUduS5tadXaLiu9tZ7r3HYaPUXW5ppAoGBAKdO
wFlUvsI+oFH9AAa8fROgP8EF1AEkiW4+HuArbbZY5Z1Cq0adbORduxIkZUUe0p41
/l3wCOdnureudTWajPlWd+7/Vy/aSrVGDmZYRslwsxIBuqPH30I2Z073yyOkJEsW
ny1mGUG0pCe2K5sHda7FxagAjq3ySIyR3U7ORyCBAoGAFlax1EAByT7+M+nfRYxY
NlDcjEM8tNquJ1LzcTAU1xvRJ16fpcJdtoyEuqGrJlfkSU7HRm/pKjdG5jzXnldh
RvcLLchkpf/280u3GZ5eZjwylLUgQYxvlSRUTBLmTkFiQ9GDcb2JYxfs844DXdSY
+jvooh3ziV80/Dod2+LTNac=
-----END PRIVATE KEY-----"

# Firebase Client Email
heroku config:set FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@durvesh-ff5c1.iam.gserviceaccount.com

# Firebase Client ID
heroku config:set FIREBASE_CLIENT_ID=110730231166840450694

# Firebase Auth URI
heroku config:set FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth

# Firebase Token URI
heroku config:set FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# Firebase Auth Provider X509 Cert URL
heroku config:set FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs

# Firebase Client X509 Cert URL
heroku config:set FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40durvesh-ff5c1.iam.gserviceaccount.com

# Firebase Storage Bucket
heroku config:set FIREBASE_STORAGE_BUCKET=durvesh-ff5c1.firebasestorage.app
```

### Mapbox Configuration
```bash
# Mapbox Access Token
heroku config:set MAPBOX_ACCESS_TOKEN=pk.eyJ1Ijoia2FyYW54YSIsImEiOiJjbWcydnlkaTQwdHJ3MmtzNmU0ZjhtNjNhIn0.MefwJP2ybogMMLcAqNSegg
```

### Application Configuration
```bash
# Debug Mode (set to False for production)
heroku config:set DEBUG=False

# Secret Key (use a strong, random key for production)
heroku config:set SECRET_KEY=your-production-secret-key-here

# Access Token Expire Minutes
heroku config:set ACCESS_TOKEN_EXPIRE_MINUTES=11520

# CORS Origins (add your frontend domain)
heroku config:set BACKEND_CORS_ORIGINS=["https://your-frontend-domain.vercel.app","https://your-frontend-domain.com"]
```

## Quick Setup Script

You can also run this script to set all environment variables at once:

```bash
# Make sure to replace the values with your actual credentials
./set-heroku-env.sh your-app-name
```

## Verification

After setting the environment variables, verify they are set correctly:

```bash
# View all environment variables
heroku config -a your-app-name

# Test the app
heroku open -a your-app-name
```

## Security Notes

1. **Never commit sensitive credentials to git**
2. **Use strong, random secret keys for production**
3. **Regularly rotate your Firebase service account keys**
4. **Monitor your app logs for any security issues**
5. **Use HTTPS for all communications**
