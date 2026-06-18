import mongoose from 'mongoose';

const recordSchema = mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    date: { type: Date, required: true },
    symptoms: { type: String },
    diagnosis: { type: String, required: true },
    notes: { type: String },
    prescriptions: [{
        medicine: String,
        dosage: String,
        duration: String
    }],
    reports: [{ type: String }] // URLs/paths for uploaded files
}, {
    timestamps: true
});

const MedicalRecord = mongoose.model('MedicalRecord', recordSchema);
export default MedicalRecord;
