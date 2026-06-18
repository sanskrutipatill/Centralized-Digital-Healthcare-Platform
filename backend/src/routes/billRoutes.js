import express from 'express';
import { createBill, getBills } from '../controllers/billController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getBills)
    .post(protect, authorize('admin'), createBill);

export default router;
