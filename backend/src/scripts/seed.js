import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/userModel.js';
import Hospital from '../models/hospitalModel.js';
import Department from '../models/departmentModel.js';
import Appointment from '../models/appointmentModel.js';
import connectDB from '../config/db.js';

dotenv.config();

// Demo user accounts
const demoUsers = [
  {
    name: 'Demo Patient',
    email: 'patient@hms.com',
    password: 'demo123',
    role: 'patient',
    phone: '+91 555-0100',
    gender: 'Male',
    dob: '1990-01-15',
    bloodGroup: 'A+'
  },
  {
    name: 'Dr. Demo Doctor',
    email: 'doctor@hms.com',
    password: 'demo123',
    role: 'doctor',
    phone: '+91 555-0101',
    gender: 'Male',
    experience: 10,
    qualifications: ['MBBS', 'MD', 'Board Certified'],
    registrationNumber: 'MTC-123456',
    isVerified: true,
    consultationFee: 150,
    department: null, // Will be set after department creation
    hospital: null, // Will be set after hospital creation
    availability: [
      { day: 'Monday', startTime: '09:00', endTime: '13:00' },
      { day: 'Monday', startTime: '14:00', endTime: '17:00' },
      { day: 'Tuesday', startTime: '09:00', endTime: '13:00' },
      { day: 'Tuesday', startTime: '14:00', endTime: '17:00' },
      { day: 'Wednesday', startTime: '09:00', endTime: '13:00' },
      { day: 'Wednesday', startTime: '14:00', endTime: '17:00' },
      { day: 'Thursday', startTime: '09:00', endTime: '13:00' },
      { day: 'Thursday', startTime: '14:00', endTime: '17:00' },
      { day: 'Friday', startTime: '09:00', endTime: '13:00' },
      { day: 'Friday', startTime: '14:00', endTime: '17:00' },
      { day: 'Saturday', startTime: '09:00', endTime: '13:00' }
    ],
    specialization: 'General Medicine'
  },
  {
    name: 'Admin User',
    email: 'admin@hms.com',
    password: 'demo123',
    role: 'admin',
    phone: '+91 555-0102'
  }
];

// Aurangabad Hospitals (Maharashtra, India)
const aurangabadHospitals = [
  {
    name: 'Government Medical College & Hospital (GMCH)',
    address: {
      street: 'Cantonment Area',
      city: 'Aurangabad',
      state: 'Maharashtra',
      country: 'India',
      zipCode: '431001'
    },
    contact: {
      phone: '+91 240 233 5000',
      email: 'principal@gmch.edu.in',
      emergencyNumber: '+91 240 233 5300'
    },
    facilities: ['Emergency', 'ICU', 'Pharmacy', 'Laboratory', 'Radiology', 'Pathology', 'Blood Bank', 'Ambulance'],
    isActive: true
  },
  {
    name: 'Kamalnayan Bajaj Hospital',
    address: {
      street: 'Near Tapti River',
      city: 'Aurangabad',
      state: 'Maharashtra',
      country: 'India',
      zipCode: '431001'
    },
    contact: {
      phone: '+91 240 661 3000',
      email: 'info@kamalbajajhospital.com',
      emergencyNumber: '+91 240 661 3001'
    },
    facilities: ['Emergency', 'ICU', 'Pharmacy', 'Laboratory', 'Radiology', 'Pathology', 'Operation Theater', '24/7 Ambulance'],
    isActive: true
  },
  {
    name: 'United CIIGMA Hospital',
    address: {
      street: 'Jail Road',
      city: 'Aurangabad',
      state: 'Maharashtra',
      country: 'India',
      zipCode: '431001'
    },
    contact: {
      phone: '+91 240 234 4000',
      email: 'info@unitedciigma.com',
      emergencyNumber: '+91 240 234 4001'
    },
    facilities: ['Emergency', 'ICU', 'Pharmacy', 'Laboratory', 'Radiology', 'Pathology', 'Cardiology', 'Neurology'],
    isActive: true
  },
  {
    name: 'MGM Hospital Aurangabad',
    address: {
      street: 'Nanded Road',
      city: 'Aurangabad',
      state: 'Maharashtra',
      country: 'India',
      zipCode: '431152'
    },
    contact: {
      phone: '+91 240 237 7000',
      email: 'aurangabad@mgmmcha.com',
      emergencyNumber: '+91 240 237 7001'
    },
    facilities: ['Emergency', 'ICU', 'Pharmacy', 'Laboratory', 'Radiology', 'Pathology', 'Accident & Trauma', 'Blood Bank'],
    isActive: true
  },
  {
    name: 'Seth Nandlal Dhoot Hospital',
    address: {
      street: 'Juna Bazar',
      city: 'Aurangabad',
      state: 'Maharashtra',
      country: 'India',
      zipCode: '431001'
    },
    contact: {
      phone: '+91 240 233 1700',
      email: 'info@dhoothospital.com',
      emergencyNumber: '+91 240 233 1701'
    },
    facilities: ['Emergency', 'ICU', 'Pharmacy', 'Laboratory', 'Radiology', 'Pathology', 'Surgery', 'Maternity'],
    isActive: true
  },
  {
    name: 'Apex Superspeciality Hospital',
    address: {
      street: 'Cidco',
      city: 'Aurangabad',
      state: 'Maharashtra',
      country: 'India',
      zipCode: '431003'
    },
    contact: {
      phone: '+91 240 660 3000',
      email: 'contact@apexhospital.in',
      emergencyNumber: '+91 240 660 3001'
    },
    facilities: ['Emergency', 'ICU', 'Pharmacy', 'Laboratory', 'Radiology', 'Pathology', 'Cardiology', 'Neurology', 'Orthopedics'],
    isActive: true
  }
];

