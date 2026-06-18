import mongoose from 'mongoose';

const appointmentSchema = mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    department: { type: String, required: true },
    hospital: { type: String },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'APPROVED_PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED'], default: 'PENDING' },
    type: { type: String, enum: ['FIRST_VISIT', 'FOLLOW_UP'] },
    fee: { type: Number },
    symptoms: { type: String },
    meetingLink: { type: String },
    paymentStatus: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
    paymentId: { type: String },
    amount: { type: Number }
}, {
    timestamps: true
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
