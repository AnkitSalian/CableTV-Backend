const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const authDao = require('../daoimpl/auth');
const commonFunctions = require('../utils/commonfunctions');
const customerDao = require('../daoimpl/customer');

// @desc     Fetch all customers
// @route    GET /api/v1/customer/all
// @access   public
exports.fetchAllCustomers = asyncHandler(async (req, res, next) => {

    const { id } = req.body;

    //Fetch entire list of customer
    const customerList = await customerDao.fetchCustomer();

    res.status(200).json({
        success: true,
        data: customerList
    })
})

// @desc     Fetch all customers
// @route    GET /api/v1/customer/:custid
// @access   public
exports.fetchCustomerByCustId = asyncHandler(async (req, res, next) => {

    const { id } = req.body;
    const { custid } = req.params;

    //Fetch customer by its custmerId
    const customer = await customerDao.fetchCustomerByCustId(custid);

    if (!customer) {
        return next(new ErrorResponse(`No customer found with customer id ${custid}`, 403));
    }

    res.status(200).json({
        success: true,
        data: customer
    })
})

// @desc     Fetch all customers
// @route    POST /api/v1/customer/register
// @access   private
exports.createCustomer = asyncHandler(async (req, res, next) => {
    const { id, customer_id, full_name, address, mobile_no } = req.body;

    const user = await authDao.getUser(id, true);

    //Check if user is admin
    if (user.role != 'ADMIN') {
        return next(new ErrorResponse('Cannot perform this action, only ADMIN has a right to create customer', 403));
    }

    //Register new customer
    await customerDao.createCustomer({ customer_id, full_name, address, mobile_no });

    //Fetch customer by its custmerId
    const customer = await customerDao.fetchCustomerByCustId(customer_id);

    res.status(200).json({
        success: true,
        data: customer
    })
})

// @desc     Update user details
// @route    PUT /api/v1/customer/updatedetails
// @access   private
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const { id, customer_id } = req.body;

    const user = await authDao.getUser(id, true);

    if (user.role != 'ADMIN') {
        return next(new ErrorResponse('Cannot perform this action, only ADMIN has a right to update Customer data', 403));
    }

    let keyList = await commonFunctions.getCustomerTableKeys(req.body);

    if (keyList.length == 0) {
        return next(new ErrorResponse(`No column values specified, kindly enter the value that has: ${process.env.CUSTOMER_TABLE_COLUMNS}`, 400));
    }

    //Create dynamic query
    let query = await commonFunctions.createCustomerTableQuery(keyList, req.body, customer_id);
    console.log('query===>', query);

    //Execute the update
    await customerDao.updateCustomer(query);

    //Fetch the customer
    let customer = await customerDao.fetchCustomerByCustId(customer_id);

    res.status(200).json({
        success: true,
        data: customer
    })
})

// @desc     Update user details
// @route    DELETE /api/v1/customer/del/:custid
// @access   private
exports.deleteCustomer = asyncHandler(async (req, res, next) => {
    const { id } = req.body;
    const { custid } = req.params;

    const user = await authDao.getUser(id, true);

    if (user.role != 'ADMIN') {
        return next(new ErrorResponse('Cannot perform this action, only ADMIN has a right to update Customer data', 403));
    }

    //Fetch customer by its custmerId
    const customer = await customerDao.fetchCustomerByCustId(custid);

    if (!customer) {
        return next(new ErrorResponse(`No customer found with customer id ${custid}`, 403));
    }

    await customerDao.deleteCustomer(custid);

    res.status(200).json({
        success: true
    })

})