// Departments
const departments = [
  { name: 'Cardiology', description: 'Heart and cardiovascular system' },
  { name: 'Neurology', description: 'Brain and nervous system disorders' },
  { name: 'Orthopedics', description: 'Bones, joints, and muscles' },
  { name: 'General Medicine', description: 'General health checkups and non-surgical treatments' },
  { name: 'Pediatrics', description: 'Child health and medical care' },
  { name: 'Gynecology', description: 'Women\'s reproductive health' },
  { name: 'Dermatology', description: 'Skin, hair, and nail conditions' },
  { name: 'Ophthalmology', description: 'Eye care and vision health' },
  { name: 'ENT', description: 'Ear, Nose, and Throat treatments' },
  { name: 'Gastroenterology', description: 'Digestive system and stomach disorders' },
  { name: 'Pathology', description: 'Diagnostic laboratory and testing' }
];

// Realistic Indian doctor names with specializations
const doctorsData = [
  // Cardiologists
  { name: 'Dr. Rajesh Sharma', specialization: 'Cardiologist', experience: 15, qualifications: ['MD', 'DM'], consultationFee: 500 },
  { name: 'Dr. Priya Mehta', specialization: 'Cardiologist', experience: 12, qualifications: ['MBBS', 'MD', 'DM'], consultationFee: 600 },
  { name: 'Dr. Sunil Deshmukh', specialization: 'Cardiologist', experience: 18, qualifications: ['MD', 'DM'], consultationFee: 700 },

  // Neurologists
  { name: 'Dr. Anil Patil', specialization: 'Neurologist', experience: 14, qualifications: ['MBBS', 'MD', 'DM'], consultationFee: 600 },
  { name: 'Dr. Asha Joshi', specialization: 'Neurologist', experience: 10, qualifications: ['MD', 'DM'], consultationFee: 550 },
  { name: 'Dr. Vikram Singh', specialization: 'Neurologist', experience: 16, qualifications: ['MBBS', 'MD'], consultationFee: 650 },

  // Orthopedic Surgeons
  { name: 'Dr. Mahesh Jadhav', specialization: 'Orthopedic Surgeon', experience: 20, qualifications: ['MBBS', 'MS', 'MCh'], consultationFee: 700 },
  { name: 'Dr. Nilesh More', specialization: 'Orthopedic Surgeon', experience: 12, qualifications: ['MBBS', 'MS'], consultationFee: 500 },
  { name: 'Dr. Sujata Gite', specialization: 'Orthopedic Surgeon', experience: 15, qualifications: ['MS', 'MCh'], consultationFee: 600 },

  // General Physicians
  { name: 'Dr. Balasaheb Pawar', specialization: 'General Physician', experience: 22, qualifications: ['MBBS', 'MD'], consultationFee: 300 },
  { name: 'Dr. Shubhangi Kulkarni', specialization: 'General Physician', experience: 10, qualifications: ['MBBS', 'DNB'], consultationFee: 250 },
  { name: 'Dr. Ramesh Khalkar', specialization: 'General Physician', experience: 18, qualifications: ['MBBS', 'MD'], consultationFee: 350 },

  // Pediatricians
  { name: 'Dr. Shilpa Deshpande', specialization: 'Pediatrician', experience: 12, qualifications: ['MBBS', 'MD'], consultationFee: 400 },
  { name: 'Dr. Ajit Ghorpade', specialization: 'Pediatrician', experience: 15, qualifications: ['MBBS', 'MD', 'DMCH'], consultationFee: 500 },
  { name: 'Dr. Neha Choudhary', specialization: 'Pediatrician', experience: 8, qualifications: ['MBBS', 'MD'], consultationFee: 350 },

  // Gynecologists
  { name: 'Dr. Kirti Shinde', specialization: 'Gynecologist', experience: 14, qualifications: ['MBBS', 'MD', 'DNB'], consultationFee: 500 },
  { name: 'Dr. Mrunalini Dambal', specialization: 'Gynecologist', experience: 16, qualifications: ['MBBS', 'MD'], consultationFee: 550 },
  { name: 'Dr. Pooja Malhotra', specialization: 'Gynecologist', experience: 11, qualifications: ['MBBS', 'MD'], consultationFee: 450 },

  // Dermatologists
  { name: 'Dr. Pravin Sangle', specialization: 'Dermatologist', experience: 13, qualifications: ['MBBS', 'MD'], consultationFee: 400 },
  { name: 'Dr. Ayesha Shaikh', specialization: 'Dermatologist', experience: 9, qualifications: ['MBBS', 'DNB'], consultationFee: 350 },

  // Ophthalmologists
  { name: 'Dr. Shirish Kangutkar', specialization: 'Ophthalmologist', experience: 17, qualifications: ['MBBS', 'MS'], consultationFee: 450 },
  { name: 'Dr. Swapnil Adsul', specialization: 'Ophthalmologist', experience: 10, qualifications: ['MBBS', 'MS'], consultationFee: 350 },

  // ENT Specialists
  { name: 'Dr. Girish Kulkarni', specialization: 'ENT Specialist', experience: 12, qualifications: ['MBBS', 'MS'], consultationFee: 400 },
  { name: 'Dr. Abhijit Patil', specialization: 'ENT Specialist', experience: 10, qualifications: ['MBBS', 'MS'], consultationFee: 350 },

  // Gastroenterologists
  { name: 'Dr. Sanjay Borse', specialization: 'Gastroenterologist', experience: 15, qualifications: ['MBBS', 'MD', 'DM'], consultationFee: 600 },
  { name: 'Dr. Tejaswi Nalawade', specialization: 'Gastroenterologist', experience: 8, qualifications: ['MBBS', 'MD', 'DM'], consultationFee: 500 },

  // Pathologists
  { name: 'Dr. Kavita Joshi', specialization: 'Pathologist', experience: 12, qualifications: ['MBBS', 'MD (Pathology)'], consultationFee: 300 },
  { name: 'Dr. Anand Deshmukh', specialization: 'Pathologist', experience: 16, qualifications: ['MBBS', 'MD', 'DCP'], consultationFee: 350 }
];

