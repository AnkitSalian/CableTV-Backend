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

    const user_admin = await authDao.getUser(id, true);

    if (user_admin.role != 'ADMIN') {
        return next(new ErrorResponse('Cannot perform this action, only ADMIN has a right to update User data', 403));
    }

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

    const { email, mobile_no } = req.body;

    //Fetch user information using mobile
    const user = await authDao.getUserFromMobileNo(mobile_no);

    if (!user) {
        return next(new ErrorResponse('There is no user with that mobile number', 404));
    }

    // Get reset token
    const { resetToken, reset_password_token, reset_password_expire } = authMiddleWare.getResetPasswordToken();

    let password = process.env.DEFAULT_PASSWORD;

    let keyList = await commonFunctions.getUserTableKeys({ reset_password_token, reset_password_expire, password });

    //Create dynamic query
    let query = await commonFunctions.createUserTableQuery(keyList, { reset_password_token, reset_password_expire, password }, user.user_id);

    //Execute the update
    await authDao.updateUser(query);

    //Create reset URL
    // const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this sms because you (or someone else) has requested the reset of a password. Your user name is ${user.user_name} and password is ${password}`;

    try {
        // await sendEmail({
        //     email: user.email,
        //     subject: 'Password Reset Token',
        //     message
        // });

        res.status(200).json({
            success: true,
            data: 'SMS Sent'
        })
    } catch (error) {
        console.log(error);

        let keyList = await commonFunctions.getUserTableKeys({ reset_password_token: '', reset_password_expire: '' });

        //Create dynamic query
        let query = await commonFunctions.createUserTableQuery(keyList, { reset_password_token: '', reset_password_expire: '' }, user.user_id);

        //Execute the update
        await authDao.updateUser(query);

        return next(new ErrorResponse('SMS could not be sent', 500));
    }

})

// @desc     Reset password
// @route    PUT /api/v1/auth/resetpassword/:resettoken
// @access   public
exports.resetpassword = asyncHandler(async (req, res, next) => {

    const { resettoken } = req.params;
    const { password } = req.body;

    //Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(resettoken).digest('hex');

    const user = await authDao.getUserFromResetPasswordToken(resetPasswordToken);

    if (!user) {
        return next(new ErrorResponse('Invalid token', 400));
    }

    if (Number(user.reset_password_expire) < Date.now()) {
        return next(new ErrorResponse('Token expired', 400));
    }

    let keyList = await commonFunctions.getUserTableKeys({ reset_password_token: '', reset_password_expire: '', password });

    //Create dynamic query
    let query = await commonFunctions.createUserTableQuery(keyList, { reset_password_token: '', reset_password_expire: '', password }, user.user_id);

    //Execute the update
    await authDao.updateUser(query);


    sendTokenResponse(user, 200, res);
})

// @desc     Delete User
// @route    DELETE /api/v1/auth/deleteuser
// @access   private
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const { user_id, id } = req.body;

    const user_admin = await authDao.getUser(id, true);

    if (user_admin.role != 'ADMIN') {
        return next(new ErrorResponse('Cannot perform this action, only ADMIN has a right to delete', 403));
    }

    const user = await authDao.getUser(user_id, true);

    if (!user) {
        return next(new ErrorResponse('User not found, to be deleted', 403));
    }

    await authDao.deleteUser(user.user_id);

    res.status(200).json({
        success: true
    })

})

// @desc     Register user
// @route    GET /api/v1/auth/getAllUsers
// @access   public
exports.getAllUsers = asyncHandler(async (req, res, next) => {

    const userList = await authDao.getAllUsers();

    res.status(200).json({
        success: true,
        data: userList
    })
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