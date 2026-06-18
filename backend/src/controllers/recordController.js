import MedicalRecord from '../models/recordModel.js';

// @desc    Create medical record
// @route   POST /api/records
// @access  Private (Doctor)
export const createRecord = async (req, res, next) => {
    try {
        const { patient, appointment, date, diagnosis, prescriptions, symptoms, notes } = req.body;
        // uploaded files from multer
        const reports = req.files ? req.files.map(file => `/${file.path.replace(/\\/g, '/')}`) : [];

        const record = new MedicalRecord({
            patient,
            doctor: req.user._id,
            appointment,
            date,
            symptoms,
            diagnosis,
            notes,
            prescriptions: typeof prescriptions === 'string' ? JSON.parse(prescriptions) : prescriptions,
            reports
        });

        const createdRecord = await record.save();
        res.status(201).json(createdRecord);
    } catch (error) {
        next(error);
    }
};

// @desc    Get patient records
// @route   GET /api/records/patient/:id
// @access  Private (Self/Doctor/Admin)
export const getPatientRecords = async (req, res, next) => {
    try {
        if (req.user.role === 'patient' && req.user._id.toString() !== req.params.id) {
            res.status(403);
            return next(new Error('Not authorized to view these records'));
        }

        const records = await MedicalRecord.find({ patient: req.params.id })
            .populate('doctor', 'name department')
            .populate({ path: 'doctor', populate: { path: 'department', select: 'name' } });

        res.json(records);
    } catch (error) {
        next(error);
    }
};
