import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const protect = async (req, res, next) => {
    let token;

    // Debugging Support: Log incoming Authentication headers
    console.log(`[AuthMiddleware] Path: ${req.originalUrl} | Auth Header: ${req.headers.authorization ? 'Present' : 'Missing'}`);

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findById(decoded.userId).select('-password');
            if (!user) {
                res.status(401);
                return next(new Error('User no longer exists'));
            }

            req.user = user;
            next();
        } catch (error) {
            res.status(401);
            next(new Error('Not authorized, token failed'));
        }
    }

    if (!token) {
        res.status(401);
        next(new Error('Not authorized, no token'));
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403);
            return next(new Error(`User role ${req.user ? req.user.role : 'Unknown'} is not authorized to access this route`));
        }
        next();
    };
};
