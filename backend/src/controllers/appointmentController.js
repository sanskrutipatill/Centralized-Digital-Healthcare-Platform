import Appointment from '../models/appointmentModel.js';
import User from '../models/userModel.js';

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private (Patient/Admin)
export const createAppointment = async (req, res, next) => {
    try {
        const { doctor, department, hospital, date, timeSlot, symptoms } = req.body;

        const doctorUser = await User.findById(doctor);
        if (!doctorUser) {
            res.status(404);
            return next(new Error('Doctor not found'));
        }

        const priorAppointment = await Appointment.findOne({
            patient: req.user._id,
            doctor,
            status: { $nin: ['CANCELLED', 'REJECTED'] }
        });

        const type = priorAppointment ? 'FOLLOW_UP' : 'FIRST_VISIT';
        const amount = type === 'FOLLOW_UP' ? (doctorUser.followUpFee || doctorUser.consultationFee) : doctorUser.consultationFee;

        // Debugging Step
        console.log("Final Amount:", amount);

        const appointment = new Appointment({
            patient: req.user._id,
            doctor,
            department,
            hospital,
            date,
            timeSlot,
            symptoms,
            type,
            amount
        });

        const createdAppointment = await appointment.save();
        res.status(201).json(createdAppointment);
    } catch (error) {
        next(error);
    }
};

