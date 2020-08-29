const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');

//Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        //Set token from Bearer token
        token = req.headers.authorization.split(' ')[1];
    }
    //Set token from cookie
    // else if(req.cookies.token){
    //     token = req.cookies.token;
    // }

    //Make sure token exists
    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
        //Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.body.id = decoded.id;
        next();
    } catch (error) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
})

//Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403));
        }
        next();
    }
}

//Create JWT token
exports.getSignedJwtToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}

exports.getResetPasswordToken = () => {
    //Generate Token
    const resetToken = crypto.randomBytes(20).toString('hex');

    //Hash token and set to resetPasswordToken field
    const reset_password_token = crypto.createHash('sha256').update(resetToken).digest('hex');

    //Set expire to 10min
    const reset_password_expire = Date.now() + 10 * 60 * 1000;

    return { resetToken, reset_password_token, reset_password_expire };
}