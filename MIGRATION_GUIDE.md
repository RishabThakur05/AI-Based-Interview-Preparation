# PostgreSQL to MongoDB Atlas Migration Guide

## Overview
This guide will help you migrate your interview application from PostgreSQL to MongoDB Atlas.

## Prerequisites

1. **MongoDB Atlas Account**: Sign up for a free MongoDB Atlas account at https://www.mongodb.com/atlas
2. **Node.js Dependencies**: Install MongoDB dependencies

## Step 1: Install Dependencies

```bash
npm install mongodb mongoose
```

## Step 2: Set Up MongoDB Atlas

1. **Create a Cluster**:
   - Log into MongoDB Atlas
   - Create a new cluster (free tier is sufficient)
   - Choose your preferred cloud provider and region

2. **Set Up Database Access**:
   - Go to Database Access
   - Create a new database user with read/write permissions
   - Note down the username and password

3. **Set Up Network Access**:
   - Go to Network Access
   - Add your IP address or use `0.0.0.0/0` for all IPs (not recommended for production)

4. **Get Connection String**:
   - Go to Clusters
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string

## Step 3: Update Environment Variables

Update your `.env` file:

```env
# Remove or comment out PostgreSQL URL
# DATABASE_URL=postgresql://...

# Add MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/interview-app?retryWrites=true&w=majority
```

Replace `<username>`, `<password>`, and `<cluster>` with your actual MongoDB Atlas credentials.

## Step 4: Run the Migration (Optional)

If you have existing data in PostgreSQL that you want to migrate:

```bash
node server/database/migrateToMongo.js
```

This will migrate:
- Users
- User Progress
- Interview Sessions
- Daily Challenges
- Scheduled Interviews

## Step 5: Test the Application

1. **Start the server**:
   ```bash
   npm run dev
   ```

2. **Test the following features**:
   - User registration and login
   - Interview generation and completion
   - Daily challenges
   - Scheduled interviews
   - User profile and progress

## Step 6: Verify Migration

Check that all functionality works correctly:

- ✅ User authentication
- ✅ Interview sessions
- ✅ Daily challenges
- ✅ Scheduled interviews
- ✅ User progress tracking

## Troubleshooting

### Common Issues

1. **Connection Errors**:
   - Verify your MongoDB Atlas connection string
   - Check that your IP is whitelisted
   - Ensure database user has correct permissions

2. **Data Migration Issues**:
   - Check that PostgreSQL is still accessible
   - Verify that all required fields are present
   - Review migration logs for specific errors

3. **Application Errors**:
   - Check server logs for detailed error messages
   - Verify that all MongoDB models are properly imported
   - Ensure JWT tokens contain valid user IDs

### MongoDB Atlas Best Practices

1. **Security**:
   - Use strong passwords for database users
   - Restrict network access to specific IPs
   - Enable MongoDB Atlas security features

2. **Performance**:
   - Use indexes for frequently queried fields
   - Monitor query performance
   - Consider read preferences for global deployments

3. **Backup**:
   - Enable automated backups in MongoDB Atlas
   - Test restore procedures regularly

## Rollback Plan

If you need to rollback to PostgreSQL:

1. Keep your PostgreSQL database running during migration
2. Maintain the old code in a separate branch
3. Test thoroughly before switching production traffic
4. Have a rollback script ready

## Support

For MongoDB Atlas specific issues:
- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/
- MongoDB Community Forums: https://www.mongodb.com/community/forums/

For application-specific issues:
- Check the server logs for detailed error messages
- Review the migration script for data consistency 