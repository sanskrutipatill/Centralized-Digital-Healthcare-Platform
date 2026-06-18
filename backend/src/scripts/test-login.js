import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/userModel.js';
import connectDB from '../config/db.js';

dotenv.config();

const testLogin = async () => {
  try {
    await connectDB();

    console.log('🔍 Testing login with demo credentials...\n');

    const testEmail = 'patient@hms.com';
    const testPassword = 'demo123';

    // Find user by email
    const user = await User.findOne({ email: testEmail });

    if (!user) {
      console.log(`❌ User not found: ${testEmail}`);
      process.exit(1);
    }

    console.log(`✓ Found user: ${user.name} (${user.email})`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Stored password: ${user.password}\n`);

    // Generate fresh hash from demo123 to compare
    const freshHash = await bcrypt.hash(testPassword, 10);
    console.log(`🔑 Fresh hash for "demo123": ${freshHash}\n`);

    // Test password match
    const isMatch = await user.matchPassword(testPassword);
    console.log(`🔐 Password test for "${testPassword}": ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);

    // Count hash rounds
    const hashParts = user.password.split('$');
    console.log(`\n📊 Hash format analysis:`);
    console.log(`  Version: ${hashParts[1]}`);
    console.log(`  Cost: ${hashParts[2]}`);
    console.log(`  Salt+Hash length: ${hashParts[3] ? hashParts[3].length : 'N/A'} chars`);

    // Try to identify if it's double-hashed by checking hash characteristics
    const storedHash = user.password;
    const doubleCheck = await bcrypt.compare(testPassword, storedHash);
    console.log(`\n🎯 Direct bcrypt.compare result: ${doubleCheck ? '✅ VALID' : '❌ INVALID'}`);

    // Show a slice of the stored hash
    console.log(`\n📄 First 30 chars of stored hash: ${user.password.substring(0, 30)}...`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testLogin();
