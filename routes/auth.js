const express = require('express');
const {
    register,
    login,
    getMe,
    forgotPassword,
    resetpassword,
    updateDetails,
    updatePassword,
    logout,
    deleteUser,
    getAllUsers
} = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', register);

router.post('/login', login);

router.get('/me', protect, getMe);

router.get('/logout', logout);

router.put('/updatedetails', protect, updateDetails);

router.put('/updatepassword', protect, updatePassword);

router.post('/forgotpassword', forgotPassword);

router.put('/resetpassword/:resettoken', resetpassword);

router.delete('/deleteuser', protect, deleteUser);

router.get('/getAllUsers', getAllUsers);

module.exports = router;