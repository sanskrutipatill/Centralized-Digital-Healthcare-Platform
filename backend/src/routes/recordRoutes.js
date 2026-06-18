import express from 'express';
import { createRecord, getPatientRecords } from '../controllers/recordController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, authorize('doctor'), upload.array('reports', 5), createRecord);

router.route('/patient/:id')
    .get(protect, getPatientRecords);

export default router;
