# MongoDB Atlas Migration Guide

Your project has been updated to work with MongoDB Atlas. Follow these steps to complete the setup:

## 1. Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for a free account or log in
3. Create a new project (or use existing one)

## 2. Create a Cluster

1. Click "Create a Deployment" or "Build a Database"
2. Choose the **FREE** tier (M0 Sandbox)
3. Select your preferred cloud provider and region
4. Name your cluster (e.g., "interview-app-cluster")
5. Click "Create Deployment"

## 3. Create Database User

1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and strong password
5. Set user privileges to "Read and write to any database"
6. Click "Add User"

## 4. Configure Network Access

1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development, you can click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production, add your specific IP addresses
5. Click "Confirm"

## 5. Get Connection String

1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "4.1 or later"
5. Copy the connection string

## 6. Update Environment Variables

Replace the placeholder values in your `.env` files with your actual Atlas credentials:

### Root `.env` file:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database-name>?retryWrites=true&w=majority
```

### `server/.env` file:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database-name>?retryWrites=true&w=majority
```

**Replace:**
- `<username>` with your database username
- `<password>` with your database password
- `<cluster-name>` with your cluster name
- `<database-name>` with your preferred database name (e.g., "interview-app")

## 7. Test Connection

Run the test script to verify your connection:

```bash
node test-mongo.js
```

If successful, you should see:
```
✅ MongoDB Atlas connected successfully!
✅ Successfully created a test document
✅ Successfully retrieved test document
✅ Successfully deleted test document
✅ MongoDB Atlas disconnected successfully
```

## 8. Start Your Application

```bash
npm run dev
```

Your server should now connect to MongoDB Atlas instead of a local database.

## 9. Data Migration (Optional)

If you have existing data in PostgreSQL that you want to migrate to MongoDB Atlas:

1. Make sure your Atlas connection is working
2. Update the `MONGODB_URI` in the migration script
3. Run the migration:
   ```bash
   node server/database/migrateToMongo.js
   ```

## Troubleshooting

### Common Issues:

1. **Authentication Failed**
   - Double-check username and password
   - Ensure special characters in password are URL-encoded

2. **Connection Timeout**
   - Check if your IP is whitelisted
   - Verify cluster name in connection string

3. **Database Not Found**
   - MongoDB will create the database automatically when you first write data
   - Make sure the database name in your connection string is correct

### URL Encoding Special Characters

If your password contains special characters, encode them:
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`
- `#` → `%23`
- `[` → `%5B`
- `]` → `%5D`

## Security Best Practices

1. **Never commit credentials to version control**
2. **Use environment variables for all sensitive data**
3. **Restrict IP access in production**
4. **Use strong, unique passwords**
5. **Enable MongoDB Atlas monitoring and alerts**

## What Changed in Your Code

1. **Updated connection configuration** with Atlas-optimized settings
2. **Enhanced error handling** with specific Atlas error messages
3. **Improved test script** with better diagnostics
4. **Added connection options** for better performance and reliability

Your existing MongoDB models and schemas remain unchanged - they'll work seamlessly with Atlas!