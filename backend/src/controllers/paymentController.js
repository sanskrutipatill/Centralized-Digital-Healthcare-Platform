import Razorpay from 'razorpay';
import crypto from 'crypto';
import Appointment from '../models/appointmentModel.js';

// @desc    Create a new payment order
// @route   POST /api/payment/create-order
// @access  Private
export const createOrder = async (req, res, next) => {
    try {
        const { appointmentId } = req.body;
        
        const appointment = await Appointment.findById(appointmentId).populate('doctor', 'consultationFee followUpFee');
        if (!appointment) {
            res.status(404);
            return next(new Error('Appointment not found'));
        }

        if (appointment.status !== 'APPROVED_PENDING_PAYMENT') {
            res.status(400);
            return next(new Error('Appointment is not awaiting payment'));
        }

        // Amount in paise (INR) -> 1 INR = 100 paise
        const amount = appointment.fee ? appointment.fee * 100 : 50000;
        
        let order;
        
        // Only mock if keys are entirely missing
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.log("[Payment] Missing Razorpay Keys. Using Mock Mode.");
            order = {
                id: `order_mock_${Date.now()}`,
                amount: amount,
                currency: 'INR',
                receipt: `receipt_${appointmentId}`,
            };
        } else {
            const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET,
            });

            const options = {
                amount: amount, // amount in paise
                currency: 'INR',
                receipt: `receipt_${appointmentId}`,
            };

            order = await razorpay.orders.create(options);
        }

        // Save amount to appointment just in case
        appointment.amount = amount / 100;
        await appointment.save();

        res.status(200).json({
            success: true,
            order_id: order.id,
            amount: order.amount,
            key: process.env.RAZORPAY_KEY_ID || 'mock_key_id',
            order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify payment signature & update appointment status
// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = async (req, res, next) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            appointmentId
        } = req.body;

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            res.status(404);
            return next(new Error('Appointment not found'));
        }

        let isAuthentic = true;

        if (process.env.RAZORPAY_KEY_SECRET && !razorpay_order_id.startsWith('order_mock_')) {
            // If we have a secret and not mock, compute SHA256 signature to verify
            const body = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest('hex');

            console.log("---- RAZORPAY VERIFICATION LOGS ----");
            console.log("razorpay_order_id:", razorpay_order_id);
            console.log("razorpay_payment_id:", razorpay_payment_id);
            console.log("generated_signature:", expectedSignature);
            console.log("received_signature:", razorpay_signature);
            console.log("------------------------------------");

            if (expectedSignature !== razorpay_signature) {
                isAuthentic = false;
            }
        } else {
            // Mock authentication mode always succeeds (demonstration purposes)
            console.log("[Payment] Fast-tracking Mock Payment Verification");
            isAuthentic = true;
        }

        if (isAuthentic) {
            appointment.paymentStatus = 'SUCCESS';
            appointment.paymentId = razorpay_payment_id;
            appointment.status = 'CONFIRMED';
            
            await appointment.save();

            res.status(200).json({
                success: true,
                message: "Payment verified successfully",
                appointment
            });
        } else {
            appointment.paymentStatus = 'FAILED';
            await appointment.save();

            return res.status(400).json({ message: "Payment verification failed" });
        }
    } catch (error) {
        next(error);
    }
};
