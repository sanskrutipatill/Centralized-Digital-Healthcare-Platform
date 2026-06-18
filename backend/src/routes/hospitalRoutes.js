import express from 'express';
import {
    getHospitals,
    getHospitalById,
    createHospital,
    updateHospital,
    deleteHospital
} from '../controllers/hospitalController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getHospitals)
    .post(protect, authorize('admin'), createHospital);

router.route('/:id')
    .get(getHospitalById)
    .patch(protect, authorize('admin'), updateHospital)
    .delete(protect, authorize('admin'), deleteHospital);

export default router;
