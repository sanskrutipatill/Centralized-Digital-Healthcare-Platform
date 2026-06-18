import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import Appointment from '../models/appointmentModel.js';

// @desc    Create new doctor (Admin only)
// @route   POST /api/doctors
// @access  Private (Admin only)
export const createDoctor = async (req, res, next) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            department,
            hospital,
            specialization,
            qualifications,
            experience,
            registrationNumber,
            consultationFee,
            followUpFee,
            availability,
            city,
            availableSlots
        } = req.body;

        // Check if doctor with email already exists
        const existingDoctor = await User.findOne({ email });
        if (existingDoctor) {
            res.status(400);
            return next(new Error('Doctor with this email already exists'));
        }

        // Check if registration number is unique (if provided)
        if (registrationNumber) {
            const existingReg = await User.findOne({ registrationNumber });
            if (existingReg) {
                res.status(400);
                return next(new Error('Registration number already exists'));
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const doctor = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'doctor',
            phone,
            department,
            hospital,
            specialization,
            qualifications: qualifications || [],
            experience,
            registrationNumber,
            consultationFee,
            followUpFee,
            availability: availability || [],
            city,
            availableSlots: availableSlots || [],
            isVerified: false // Admin must verify
        });

        // Remove password from response
        const responseDoctor = doctor.toObject();
        delete responseDoctor.password;

        res.status(201).json({
            success: true,
            message: 'Doctor created successfully. Verification required.',
            doctor: responseDoctor
        });
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
            .populate('patient', 'name email phone dob bloodGroup')
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

            // Validate that day is valid
            const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            if (!validDays.includes(slot.day)) {
                res.status(400);
                return next(new Error(`Invalid day: ${slot.day}. Must be one of: ${validDays.join(', ')}`));
            }

            // Validate time format (HH:MM in 24-hour format)
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

        res.json({
            success: true,
            message: 'Availability updated successfully',
            availability: doctor.availability
        });
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

// @desc    Verify doctor (admin only)
// @route   PUT /api/doctors/:id/verify
// @access  Private (Admin only)
export const verifyDoctor = async (req, res, next) => {
    try {
        const doctor = await User.findById(req.params.id);

        if (!doctor || doctor.role !== 'doctor') {
            res.status(404);
            return next(new Error('Doctor not found'));
        }

        doctor.isVerified = true;
        await doctor.save();

        res.json({
            success: true,
            message: 'Doctor verified successfully',
            doctor: doctor._id
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get patients assigned to the logged-in doctor (distinct patients from appointments)
// @route   GET /api/doctors/patients
// @access  Private (Doctor only)
export const getDoctorPatients = async (req, res, next) => {
    try {
        if (req.user.role !== 'doctor') {
            res.status(403);
            return next(new Error('Only doctors can access this route'));
        }

        // Find all appointments for this doctor
        const appointments = await Appointment.find({ doctor: req.user._id })
            .populate('patient', 'name email phone dob gender bloodGroup')
            .sort({ date: -1 });

        // Create a Map to get unique patients (by patientId) with the most recent visit
        const patientsMap = new Map();

        appointments.forEach(appointment => {
            if (appointment.patient && appointment.patient._id) {
                const patientId = appointment.patient._id.toString();
                const existing = patientsMap.get(patientId);

                const appointmentDate = new Date(appointment.date);

                if (!existing || appointmentDate > new Date(existing.lastVisit)) {
                    patientsMap.set(patientId, {
                        _id: appointment.patient._id,
                        name: appointment.patient.name,
                        email: appointment.patient.email || 'N/A',
                        phone: appointment.patient.phone || 'N/A',
                        dob: appointment.patient.dob,
                        age: appointment.patient.age,
                        gender: appointment.patient.gender || 'Unknown',
                        bloodGroup: appointment.patient.bloodGroup || '-',
                        lastVisit: appointment.date,
                        condition: appointment.symptoms || 'General',
                        totalVisits: existing ? existing.totalVisits + 1 : 1
                    });
                } else {
                    // Increment visit count
                    existing.totalVisits++;
                }
            }
        });

        const patients = Array.from(patientsMap.values());

        res.json(patients);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a patient from doctor's list (delete all appointments with this patient for this doctor)
// @route   DELETE /api/doctors/patient/:id
// @access  Private (Doctor only)
export const deletePatient = async (req, res, next) => {
    try {
        if (req.user.role !== 'doctor') {
            res.status(403);
            return next(new Error('Only doctors can access this route'));
        }

        const { id: patientId } = req.params;

        // Verify patient exists and has appointments with this doctor
        const appointments = await Appointment.find({
            doctor: req.user._id,
            patient: patientId
        });

        if (appointments.length === 0) {
            res.status(404);
            return next(new Error('Patient not found in your appointments'));
        }

        // Delete all appointments between this doctor and this patient
        const deleteResult = await Appointment.deleteMany({
            doctor: req.user._id,
            patient: patientId
        });

        res.json({
            success: true,
            message: `Patient removed from your list. ${deleteResult.deletedCount} appointment(s) deleted.`
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update doctor's own profile
// @route   PUT /api/doctors/profile
// @access  Private (Doctor only)
export const updateDoctorProfile = async (req, res, next) => {
    try {
        if (req.user.role !== 'doctor') {
            res.status(403);
            return next(new Error('Only doctors can access this route'));
        }

        const {
            name,
            phone,
            specialization,
            experience,
            consultationFee,
            followUpFee,
            qualifications
        } = req.body;

        // Find doctor
        const doctor = await User.findById(req.user._id);

        if (!doctor || doctor.role !== 'doctor') {
            res.status(404);
            return next(new Error('Doctor not found'));
        }

        // Update fields
        if (name) doctor.name = name;
        if (phone) doctor.phone = phone;
        if (specialization) doctor.specialization = specialization;
        if (experience !== undefined) doctor.experience = experience;
        if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
        if (followUpFee !== undefined) doctor.followUpFee = followUpFee;
        if (qualifications) doctor.qualifications = qualifications;

        await doctor.save();

        // Return doctor without password
        const responseDoctor = doctor.toObject();
        delete responseDoctor.password;

        res.json({
            success: true,
            message: 'Profile updated successfully',
            doctor: responseDoctor
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update doctor's affiliation (hospital and department)
// @route   PUT /api/doctors/affiliation
// @access  Private (Doctor only)
export const updateDoctorAffiliation = async (req, res, next) => {
    try {
        if (req.user.role !== 'doctor') {
            res.status(403);
            return next(new Error('Only doctors can access this route'));
        }

        const { hospital, department, city, registrationNumber } = req.body;

        // Find doctor
        const doctor = await User.findById(req.user._id);

        if (!doctor || doctor.role !== 'doctor') {
            res.status(404);
            return next(new Error('Doctor not found'));
        }

        // Update fields
        if (hospital !== undefined) doctor.hospital = hospital;
        if (department !== undefined) doctor.department = department;
        if (city !== undefined) doctor.city = city;
        if (registrationNumber !== undefined) doctor.registrationNumber = registrationNumber;

        await doctor.save();

        // Return doctor without password
        const responseDoctor = doctor.toObject();
        delete responseDoctor.password;

        res.json({
            success: true,
            message: 'Affiliation updated successfully',
            doctor: responseDoctor
        });
    } catch (error) {
        next(error);
    }
};

