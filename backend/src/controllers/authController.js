import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, role, phone, bloodGroup, gender, dob } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400);
            return next(new Error('User already exists'));
        }

        // DOB backend validation
        if (dob) {
            const dobDate = new Date(dob);
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
        }

        const user = await User.create({
            name, email, password, role, phone, bloodGroup, gender, dob
        });

        if (user) {
            const token = generateToken(user._id);
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                dob: user.dob,
                age: user.age,
                gender: user.gender,
                bloodGroup: user.bloodGroup,
                avatar: user.avatar,
                token
            });
        } else {
            res.status(400);
            return next(new Error('Invalid user data'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            const token = generateToken(user._id);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                dob: user.dob,
                age: user.age,
                gender: user.gender,
                bloodGroup: user.bloodGroup,
                avatar: user.avatar,
                token
            });
        } else {
            res.status(401);
            return next(new Error('Invalid email or password'));
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password');
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
