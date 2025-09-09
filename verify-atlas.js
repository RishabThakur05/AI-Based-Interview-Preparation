#!/usr/bin/env node

import { connectDB, disconnectDB } from './server/database/mongoInit.js';
import User from './server/models/User.js';

console.log('🔍 Verifying MongoDB Atlas setup...\n');

async function verifyAtlasSetup() {
  try {
    // Test connection
    console.log('1. Testing database connection...');
    await connectDB();
    
    // Test model operations
    console.log('2. Testing model operations...');
    
    // Create a test user
    const testUser = new User({
      username: 'atlas-test-user',
      email: 'test@atlas.com',
      password: 'test123',
      role: 'candidate'
    });
    
    await testUser.save();
    console.log('   ✅ Created test user');
    
    // Find the test user
    const foundUser = await User.findOne({ email: 'test@atlas.com' });
    console.log('   ✅ Retrieved test user:', foundUser.username);
    
    // Update the test user
    foundUser.username = 'atlas-test-updated';
    await foundUser.save();
    console.log('   ✅ Updated test user');
    
    // Delete the test user
    await User.deleteOne({ email: 'test@atlas.com' });
    console.log('   ✅ Deleted test user');
    
    console.log('\n🎉 MongoDB Atlas setup verified successfully!');
    console.log('Your application is ready to use MongoDB Atlas.');
    
  } catch (error) {
    console.error('\n❌ Atlas setup verification failed:', error.message);
    
    if (error.message.includes('MONGODB_URI')) {
      console.log('\n💡 Setup steps:');
      console.log('1. Create a MongoDB Atlas account');
      console.log('2. Create a cluster');
      console.log('3. Create a database user');
      console.log('4. Whitelist your IP address');
      console.log('5. Update MONGODB_URI in your .env file');
      console.log('\nSee MONGODB_ATLAS_SETUP.md for detailed instructions.');
    }
  } finally {
    await disconnectDB();
  }
}

verifyAtlasSetup();