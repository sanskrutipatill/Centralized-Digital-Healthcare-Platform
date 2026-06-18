import express from 'express';
import { createDoctor, getDoctorById, getDoctorAppointments, updateAvailability, verifyDoctor, getDoctorPatients, deletePatient, updateDoctorProfile, updateDoctorAffiliation } from '../controllers/doctorController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Admin routes
router.post('/', protect, authorize('admin'), createDoctor);
router.put('/:id/verify', protect, authorize('admin'), verifyDoctor);

// Doctor's own routes (authenticated)
router.get('/appointments', protect, authorize('doctor'), getDoctorAppointments);
router.get('/patients', protect, authorize('doctor'), getDoctorPatients);
router.delete('/patient/:id', protect, authorize('doctor'), deletePatient);
router.put('/profile', protect, authorize('doctor'), updateDoctorProfile);
router.put('/affiliation', protect, authorize('doctor'), updateDoctorAffiliation);
router.put('/availability', protect, authorize('doctor'), updateAvailability);

// Public routes
router.get('/:id', getDoctorById);

export default router;
