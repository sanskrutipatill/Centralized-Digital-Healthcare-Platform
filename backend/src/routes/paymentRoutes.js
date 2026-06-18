import express from 'express';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/create-order').post(protect, createOrder);
router.route('/verify').post(protect, verifyPayment);

export default router;