// Hospital working hours (9 AM to 8 PM with breaks)
const generateAvailability = () => [
  { day: 'Monday', startTime: '09:00', endTime: '13:00' },
  { day: 'Monday', startTime: '14:00', endTime: '20:00' },
  { day: 'Tuesday', startTime: '09:00', endTime: '13:00' },
  { day: 'Tuesday', startTime: '14:00', endTime: '20:00' },
  { day: 'Wednesday', startTime: '09:00', endTime: '13:00' },
  { day: 'Wednesday', startTime: '14:00', endTime: '20:00' },
  { day: 'Thursday', startTime: '09:00', endTime: '13:00' },
  { day: 'Thursday', startTime: '14:00', endTime: '20:00' },
  { day: 'Friday', startTime: '09:00', endTime: '13:00' },
  { day: 'Friday', startTime: '14:00', endTime: '20:00' },
  { day: 'Saturday', startTime: '09:00', endTime: '16:00' }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🌱 Starting database seeding...\n');

    // Clear existing data for fresh start
    console.log('Clearing existing data...');
    await User.deleteMany({ role: 'doctor' });
    await Hospital.deleteMany({});
    await Department.deleteMany({});
    await Appointment.deleteMany({});
    console.log('  ✓Existing data cleared\n');

    // Note: Passwords will be automatically hashed by the User model's pre-save hook

    // Create all departments
    console.log('Creating departments...');
    const createdDepartments = {};
    for (const deptData of departments) {
      const dept = await Department.create(deptData);
      console.log(`  ✓ Created Department: ${dept.name} (ID: ${dept._id})`);
      createdDepartments[deptData.name] = dept._id;
    }

    // Create all hospitals and assign departments
    console.log('\nCreating hospitals...');
    const createdHospitals = {};
    for (let i = 0; i < aurangabadHospitals.length; i++) {
      const hospitalData = aurangabadHospitals[i];
      // Assign 4-6 random departments to each hospital
      const deptNames = Object.keys(createdDepartments);
      const numDepts = Math.floor(Math.random() * 3) + 4; // 4-6
      const shuffled = deptNames.sort(() => 0.5 - Math.random());
      const selectedDepts = shuffled.slice(0, numDepts);
      const deptIds = selectedDepts.map(name => createdDepartments[name]);

      hospitalData.departments = deptIds;

      const hospital = await Hospital.create(hospitalData);
      console.log(`  ✓ Created Hospital: ${hospital.name} (ID: ${hospital._id})`);
      createdHospitals[hospitalData.name] = hospital._id;
    }

    // Create or find the demo doctor account (simple)
    console.log('\nManaging demo user accounts...');
    const doctorUser = demoUsers.find(u => u.role === 'doctor');
    if (doctorUser) {
      // Assign first hospital and first department to demo doctor
      const firstHospitalId = Object.values(createdHospitals)[0];
      const firstDeptId = Object.values(createdDepartments)[0];
      doctorUser.department = firstDeptId;
      doctorUser.hospital = firstHospitalId;
      doctorUser.availability = generateAvailability();
    }

    // Create demo users (patient, doctor, admin)
    let updatedCount = 0;
    for (const userData of demoUsers) {
      try {
        const user = await User.create(userData);
        console.log(`  ✓ Created ${userData.role}: ${user.email} (ID: ${user._id})`);
        updatedCount++;
      } catch (error) {
        if (error.code === 11000) {
          const existingUser = await User.findOne({ email: userData.email });
          if (existingUser) {
            if (userData.department) existingUser.department = userData.department;
            if (userData.hospital) existingUser.hospital = userData.hospital;
            await existingUser.save();
            console.log(`  → Updated ${userData.role}: ${userData.email}`);
          }
        } else {
          console.error(`  ✗ Error creating ${userData.role}:`, error.message);
        }
      }
    }

    // Create realistic doctors and assign them to hospitals
    console.log('\nCreating realistic doctors...');
    let doctorsCreated = 0;
    for (const docData of doctorsData) {
      // Find suitable hospital based on specialization
      let suitableHospitals = aurangabadHospitals.filter(h =>
        h.facilities.some(f => f.toLowerCase().includes(docData.specialization.toLowerCase().split(' ')[0]))
      );
      if (suitableHospitals.length === 0) suitableHospitals = aurangabadHospitals;

      const randomHospital = suitableHospitals[Math.floor(Math.random() * suitableHospitals.length)];
      const hospitalId = createdHospitals[randomHospital.name];

      // Find corresponding department
      let deptName = 'General Medicine';
      const specLower = docData.specialization.toLowerCase();
      if (specLower.includes('cardio')) deptName = 'Cardiology';
      else if (specLower.includes('neuro')) deptName = 'Neurology';
      else if (specLower.includes('ortho')) deptName = 'Orthopedics';
      else if (specLower.includes('pediatric')) deptName = 'Pediatrics';
      else if (specLower.includes('gynae') || specLower.includes('gynecology')) deptName = 'Gynecology';
      else if (specLower.includes('derma')) deptName = 'Dermatology';
      else if (specLower.includes('opth') || specLower.includes('ophthalmology')) deptName = 'Ophthalmology';
      else if (specLower.includes('ent')) deptName = 'ENT';
      else if (specLower.includes('gastro')) deptName = 'Gastroenterology';
      else if (specLower.includes('pathol')) deptName = 'Pathology';
      else if (specLower.includes('general')) deptName = 'General Medicine';

      const departmentId = createdDepartments[deptName] || Object.values(createdDepartments)[0];

      const doctorEmail = `dr.${docData.name.split(' ')[1].toLowerCase()}@hms.com`;
      const doctorPassword = 'demo123';

      try {
        const existingDoctor = await User.findOne({ email: doctorEmail });
        if (!existingDoctor) {
          const doctor = await User.create({
            name: docData.name,
            email: doctorEmail,
            password: doctorPassword,
            role: 'doctor',
            phone: `+91 ${7000000000 + Math.floor(Math.random() * 2999999999)}`,
            gender: Math.random() > 0.5 ? 'Male' : 'Female',
            experience: docData.experience,
            qualifications: docData.qualifications,
            registrationNumber: `MTC-${Math.floor(100000 + Math.random() * 900000)}`,
            isVerified: true, // All seeded doctors are verified
            consultationFee: docData.consultationFee,
            department: departmentId,
            hospital: hospitalId,
            availability: generateAvailability(),
            specialization: docData.specialization
          });
          console.log(`  ✓ Created Doctor: ${doctor.name} (${docData.specialization}) at ${randomHospital.name}`);
          doctorsCreated++;
        } else {
          console.log(`  → Skipped Doctor: ${docData.name} (already exists)`);
        }
      } catch (error) {
        if (error.code !== 11000) {
          console.error(`  ✗ Error creating doctor ${docData.name}:`, error.message);
        }
      }
    }

    // Create sample appointments to populate patient list
    console.log('\nCreating sample appointments...');
    const patientUser = await User.findOne({ email: 'patient@hms.com' });
    const demoDoctor = await User.findOne({ email: 'doctor@hms.com' });

    if (patientUser && demoDoctor) {
      const today = new Date();
      const appointments = [];

      // Create 5 past appointments and 2 upcoming appointments
      const symptomsList = [
        'Fever, cough, and body aches',
        'Headache and dizziness',
        'Chest pain and shortness of breath',
        'Stomach pain and nausea',
        'Joint pain and swelling',
        'Skin rash and itching',
        'Regular checkup'
      ];

      // Past appointments
      for (let i = 1; i <= 5; i++) {
        const appointmentDate = new Date(today);
        appointmentDate.setDate(today.getDate() - i * 7); // Weekly past appointments

        appointments.push({
          patient: patientUser._id,
          doctor: demoDoctor._id,
          department: demoDoctor.department || Object.values(createdDepartments)[0],
          hospital: demoDoctor.hospital || Object.values(createdHospitals)[0],
          date: appointmentDate,
          timeSlot: '10:00 - 11:00',
          status: 'completed',
          symptoms: symptomsList[i - 1] || 'General symptoms'
        });
      }

      // Upcoming appointments
      for (let i = 1; i <= 2; i++) {
        const appointmentDate = new Date(today);
        appointmentDate.setDate(today.getDate() + i * 7); // Weekly future appointments

        appointments.push({
          patient: patientUser._id,
          doctor: demoDoctor._id,
          department: demoDoctor.department || Object.values(createdDepartments)[0],
          hospital: demoDoctor.hospital || Object.values(createdHospitals)[0],
          date: appointmentDate,
          timeSlot: `${9 + i}:00 - ${10 + i}:00`,
          status: 'confirmed',
          symptoms: 'Regular follow-up'
        });
      }

      // Create appointments in database
      for (const apt of appointments) {
        await Appointment.create(apt);
      }

      console.log(`  ✓ Created ${appointments.length} sample appointments between ${patientUser.name} and Dr. Demo Doctor`);
    } else {
      console.log('  ⚠ Could not find patient or demo doctor for appointment creation');
    }

    console.log(`\n✅ Seeding complete! ${updatedCount} demo users, ${doctorsCreated} realistic doctors.`);
    console.log('\n📋 Doctor Login Credentials (for testing):');
    console.log('---------------------------------------');
    console.log(`Demo Doctor: ${doctorUser?.email || 'doctor@hms.com'} / demo123`);
    doctorsData.slice(0, 3).forEach(doc => {
      console.log(`${doc.name}: dr.${doc.name.split(' ')[1].toLowerCase()}@hms.com / demo123`);
    });

    console.log('\n📊 Data Summary:');
    console.log(`   Departments: ${Object.keys(createdDepartments).length}`);
    console.log(`   Hospitals: ${Object.keys(createdHospitals).length}`);
    console.log(`   Doctors: ${doctorsCreated + 1} (including demo)`);
    console.log(`   Appointments: ${patientUser && demoDoctor ? 7 : 0} (sample data)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
