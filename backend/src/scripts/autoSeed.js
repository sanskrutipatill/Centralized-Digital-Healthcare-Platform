import User from '../models/userModel.js';
import Appointment from '../models/appointmentModel.js';

export const autoSeed = async () => {
    try {
        const count = await User.countDocuments();
        if (count > 0) {
            console.log('Database already has users, skipping auto-seed.');
            return;
        }

        console.log('Empty database detected — seeding massive Multi-City doctor network...');

        const demoPatient = {
            name: 'Demo Patient',
            email: 'patient@hms.com',
            password: 'demo123',
            role: 'patient',
            phone: '+91 555-0100',
            gender: 'Male',
            dob: '1990-01-15',
            bloodGroup: 'A+'
        };

        const adminUser = {
            name: 'Admin User',
            email: 'admin@hms.com',
            password: 'demo123',
            role: 'admin',
            phone: '+91 555-0102'
        };

        await User.create(demoPatient);
        await User.create(adminUser);

        const citiesAndHospitals = {
            'Chhatrapati Sambhaji Nagar': ['MGM Hospital', 'Kamalnayan Bajaj Hospital', 'Sigma Hospital', 'United CIIGMA Hospital'],
            'Pune': ['Ruby Hall Clinic', 'Jehangir Hospital', 'Sahyadri Hospital'],
            'Mumbai': ['Lilavati Hospital', 'Kokilaben Hospital', 'Nanavati Hospital']
        };

        const departments = [
            'Cardiology', 'Dermatology', 'Orthopedic', 'Neurology', 'Pediatrics',
            'General Physician', 'Gynecology', 'ENT', 'Psychiatry', 'Radiology'
        ];

        const timeOptions = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '05:00 PM'];

        const getTomorrowDate = (days) => {
            const d = new Date();
            d.setDate(d.getDate() + days);
            return d.toISOString().split('T')[0];
        };

        const generateSlots = () => {
            const slots = [];
            const numSlots = Math.floor(Math.random() * 6) + 5; // 5 to 10 slots
            for (let i = 0; i < numSlots; i++) {
                const dayOffset = Math.floor(Math.random() * 7) + 1; // next 1 to 7 days
                const time = timeOptions[Math.floor(Math.random() * timeOptions.length)];
                const date = getTomorrowDate(dayOffset);
                if (!slots.some(s => s.date === date && s.time === time)) {
                    slots.push({ date, time });
                }
            }
            return slots;
        };

        const firstNamesMale = ['Amit', 'Rahul', 'Imran', 'Rohan', 'Vikram', 'Sanjay', 'Arjun', 'Yash', 'Aditya', 'Karthik', 'Siddharth', 'Rajesh', 'Vishal', 'Mahesh', 'Manoj'];
        const firstNamesFemale = ['Sneha', 'Neha', 'Pooja', 'Priya', 'Riya', 'Anjali', 'Kavita', 'Shreya', 'Divya', 'Meera', 'Nisha', 'Swati', 'Priti', 'Tanvi', 'Radhika'];
        const lastNames = ['Deshmukh', 'Kulkarni', 'Patil', 'Joshi', 'Khan', 'Shah', 'Sharma', 'Verma', 'Singh', 'Kumar', 'Gupta', 'Rao', 'Reddy', 'Mehta', 'Desai'];

        const mandatoryDoctors = [
            { name: 'Dr. Amit Deshmukh', email: 'amit.deshmukh@hms.com' },
            { name: 'Dr. Sneha Kulkarni', email: 'sneha.kulkarni@hms.com' },
            { name: 'Dr. Rahul Patil', email: 'rahul.patil@hms.com' },
            { name: 'Dr. Neha Joshi', email: 'neha.joshi@hms.com' },
            { name: 'Dr. Imran Khan', email: 'imran.khan@hms.com' },
            { name: 'Dr. Pooja Shah', email: 'pooja.shah@hms.com' }
        ];
        
        let generatedEmails = new Set();
        let mandatoryIndex = 0;

        const generateNameAndEmail = () => {
            let n, e;
            do {
                const isMale = Math.random() > 0.5;
                const fName = isMale ? firstNamesMale[Math.floor(Math.random() * firstNamesMale.length)] : firstNamesFemale[Math.floor(Math.random() * firstNamesFemale.length)];
                const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
                n = `Dr. ${fName} ${lName}`;
                e = `${fName.toLowerCase()}.${lName.toLowerCase()}@hms.com`;
            } while (generatedEmails.has(e));
            
            generatedEmails.add(e);
            return { name: n, email: e };
        };

        const doctorsToSeed = [];

        for (const [city, hospitals] of Object.entries(citiesAndHospitals)) {
            for (const department of departments) {
                // 4 doctors per field per city
                for (let i = 1; i <= 4; i++) {
                    const hospital = hospitals[Math.floor(Math.random() * hospitals.length)];
                    
                    let name, email;
                    if (mandatoryIndex < mandatoryDoctors.length) {
                        name = mandatoryDoctors[mandatoryIndex].name;
                        email = mandatoryDoctors[mandatoryIndex].email;
                        generatedEmails.add(email);
                        mandatoryIndex++;
                    } else {
                        const generated = generateNameAndEmail();
                        name = generated.name;
                        email = generated.email;
                    }

                    doctorsToSeed.push({
                        name,
                        email,
                        password: 'demo123',
                        role: 'doctor',
                        city,
                        department,
                        hospital,
                        isVerified: true,
                        specialization: department,
                        consultationFee: Math.floor(Math.random() * 701) + 500, // 500 - 1200
                        followUpFee: Math.floor(Math.random() * 301) + 200,     // 200 - 500
                        availableSlots: generateSlots()
                    });
                }
            }
        }

        // Use create() in chunks so Mongoose fires pre('save') hooks properly
        for (const doctor of doctorsToSeed) {
            await User.create(doctor);
        }

        console.log(`\n✅ Auto-seed complete!`);
        console.log(`   Created 1 Admin, 1 Patient, and ${doctorsToSeed.length} Doctors.`);
        console.log('   Credentials: patient@hms.com / admin@hms.com (password: demo123)');
        console.log('   Doctor Example: amit.deshmukh@hms.com (password: demo123)');
    } catch (err) {
        console.error('Auto-seed error:', err.message);
    }
};
