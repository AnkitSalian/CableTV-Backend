const crypto = require('crypto');
const brcypt = require('bcryptjs');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('../middleware/async');
const authDao = require('../daoimpl/auth');
const authMiddleWare = require('../middleware/auth');
const commonFunctions = require('../utils/commonfunctions');

// @desc     Register user
// @route    POST /api/v1/auth/register
// @access   public
exports.register = asyncHandler(async (req, res, next) => {
    const { user_name, email, password, role, address, mobile_no, full_name } = req.body;

    //Check user_name already exits
    const user_count = await authDao.checkUserNameExists(user_name);

    if (user_count != 0) {
        return next(new ErrorResponse('User already exist, kindly select different user name', 401));
    }

    if (!process.env.ROLES.split(',').includes(role)) {
        return next(new ErrorResponse(`Invalid Role, role can be either one of ${process.env.ROLES}`, 401));
    }

    //Create User
    await authDao.createUser(
        { user_name, email, password, role, address, mobile_no, full_name }
    );

    const user = await authDao.getUser(user_name, false);

    await authDao.updateLastLogin(user.user_id);

    sendTokenResponse(user, 200, res);

})

// @desc     Login
// @route    POST /api/v1/auth/login
// @access   public
exports.login = asyncHandler(async (req, res, next) => {
    const { user_name, password } = req.body;

    //Validate email and password
    if (!user_name || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
    }

    //Check for User
    const user = await authDao.getUser(user_name, false);

    if (!user) {
        return next(new ErrorResponse('User not found', 401));
    }

    //Check if password matches
    const isMatch = await brcypt.compare(password, user.password);

    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    await authDao.updateLastLogin(user.user_id);

    sendTokenResponse(user, 200, res);
})

// @desc     Log user out / clear cookie
// @route    GET /api/v1/auth/logout
// @access   private
exports.logout = asyncHandler(async (req, res, next) => {

    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        data: {}
    })
})

// @desc     Get current logged in user
// @route    POST /api/v1/auth/me
// @access   private
exports.getMe = asyncHandler(async (req, res, next) => {
    const { id } = req.body;

    const user = await authDao.getUser(id, true);

    res.status(200).json({
        success: true,
        data: user
    })
})


// @desc     Update user details
// @route    PUT /api/v1/auth/updatedetails
// @access   private
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const { id } = req.body;

    let keyList = await commonFunctions.getUserTableKeys(req.body);

    if (keyList.length == 0) {
        return next(new ErrorResponse(`No column values specified, kindly enter the value that has: ${process.env.USER_TABLE_COLUMNS}`, 400));
    }

    if (keyList.includes('user_name')) {

        //Check user_name already exits
        const user_count = await authDao.checkUserNameExists(req.body.user_name);

        if (user_count != 0) {
            return next(new ErrorResponse('User already exist, kindly select different user name', 401));
        }

    }

    //Create dynamic query
    let query = await commonFunctions.createUserTableQuery(keyList, req.body, id);

    //Execute the update
    await authDao.updateUser(query);

    //Fetch saved user information
    const user = await authDao.getUser(id, true);

    res.status(200).json({
        success: true,
        data: user
    })
})

// @desc     Update password
// @route    PUT /api/v1/auth/updatepassword
// @access   private
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword, id } = req.body;

    const user = await authDao.getUser(id, true);

    // Check current password
    const isMatch = await brcypt.compare(currentPassword, user.password);

    //Update password
    await authDao.updatePassword(newPassword, id);

    sendTokenResponse(user, 200, res);
})

// @desc     Forgot password
// @route    POST /api/v1/auth/forgotpassword
// @access   public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    // const user = await User.findOne({ email: req.body.email });

    // if (!user) {
    //     return next(new ErrorResponse('There is no user with that email', 404));
    // }

    //Get reset token
    // const resetToken = user.getResetPasswordToken();

    // await user.save({ validateBeforeSave: false });

    //Create reset URL
    // const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Token',
            message
        });

        res.status(200).json({
            success: true,
            data: 'Email Sent'
        })
    } catch (error) {
        console.log(error);
        // user.resetPasswordToken = undefined;
        // user.resetPasswordExpire = undefined;

        // await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse('Email could not be sent', 500));
    }

})

// @desc     Reset password
// @route    PUT /api/v1/auth/resetpassword/:resettoken
// @access   public
exports.resetpassword = asyncHandler(async (req, res, next) => {
    //Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    // const user = await User.findOne({
    //     resetPasswordToken,
    //     resetPasswordExpire: { $gt: Date.now() }
    // });

    // if (!user) {
    //     return next(new ErrorResponse('Invalid token', 400));
    // }

    //Set new password
    // user.password = req.body.password;
    // user.resetPasswordToken = undefined;
    // user.resetPasswordExpire = undefined;
    // await user.save();

    // sendTokenResponse(user, 200, res);
})

//Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    //Create token 
    const token = authMiddleWare.getSignedJwtToken(user.user_id);

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        })
}