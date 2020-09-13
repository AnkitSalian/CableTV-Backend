const connectDB = require('../config/db')
const asyncHandler = require('../middleware/async');

exports.fetchAllTickets = asyncHandler(async () => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        await connection.query(`select * from complaint_register`, (error, result) => {
            if (error) reject(error);
            connection.release;
            resolve(result);
        })
    })
})

exports.fetchTicket = asyncHandler(async (ref_no) => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        connection.query(`select * from complaint_register where reference_no = ${ref_no}`, (error, result) => {
            if (error) reject(error);
            connection.release;
            resolve(result[0]);
        })
    })
})

exports.createTicket = asyncHandler(async ({ reference_no, customer_id, customer_name, address, area, mobile,
    complaint_remarks, created_by, type }) => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        connection.query(`insert into complaint_register (reference_no, customer_id, customer_name, address, area, 
            mobile, complaint_remarks, created_by, status, created_date, type) values ('${reference_no}', '${customer_id}',
            '${customer_name}', '${address}', '${area}', '${mobile}', '${complaint_remarks}', '${created_by}',
            'NEW', now(), '${type}')`, (error, result) => {
            if (error) reject(error);
            connection.release;
            resolve(true);
        });
    })
})

exports.getMaxTicket = asyncHandler(async () => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        connection.query(`select ticket_count from daily_ticket_counter where date = CURDATE()`, (error, result) => {
            if (error) reject(error);
            connection.release;
            resolve(result);
        })
    })
})

exports.insertTicketCount = asyncHandler(async () => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        connection.query(`insert into daily_ticket_counter values (1, CURDATE());`, (error, result) => {
            if (error) reject(error);
            connection.release;
            resolve(true);
        })
    })
})

exports.updateTicketCount = asyncHandler(async (ticket_count) => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        connection.query(`update daily_ticket_counter set ticket_count = ${Number(ticket_count) + 1} where date = CURDATE();`, (error, result) => {
            if (error) reject(error);
            connection.release;
            resolve(true);
        })
    })
})

exports.assignTicket = asyncHandler(async (assigned_to, ref_no) => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        connection.query(`update complaint_register set assigned_to = '${assigned_to}', updated_date = now(), 
            status = 'ASSIGNED' where reference_no = '${ref_no}'`, (error, result) => {
            if (error) reject(error);
            connection.release;
            resolve(true);
        })
    })
})

exports.closeTicket = asyncHandler(async (closing_comments, ref_no) => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        connection.query(`update complaint_register set closing_comments = '${closing_comments}', updated_date = now(), 
            status = 'CLOSED' where reference_no = '${ref_no}'`, (error, result) => {
            if (error) reject(error);
            connection.release;
            resolve(true);
        })
    })
})