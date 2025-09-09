import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/interview-app';

export const connectDB = async () => {
  try {
    // MongoDB Atlas connection options (modern Mongoose 6+ compatible)
    const options = {
      serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
    };

    await mongoose.connect(MONGODB_URI, options);
    console.log('✅ MongoDB Atlas connected successfully');
    console.log(`📍 Connected to database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Atlas connection error:', error.message);
    console.error('💡 Make sure your MongoDB Atlas connection string is correct and your IP is whitelisted');
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected successfully');
  } catch (error) {
    console.error('❌ MongoDB disconnection error:', error);
  }
}; 