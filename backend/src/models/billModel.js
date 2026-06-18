import mongoose from 'mongoose';

const billSchema = mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String },
    issuedDate: { type: Date, default: Date.now },
    paidDate: { type: Date }
}, {
    timestamps: true
});

const Bill = mongoose.model('Bill', billSchema);
export default Bill;
