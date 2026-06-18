import User from '../models/userModel.js';

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        next(error);
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404);
            return next(new Error('User not found'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get all doctors (with optional filters) - only verified doctors for patients
// @route   GET /api/users/doctors?departmentId=&hospitalId=
// @access  Public
export const getDoctors = async (req, res, next) => {
    try {
        const { departmentId, hospitalId } = req.query;
        let query = { role: 'doctor', isVerified: true };

        if (departmentId) {
            query.department = departmentId;
        }
        if (hospitalId) {
            query.hospital = hospitalId;
        }

        const doctors = await User.find(query)
            .select('-password');

        res.json(doctors);
    } catch (error) {
        next(error);
    }
};

// @desc    Get doctor dashboard appointments
// @route   GET /api/doctor/appointments?status=
// @access  Private (Doctor only)
export const getDoctorAppointments = async (req, res, next) => {
    try {
        if (req.user.role !== 'doctor') {
            res.status(403);
            return next(new Error('Only doctors can access this route'));
        }

        const { status } = req.query;
        let query = { doctor: req.user._id };

        if (status) {
            query.status = status;
        }

        const appointments = await Appointment.find(query)
            .populate('patient', 'name email phone')
            .populate('department', 'name')
            .sort({ date: 1, timeSlot: 1 });

        res.json(appointments);
    } catch (error) {
        next(error);
    }
};

// @desc    Update doctor availability
// @route   PUT /api/doctors/availability
// @access  Private (Doctor only)
export const updateAvailability = async (req, res, next) => {
    try {
        if (req.user.role !== 'doctor') {
            res.status(403);
            return next(new Error('Only doctors can update availability'));
        }

        const { availability } = req.body;

        if (!Array.isArray(availability)) {
            res.status(400);
            return next(new Error('Availability must be an array'));
        }

        // Validate availability structure
        for (const slot of availability) {
            if (!slot.day || !slot.startTime || !slot.endTime) {
                res.status(400);
                return next(new Error('Each availability slot must have day, startTime, and endTime'));
            }

            // Validate time format (HH:MM)
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
                res.status(400);
                return next(new Error('Time must be in 24-hour format (HH:MM)'));
            }

            // Validate that startTime is before endTime
            if (slot.startTime >= slot.endTime) {
                res.status(400);
                return next(new Error('Start time must be before end time'));
            }
        }

        const doctor = await User.findById(req.user._id);
        doctor.availability = availability;
        await doctor.save();

        res.json(doctor);
    } catch (error) {
        next(error);
    }
};

// @desc    Get doctor profile (public)
// @route   GET /api/doctors/:id
// @access  Public
export const getDoctorById = async (req, res, next) => {
    try {
        const doctor = await User.findById(req.params.id)
            .select('-password');

        if (!doctor || doctor.role !== 'doctor' || !doctor.isVerified) {
            res.status(404);
            return next(new Error('Doctor not found or not verified'));
        }

        res.json(doctor);
    } catch (error) {
        next(error);
    }
};

// @desc    Update user
// @route   PATCH /api/users/:id
// @access  Private
export const updateUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Only admin or the user themselves can update
            if (req.user.role !== 'admin' && req.user._id.toString() !== user._id.toString()) {
                 res.status(403);
                 return next(new Error('Not authorized to update this user'));
            }

            user.name = req.body.name || user.name;
            user.phone = req.body.phone || user.phone;
            user.address = req.body.address || user.address;
            user.avatar = req.body.avatar || user.avatar;

            // Doctor specifics
            if (user.role === 'doctor') {
                user.department = req.body.department || user.department;
                user.specialization = req.body.specialization || user.specialization;
                user.qualifications = req.body.qualifications || user.qualifications;
                user.experience = req.body.experience !== undefined ? req.body.experience : user.experience;
                user.consultationFee = req.body.consultationFee !== undefined ? req.body.consultationFee : user.consultationFee;
                user.availability = req.body.availability || user.availability;
                // Doctors cannot update isVerified or registrationNumber (admin only)
            }

            // Patient specifics
            if (user.role === 'patient') {
                user.bloodGroup = req.body.bloodGroup || user.bloodGroup;
                
                if (req.body.dob !== undefined) {
                    if (req.body.dob === '') {
                        user.dob = undefined;
                    } else {
                        const dobDate = new Date(req.body.dob);
                        if (isNaN(dobDate.getTime())) {
                            res.status(400);
                            return next(new Error('Invalid date of birth format'));
                        }
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        if (dobDate > today) {
                            res.status(400);
                            return next(new Error('Date of birth cannot be in the future'));
                        }
                        const minDate = new Date();
                        minDate.setFullYear(today.getFullYear() - 120);
                        if (dobDate < minDate) {
                            res.status(400);
                            return next(new Error('Date of birth cannot be more than 120 years ago'));
                        }
                        user.dob = req.body.dob;
                    }
                }
                user.gender = req.body.gender || user.gender;
            }

            const updatedUser = await user.save();
            
            // Remove password from response
            const responseUser = updatedUser.toObject();
            delete responseUser.password;
            
            res.json(responseUser);
        } else {
            res.status(404);
            return next(new Error('User not found'));
        }
    } catch (error) {
        next(error);
    }
};
