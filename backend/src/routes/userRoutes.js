import express from 'express';
import { getUsers, getUserById, getDoctors, updateUser } from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Specific routes first
router.get('/doctors', getDoctors); // Public access to see doctors (with optional filters)

// Admin routes
router.get('/', protect, authorize('admin'), getUsers);

// Dynamic routes later
router.route('/:id')
    .get(protect, getUserById)
    .patch(protect, updateUser);

export default router;
