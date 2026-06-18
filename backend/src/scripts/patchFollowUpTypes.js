import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Appointment from '../models/appointmentModel.js';
import User from '../models/userModel.js'; // Ensure the User model is imported so schemas are registered

dotenv.config();

const patchFollowUpTypes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Follow-Up Logic Patching');

        // Fetch all appointments, explicitly populating doctor so we can pull fee data.
        const appointments = await Appointment.find({}).sort({ date: 1 }).populate('doctor');

        // Group appointments directly by patient+doctor combo
        const grouped = {};
        
        appointments.forEach(appt => {
            // Some legacy data might lack patient/doctor cleanly
            if(!appt.patient || !appt.doctor) return;

            const key = `${appt.patient.toString()}_${appt.doctor._id.toString()}`;
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(appt);
        });

        let patchedCount = 0;

        for (const [key, appts] of Object.entries(grouped)) {
            // Because our query already had sort({ date: 1 }), this array is chronologically sorted!
            let hasFirstVisit = false;

            for (let appt of appts) {
                // If it's cancelled/rejected, leave its type as is but do NOT count it as our "official" first valid visit.
                if (appt.status === 'CANCELLED' || appt.status === 'REJECTED') {
                    // Do nothing for hasFirstVisit toggle
                } else {
                    if (!hasFirstVisit) {
                        // This is the earliest valid visit
                        appt.type = 'FIRST_VISIT';
                        appt.amount = appt.doctor.consultationFee || 500;
                        hasFirstVisit = true;
                    } else {
                        // Follow-up!
                        appt.type = 'FOLLOW_UP';
                        appt.amount = appt.doctor.followUpFee || 200;
                    }
                    await appt.save();
                    patchedCount++;
                }
            }
        }

        console.log(`Successfully validated and patched ${patchedCount} appointments against the chronological Follow-Up logic.`);
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

patchFollowUpTypes();
