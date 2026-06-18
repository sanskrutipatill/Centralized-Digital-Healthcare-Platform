import mongoose from 'mongoose';

const departmentSchema = mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    head: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

const Department = mongoose.model('Department', departmentSchema);
export default Department;
