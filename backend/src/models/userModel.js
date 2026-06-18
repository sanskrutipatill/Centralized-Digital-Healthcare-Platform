import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
    phone: { type: String },
    address: { type: String },
    avatar: { type: String, default: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg' },

    // Doctor specific
    city: { type: String },
    department: { type: String },
    hospital: { type: String },
    specialization: { type: String }, // For UI display, derived from department
    qualifications: [{ type: String, required: false }],
    experience: { type: Number, min: 0 },
    registrationNumber: { type: String, unique: true, sparse: true },
    isVerified: { type: Boolean, default: false },
    consultationFee: { type: Number, min: 0 },
    followUpFee: { type: Number, min: 0 },
    availability: [{
        day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true },
        startTime: { type: String, required: true }, // Format: "HH:MM" (24-hour)
        endTime: { type: String, required: true }    // Format: "HH:MM" (24-hour)
    }],
    availableSlots: [{
        date: { type: String },
        time: { type: String }
    }],

    // Patient specific
    bloodGroup: { type: String },
    dob: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Dynamic age virtual calculation
userSchema.virtual('age').get(function () {
    if (!this.dob) return null;
    const birthDate = new Date(this.dob);
    if (isNaN(birthDate.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age >= 0 ? age : 0;
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;
