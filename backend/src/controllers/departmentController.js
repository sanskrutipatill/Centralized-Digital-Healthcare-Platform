import Department from '../models/departmentModel.js';
import Hospital from '../models/hospitalModel.js';

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
export const getDepartments = async (req, res, next) => {
    try {
        const departments = await Department.find({}).populate('head', 'name email');
        res.json(departments);
    } catch (error) {
        next(error);
    }
};

// @desc    Get departments for a specific hospital
// @route   GET /api/departments/hospital/:hospitalId
// @access  Public
export const getDepartmentsByHospital = async (req, res, next) => {
    try {
        const { hospitalId } = req.params;

        // Find the hospital and populate its departments
        const hospital = await Hospital.findById(hospitalId)
            .populate('departments', 'name description head')
            .populate('head', 'name email');

        if (!hospital) {
            res.status(404);
            return next(new Error('Hospital not found'));
        }

        res.json(hospital.departments);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a department
// @route   POST /api/departments
// @access  Private/Admin
export const createDepartment = async (req, res, next) => {
    try {
        const { name, description, head } = req.body;
        const department = new Department({ name, description, head });
        const createdDepartment = await department.save();
        res.status(201).json(createdDepartment);
    } catch (error) {
        next(error);
    }
};
