const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const authDao = require('../daoimpl/auth');
const commonFunctions = require('../utils/commonfunctions');
const customerDao = require('../daoimpl/customer');
const technicianDao = require('../daoimpl/technician');
const ticketDao = require('../daoimpl/ticket');

// @desc     Fetch all tickets
// @route    GET /api/v1/ticket/all
// @access   public
exports.getTickets = asyncHandler(async (req, res, next) => {

    //Fetch all tickets
    const ticketList = await ticketDao.fetchAllTickets();

    res.status(200).json({
        success: true,
        data: ticketList
    })

})

// @desc     Fetch a ticket
// @route    GET /api/v1/ticket/:ticketid
// @access   public
exports.getTicket = asyncHandler(async (req, res, next) => {

    const { ticketid } = req.params;

    //Fetch ticket by ticket id
    const ticket = await ticketDao.fetchTicket(ticketid);

    if (!ticket) {
        return next(new ErrorResponse(`No ticket found with ticket id ${ticketid}`, 403));
    }

    res.status(200).json({
        success: true,
        data: ticket
    })
})

// @desc     Create ticket
// @route    POST /api/v1/ticket/create
// @access   public
exports.createTicket = asyncHandler(async (req, res, next) => {
    const { id, cust_id, area, complaint_remarks, type, full_name, address, mobile_no } = req.body;

    //Get user information
    const user = await authDao.getUser(id, true);

    if (!["INTERNET", "CABLE"].includes(type)) {
        return next(new ErrorResponse(`Ticket type can be either INTERNET or CABLE`, 400));
    }

    // Get max number of tickets for the day
    const maxTicketCount = await ticketDao.getMaxTicket();

    let reference_no = "";

    if (type === "CABLE") {

        //Get customer information
        const customerCheck = await customerDao.fetchCustomerByCustId(cust_id);
        let customer = null;
        if (!customerCheck) {
            //Register new customer
            await customerDao.createCustomer({ customer_id: cust_id, full_name, address, mobile_no, cable_user: 1, internet_user: 0 });



        }

        //Fetch customer by its custmerId
        customer = await customerDao.fetchCustomerByCustId(cust_id);

        let ticket_no = 0;
        if (maxTicketCount.length == 0) {
            await ticketDao.insertTicketCount();
            ticket_no = 1;
        } else {
            await ticketDao.updateTicketCount(maxTicketCount[0].ticket_count);
            ticket_no = Number(maxTicketCount[0].ticket_count) + 1;
        }

        const appendNumber = await commonFunctions.generateRefNo(ticket_no.toString());

        reference_no = await commonFunctions.createTicketReference(appendNumber);

        await ticketDao.createTicket({
            reference_no, customer_id: cust_id, customer_name: customer.full_name,
            address: customer.address, area, mobile: customer.mobile_no, complaint_remarks, created_by: user.user_name, type
        });

    } else if (type === "INTERNET") {
        let ticket_no = 0;
        if (maxTicketCount.length == 0) {
            await ticketDao.insertTicketCount();
            ticket_no = 1;
        } else {
            await ticketDao.updateTicketCount(maxTicketCount[0].ticket_count);
            ticket_no = Number(maxTicketCount[0].ticket_count) + 1;
        }

        const appendNumber = await commonFunctions.generateRefNo(ticket_no.toString());

        reference_no = await commonFunctions.createTicketReference(appendNumber);

        await ticketDao.createTicket({
            reference_no, customer_id: "", customer_name: full_name,
            address: address, area, mobile: mobile_no, complaint_remarks, created_by: user.user_name, type
        });
    }


    // //Fetch inserted ticket
    const ticket = await ticketDao.fetchTicket(reference_no);

    res.status(200).json({
        success: true,
        data: ticket
    })

})

// @desc     Update NEW ticket
// @route    PUT /api/v1/ticket/update
// @access   private
exports.updateNewTicket = asyncHandler(async (req, res, next) => {
    const { id, tech_id, reference_no } = req.body;

    //Get user information
    const user = await authDao.getUser(id, true);

    if (user.role != 'ADMIN') {
        return next(new ErrorResponse('Cannot perform this action, only ADMIN has a right to assign the ticket', 403));
    }

    //Get Technician details
    const technician = await technicianDao.fetchTechnicianByTechId(tech_id);

    if (!technician) {
        return next(new ErrorResponse(`No technician found with tech id ${tech_id}`, 400));
    }

    //Fetch inserted ticket
    const ticket = await ticketDao.fetchTicket(reference_no);

    if (!ticket) {
        return next(new ErrorResponse(`No ticket found with reference no ${reference_no}`, 400));
    }

    if (ticket.status == 'CLOSED') {
        return next(new ErrorResponse(`Ticket with reference no ${reference_no} is CLOSED`, 400));
    }

    //Update the ticket
    await ticketDao.assignTicket(technician.name, reference_no);

    res.status(200).json({
        success: true
    })

})

// @desc     Close ticket
// @route    PUT /api/v1/ticket/close
// @access   public
exports.closeTicket = asyncHandler(async (req, res, next) => {
    const { id, closing_comments, reference_no } = req.body;

    //Fetch inserted ticket
    const ticket = await ticketDao.fetchTicket(reference_no);

    if (!ticket) {
        return next(new ErrorResponse(`No ticket found with reference no ${reference_no}`, 400));
    }

    if (ticket.status == 'CLOSED') {
        return next(new ErrorResponse(`Ticket with reference no ${reference_no} is CLOSED`, 400));
    }

    //Update the ticket
    await ticketDao.closeTicket(closing_comments, reference_no);

    res.status(200).json({
        success: true
    })

})