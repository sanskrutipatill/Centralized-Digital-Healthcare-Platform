import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/userModel.js';
import Appointment from '../models/appointmentModel.js';
import { autoSeed } from './autoSeed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const resetDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/harmony_health');
        console.log('Connected to Database... dropping Users, Appointments.');

        await User.deleteMany({});
        await Appointment.deleteMany({});
        console.log('Collections dropped successfully.');

        // Rerun the auto-seeder to populate doctors and admins.
        await autoSeed();
        process.exit(0);
    } catch (error) {
        console.error('Reset failed:', error);
        process.exit(1);
    }
};

resetDatabase();
