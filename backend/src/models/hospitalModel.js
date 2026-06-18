import mongoose from 'mongoose';

const hospitalSchema = mongoose.Schema({
    name: { type: String, required: true },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true, default: 'USA' },
        zipCode: { type: String, required: true }
    },
    contact: {
        phone: { type: String, required: true },
        email: { type: String },
        emergencyNumber: { type: String }
    },
    departments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    }],
    facilities: [{
        type: String
    }],
    rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 }
    },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

const Hospital = mongoose.model('Hospital', hospitalSchema);
export default Hospital;
