import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js';
import connectDB from '../config/db.js';

dotenv.config();

const cleanupAndSeed = async () => {
  try {
    await connectDB();

    console.log('🧹 Deleting existing demo users...\n');

    // Delete all demo users
    const deleteResult = await User.deleteMany({
      email: { $in: ['patient@hms.com', 'doctor@hms.com', 'admin@hms.com'] }
    });
    console.log(`✓ Deleted ${deleteResult.deletedCount} users`);

    // Now create fresh users with plaintext passwords (Mongoose will hash them)
    console.log('\n🌱 Creating fresh demo users...\n');

    const demoUsers = [
      {
        name: 'Demo Patient',
        email: 'patient@hms.com',
        password: 'demo123', // Plain text - Mongoose will hash it
        role: 'patient',
        phone: '+1 555-0100',
        gender: 'Male',
        dob: '1990-01-15',
        bloodGroup: 'A+'
      },
      {
        name: 'Dr. Demo Doctor',
        email: 'doctor@hms.com',
        password: 'demo123', // Plain text
        role: 'doctor',
        phone: '+1 555-0101',
        gender: 'Male',
        experience: 10,
        qualifications: ['MD', 'Board Certified'],
        consultationFee: 150,
        availability: [
          { day: 'Monday', startTime: '09:00', endTime: '17:00' },
          { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
          { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
          { day: 'Friday', startTime: '09:00', endTime: '17:00' }
        ]
      },
      {
        name: 'Admin User',
        email: 'admin@hms.com',
        password: 'demo123', // Plain text
        role: 'admin',
        phone: '+1 555-0102'
      }
    ];

    let insertedCount = 0;
    for (const userData of demoUsers) {
      try {
        const user = await User.create(userData);
        console.log(`✓ Created ${user.role}: ${user.email} (ID: ${user._id})`);
        insertedCount++;
      } catch (error) {
        console.error(`✗ Error creating ${userData.role}:`, error.message);
        throw error;
      }
    }

    console.log(`\n✅ Seeding complete! ${insertedCount} users created.`);
    console.log('\n📋 Demo Credentials:');
    console.log('-------------------');
    demoUsers.forEach(user => {
      console.log(`${user.role.toUpperCase()}: ${user.email} / demo123`);
    });

    // Verify passwords work
    console.log('\n🔍 Verifying passwords...');
    for (const { email } of demoUsers) {
      const user = await User.findOne({ email });
      const isMatch = await user.matchPassword('demo123');
      console.log(`  ${email}: ${isMatch ? '✅' : '❌'} Password "${'demo123'}" ${isMatch ? 'works' : 'FAILED'}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
};

cleanupAndSeed();
