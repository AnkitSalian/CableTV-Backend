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

// @desc     Fetch single customers
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

// @desc     Create new customer
// @route    POST /api/v1/customer/register
// @access   private
exports.createCustomer = asyncHandler(async (req, res, next) => {
    const { id, customer_id, full_name, address, mobile_no, cable_user, internet_user } = req.body;

    const user = await authDao.getUser(id, true);

    //Check if user is admin
    if (user.role != 'ADMIN') {
        return next(new ErrorResponse('Cannot perform this action, only ADMIN has a right to create customer', 403));
    }

    if (customer_id == null || customer_id == '') {
        return next(new ErrorResponse('customer_id cannot be null or blank', 400));
    }

    if (!([0, 1].includes(cable_user) && [0, 1].includes(internet_user))) {
        return next(new ErrorResponse('cable_user or internet_user values can be either 0 or 1', 400));
    }

    //Register new customer
    await customerDao.createCustomer({ customer_id, full_name, address, mobile_no, cable_user, internet_user });

    //Fetch customer by its custmerId
    const customer = await customerDao.fetchCustomerByCustId(customer_id);

    res.status(200).json({
        success: true,
        data: customer
    })
})

// @desc     Update customer details
// @route    PUT /api/v1/customer/updatedetails
// @access   private
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const { id, customer_id } = req.body;

    const user = await authDao.getUser(id, true);

    if (user.role != 'ADMIN') {
        return next(new ErrorResponse('Cannot perform this action, only ADMIN has a right to update Customer data', 403));
    }

    if (customer_id == null || customer_id == '') {
        return next(new ErrorResponse('customer_id cannot be null or blank', 400));
    }

    let keyList = await commonFunctions.getCustomerTableKeys(req.body);

    if (keyList.length == 0) {
        return next(new ErrorResponse(`No column values specified, kindly enter the value that has: ${process.env.CUSTOMER_TABLE_COLUMNS}`, 400));
    }

    if (keyList.includes('cable_user') || keyList.includes('internet_user')) {

        if (!([0, 1].includes(req.body.cable_user))) {
            return next(new ErrorResponse('cable_user values can be either 0 or 1', 400));
        }

        if (!([0, 1].includes(req.body.internet_user))) {
            return next(new ErrorResponse('internet_user values can be either 0 or 1', 400));
        }

    }

    //Create dynamic query
    let query = await commonFunctions.createCustomerTableQuery(keyList, req.body, customer_id);

    //Execute the update
    await customerDao.updateCustomer(query);

    //Fetch the customer
    let customer = await customerDao.fetchCustomerByCustId(customer_id);

    res.status(200).json({
        success: true,
        data: customer
    })
})

// @desc     Delete customer
// @route    DELETE /api/v1/customer/del/:custid
// @access   private
exports.deleteCustomer = asyncHandler(async (req, res, next) => {
    const { id } = req.body;
    const { custid } = req.params;

    const user = await authDao.getUser(id, true);

    if (user.role != 'ADMIN') {
        return next(new ErrorResponse('Cannot perform this action, only ADMIN has a right to delete Customer data', 403));
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