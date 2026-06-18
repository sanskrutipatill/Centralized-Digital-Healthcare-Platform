import express from 'express';
import { createAppointment, getAppointments, getAppointmentById, updateAppointmentStatus, getAvailableSlots, cancelAppointment, approveAppointment, rejectAppointment, demoPay } from '../controllers/appointmentController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getAppointments)
    .post(protect, authorize('patient', 'admin'), createAppointment);

// Must be declared before /:id to avoid being matched as a parameter
router.get('/available-slots', getAvailableSlots);

router.route('/:id')
    .get(protect, getAppointmentById)
    .delete(protect, cancelAppointment);

router.route('/:id/status')
    .patch(protect, authorize('doctor', 'admin'), updateAppointmentStatus);

router.route('/:id/approve')
    .patch(protect, authorize('doctor', 'admin'), approveAppointment);

router.route('/:id/reject')
    .patch(protect, authorize('doctor', 'admin'), rejectAppointment);

router.route('/:id/demo-pay')
    .patch(protect, authorize('patient', 'admin'), demoPay);

export default router;
