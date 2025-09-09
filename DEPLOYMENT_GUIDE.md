# Deployment Guide for Render

## Environment Variables to Set in Render Dashboard

Go to your Render service dashboard and add these environment variables:

### Required Variables:
```
NODE_ENV=production
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-secure-jwt-secret-key
```

### Optional Variables (for email functionality):
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Optional Variables (for AI features):
```
OPENROUTER_API_KEY=your-openrouter-api-key
GEMINI_API_KEY=your-gemini-api-key
```

## Deployment Steps:

1. **Verify build setup locally:**
   ```bash
   node verify-build.js
   npm run build
   ```

2. **Push your code to GitHub** (make sure all changes are committed)

3. **In Render Dashboard:**
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm start`
   - Node Version: `22.16.0` (or use .nvmrc)
   - Add all environment variables listed above

4. **Update CORS origin** in `server/index.js`:
   - Replace `'https://your-app-name.onrender.com'` with your actual Render URL

5. **Deploy and test**

## Troubleshooting:

### If deployment fails:
- Check build logs for errors
- Ensure all environment variables are set
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0

### If app doesn't load:
- Check if the server is binding to 0.0.0.0
- Verify static files are being served correctly
- Check browser console for API errors

### If API calls fail:
- Verify environment variables are set
- Check MongoDB connection
- Ensure CORS is configured correctly