// @desc    Get available time slots for a doctor on a specific date
// @route   GET /api/appointments/available-slots?doctorId=&date=
// @access  Public
export const getAvailableSlots = async (req, res, next) => {
    try {
        const { doctorId, date } = req.query;

        if (!doctorId || !date) {
            res.status(400);
            return next(new Error('Doctor ID and date are required'));
        }

        // Find the doctor
        const doctor = await User.findById(doctorId).select('availableSlots availability');
        if (!doctor) {
            res.status(404);
            return next(new Error('Doctor not found'));
        }

        // Get slots matching the date
        const daySlots = doctor.availableSlots 
            ? doctor.availableSlots.filter(s => s.date === date).map(s => s.time)
            : [];

        // Get all existing appointments for this doctor on this date that are actually blocking time
        const existingAppointments = await Appointment.find({
            doctor: doctorId,
            date: new Date(date),
            status: { $in: ['APPROVED_PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED', 'PENDING'] }
        }).select('timeSlot');

        const bookedSlots = existingAppointments.map(apt => apt.timeSlot);

        // Filter out booked slots
        const availableSlots = daySlots.filter(slot => !bookedSlots.includes(slot));

        res.json(availableSlots);
    } catch (error) {
        next(error);
    }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointmentById = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patient', 'name email phone dob gender bloodGroup')
            .populate('doctor', 'name specialization experience consultationFee followUpFee city department hospital');

        if (appointment) {
            // Check authorization: only admin, the attending doctor, or the patient can access
            if (req.user.role === 'patient' && appointment.patient._id.toString() !== req.user._id.toString()) {
                res.status(403);
                return next(new Error('Not authorized to view this appointment'));
            }
            if (req.user.role === 'doctor' && appointment.doctor._id.toString() !== req.user._id.toString()) {
                res.status(403);
                return next(new Error('Not authorized to view this appointment'));
            }
            res.json(appointment);
        } else {
            res.status(404);
            return next(new Error('Appointment not found'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get all appointments (Admin) or Patient's own or Doctor's own
// @access  Private
export const getAppointments = async (req, res, next) => {
    try {
        let appointments;
        if (req.user.role === 'admin') {
            appointments = await Appointment.find({})
                .populate('patient', 'name email phone dob gender bloodGroup')
                .populate('doctor', 'name specialization experience consultationFee');
        } else if (req.user.role === 'doctor') {
            appointments = await Appointment.find({ doctor: req.user._id })
                .populate('patient', 'name email phone dob gender bloodGroup');
        } else {
            // Patient
            appointments = await Appointment.find({ patient: req.user._id })
                .populate('doctor', 'name specialization experience consultationFee followUpFee city department hospital');
        }
        res.json(appointments);
    } catch (error) {
        next(error);
    }
};

// @desc    Cancel appointment (soft delete - update status to cancelled)
// @route   DELETE /api/appointments/:id
// @access  Private (Patient/Admin) - Patient can cancel own appointments only
export const cancelAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (appointment) {
            // Check authorization: patient can only cancel their own appointments
            if (req.user.role === 'patient' && appointment.patient.toString() !== req.user._id.toString()) {
                res.status(403);
                return next(new Error('Not authorized to cancel this appointment'));
            }

            // Check if appointment is already cancelled or completed
            if (appointment.status === 'CANCELLED') {
                res.status(400);
                return next(new Error('Appointment is already cancelled'));
            }

            if (appointment.status === 'COMPLETED') {
                res.status(400);
                return next(new Error('Cannot cancel a completed appointment'));
            }

            appointment.status = 'CANCELLED';
            const updatedAppointment = await appointment.save();
            res.json(updatedAppointment);
        } else {
            res.status(404);
            return next(new Error('Appointment not found'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update appointment status
// @route   PATCH /api/appointments/:id/status
// @access  Private (Doctor/Admin)
export const updateAppointmentStatus = async (req, res, next) => {
    try {
        const { status, meetingLink } = req.body;
        const appointment = await Appointment.findById(req.params.id);

        if (appointment) {
            if (req.user.role === 'patient') {
                res.status(403);
                return next(new Error('Patients cannot update status'));
            }

            appointment.status = status || appointment.status;
            appointment.meetingLink = meetingLink || appointment.meetingLink;

            const updatedAppointment = await appointment.save();
            res.json(updatedAppointment);
        } else {
            res.status(404);
            return next(new Error('Appointment not found'));
        }
    } catch (error) {
        next(error);
    }
};
// @desc    Approve an appointment (Doctor/Admin)
// @route   PATCH /api/appointments/:id/approve
// @access  Private
export const approveAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            res.status(404);
            return next(new Error('Appointment not found'));
        }

        if (appointment.status !== 'PENDING') {
            res.status(400);
            return next(new Error('Only pending appointments can be approved'));
        }

        // Atomic check: Ensure slot is not already taken
        const existingApproved = await Appointment.findOne({
            doctor: appointment.doctor,
            date: appointment.date,
            timeSlot: appointment.timeSlot,
            status: { $in: ['APPROVED_PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED'] }
        });

        if (existingApproved) {
            res.status(400);
            return next(new Error('This time slot has already been booked and approved for another patient.'));
        }

        appointment.status = 'APPROVED_PENDING_PAYMENT';
        const updatedAppointment = await appointment.save();
        
        res.json(updatedAppointment);
    } catch (error) {
        next(error);
    }
};

// @desc    Reject an appointment (Doctor/Admin)
// @route   PATCH /api/appointments/:id/reject
// @access  Private
export const rejectAppointment = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            res.status(404);
            return next(new Error('Appointment not found'));
        }

        if (appointment.status !== 'PENDING') {
            res.status(400);
            return next(new Error('Only pending appointments can be rejected'));
        }

        appointment.status = 'REJECTED';
        const updatedAppointment = await appointment.save();
        
        res.json(updatedAppointment);
    } catch (error) {
        next(error);
    }
};

// @desc    Simulate Demo Payment
// @route   PATCH /api/appointments/:id/demo-pay
// @access  Private
export const demoPay = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            res.status(404);
            return next(new Error('Appointment not found'));
        }

        if (appointment.status !== 'APPROVED_PENDING_PAYMENT') {
            res.status(400);
            return next(new Error('Cannot pay for an appointment not awaiting payment'));
        }

        appointment.paymentStatus = 'SUCCESS';
        appointment.status = 'CONFIRMED';
        appointment.paymentId = 'DEMO_' + Date.now();

        const updatedAppointment = await appointment.save();
        res.json(updatedAppointment);
    } catch (error) {
        next(error);
    }
};
