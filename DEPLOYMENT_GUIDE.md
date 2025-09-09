# Deployment Guide for Render

## Environment Variables to Set in Render Dashboard

Go to your Render service dashboard and add these environment variables:

### Required Variables:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://rishab12:ThakurRishab@cluster0.u5ngnja.mongodb.net/interview-app?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-for-interview-app-2024
```

### Optional Variables (for email functionality):
```
EMAIL_USER=dikshabhandari665@gmail.com
EMAIL_PASS=fubm qzhj gtxn lnqu
```

### Optional Variables (for AI features):
```
OPENROUTER_API_KEY=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
GEMINI_API_KEY=AIzaSyBfVWZdLhWIdMRpQwwQuEMSYkAChCAea98
```

## Deployment Steps:

1. **Push your code to GitHub** (make sure all changes are committed)

2. **In Render Dashboard:**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add all environment variables listed above

3. **Update CORS origin** in `server/index.js`:
   - Replace `'https://your-app-name.onrender.com'` with your actual Render URL

4. **Deploy and test**

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