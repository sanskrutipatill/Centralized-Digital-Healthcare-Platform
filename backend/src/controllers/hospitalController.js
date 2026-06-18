import Hospital from '../models/hospitalModel.js';

// @desc    Get all hospitals (optionally filtered by department)
// @route   GET /api/hospitals
// @access  Public
export const getHospitals = async (req, res, next) => {
    try {
        const { departmentId } = req.query;
        let query = { isActive: true };

        if (departmentId) {
            // Find hospitals that have the specified department
            query.departments = departmentId;
        }

        const hospitals = await Hospital.find(query)
            .populate('departments', 'name')
            .select('-__v');

        res.json(hospitals);
    } catch (error) {
        next(error);
    }
};

// @desc    Get hospital by ID
// @route   GET /api/hospitals/:id
// @access  Public
export const getHospitalById = async (req, res, next) => {
    try {
        const hospital = await Hospital.findById(req.params.id)
            .populate('departments', 'name')
            .select('-__v');

        if (hospital) {
            res.json(hospital);
        } else {
            res.status(404);
            return next(new Error('Hospital not found'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Create a hospital
// @route   POST /api/hospitals
// @access  Private/Admin
export const createHospital = async (req, res, next) => {
    try {
        const {
            name,
            address,
            contact,
            departments,
            facilities
        } = req.body;

        const hospital = new Hospital({
            name,
            address,
            contact,
            departments,
            facilities,
            isActive: true
        });

        const createdHospital = await hospital.save();
        res.status(201).json(createdHospital);
    } catch (error) {
        next(error);
    }
};

// @desc    Update hospital
// @route   PATCH /api/hospitals/:id
// @access  Private/Admin
export const updateHospital = async (req, res, next) => {
    try {
        const hospital = await Hospital.findById(req.params.id);

        if (hospital) {
            const {
                name,
                address,
                contact,
                departments,
                facilities,
                rating,
                isActive
            } = req.body;

            hospital.name = name || hospital.name;
            hospital.address = address || hospital.address;
            hospital.contact = contact || hospital.contact;
            hospital.departments = departments || hospital.departments;
            hospital.facilities = facilities || hospital.facilities;
            if (rating) hospital.rating = rating;
            if (typeof isActive !== 'undefined') hospital.isActive = isActive;

            const updatedHospital = await hospital.save();
            res.json(updatedHospital);
        } else {
            res.status(404);
            return next(new Error('Hospital not found'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Delete hospital (soft delete)
// @route   DELETE /api/hospitals/:id
// @access  Private/Admin
export const deleteHospital = async (req, res, next) => {
    try {
        const hospital = await Hospital.findById(req.params.id);

        if (hospital) {
            hospital.isActive = false;
            await hospital.save();
            res.json({ message: 'Hospital removed' });
        } else {
            res.status(404);
            return next(new Error('Hospital not found'));
        }
    } catch (error) {
        next(error);
    }
};
