import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('Testing MongoDB Atlas connection...');
console.log('MongoDB URI:', MONGODB_URI ? 'Set' : 'Not set');

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set');
  console.log('💡 Please set your MongoDB Atlas connection string in .env file');
  process.exit(1);
}

async function testConnection() {
  try {
    // Atlas connection options (modern Mongoose 6+ compatible)
    const options = {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    };

    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, options);
    console.log('✅ MongoDB Atlas connected successfully!');
    console.log(`📍 Connected to database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    
    // Test creating a simple document
    const TestSchema = new mongoose.Schema({ 
      name: String, 
      timestamp: { type: Date, default: Date.now }
    });
    const Test = mongoose.model('Test', TestSchema);
    
    const testDoc = new Test({ name: 'atlas-connection-test' });
    await testDoc.save();
    console.log('✅ Successfully created a test document');
    
    // Verify document exists
    const foundDoc = await Test.findOne({ name: 'atlas-connection-test' });
    console.log('✅ Successfully retrieved test document:', foundDoc.name);
    
    // Clean up
    await Test.deleteOne({ name: 'atlas-connection-test' });
    console.log('✅ Successfully deleted test document');
    
    await mongoose.disconnect();
    console.log('✅ MongoDB Atlas disconnected successfully');
    
  } catch (error) {
    console.error('❌ MongoDB Atlas connection error:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('💡 Check your username and password in the connection string');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Check your cluster name in the connection string');
    } else if (error.message.includes('IP')) {
      console.log('💡 Make sure your IP address is whitelisted in MongoDB Atlas');
    }
    
    process.exit(1);
  }
}

testConnection(); 