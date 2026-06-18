import Bill from '../models/billModel.js';

// @desc    Create a bill
// @route   POST /api/bills
// @access  Private/Admin
export const createBill = async (req, res, next) => {
    try {
        const { patient, appointment, amount, tax, paymentMethod } = req.body;
        
        const total = Number(amount) + Number(tax || 0);
        
        const bill = new Bill({
            patient,
            appointment,
            amount,
            tax,
            total,
            paymentMethod
        });

        const createdBill = await bill.save();
        res.status(201).json(createdBill);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all bills (Admin) or Patient's own bills
// @route   GET /api/bills
// @access  Private
export const getBills = async (req, res, next) => {
    try {
        let bills;
        if (req.user.role === 'admin') {
            bills = await Bill.find({}).populate('patient', 'name').populate('appointment');
        } else {
            bills = await Bill.find({ patient: req.user._id }).populate('appointment');
        }
        res.json(bills);
    } catch (error) {
        next(error);
    }
};
