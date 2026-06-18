import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Appointment from '../models/appointmentModel.js';
import User from '../models/userModel.js';

dotenv.config();

const patchAppointments = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Patching');

        const appointments = await Appointment.find({}).populate('doctor');
        let patchedCount = 0;

        for (let appt of appointments) {
            // Unify fee into amount
            if (appt.fee && !appt.amount) {
                appt.amount = appt.fee;
            } else if (!appt.fee && !appt.amount && appt.doctor) {
                appt.amount = appt.type === 'FOLLOW_UP' ? (appt.doctor.followUpFee || 200) : (appt.doctor.consultationFee || 500);
            }
            
            // Check type
            if (!appt.type) {
                appt.type = 'FIRST_VISIT';
            }

            // Fix legacy invalid statuses
            if (appt.status === 'APPROVED') {
                appt.status = 'APPROVED_PENDING_PAYMENT';
            }

            await appt.save();
            patchedCount++;
        }

        console.log(`Successfully patched ${patchedCount} historical appointments with correct amount logic.`);
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

patchAppointments();
