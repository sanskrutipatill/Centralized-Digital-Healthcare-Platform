import express from 'express';
import { getDepartments, createDepartment, getDepartmentsByHospital } from '../controllers/departmentController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getDepartments)
    .post(protect, authorize('admin'), createDepartment);

// Get departments for a specific hospital
router.get('/hospital/:hospitalId', getDepartmentsByHospital);

export default router;
