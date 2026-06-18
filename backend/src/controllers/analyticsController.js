import User from '../models/userModel.js';
import Appointment from '../models/appointmentModel.js';
import Bill from '../models/billModel.js';

// @desc    Get dashboard analytics
// @route   GET /api/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res, next) => {
    try {
        const patientCount = await User.countDocuments({ role: 'patient' });
        const doctorCount = await User.countDocuments({ role: 'doctor' });
        
        const appointmentCount = await Appointment.countDocuments();
        
        const bills = await Bill.find({ status: 'paid' });
        const revenue = bills.reduce((acc, bill) => acc + bill.total, 0);

        res.json({
            patientCount,
            doctorCount,
            appointmentCount,
            revenue
        });
    } catch (error) {
        next(error);
    }
};
