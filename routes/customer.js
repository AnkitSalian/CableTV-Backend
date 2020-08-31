const express = require('express');

const router = express.Router();

const {
    fetchAllCustomers,
    fetchCustomerByCustId,
    createCustomer,
    updateDetails,
    deleteCustomer
} = require('../controllers/customer');

const { protect } = require('../middleware/auth');

router.get('/all', protect, fetchAllCustomers);

router.get('/:custid', protect, fetchCustomerByCustId);

router.post('/register', protect, createCustomer);

router.put('/updatedetails', protect, updateDetails);

router.delete('/del/:custid', protect, deleteCustomer);

module.exports = router;