const connectDB = require('../config/db')
const asyncHandler = require('../middleware/async');

exports.fetchCustomer = asyncHandler(async () => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        await connection.query(`select * from customer_master`, (error, result) => {
            if (error) reject(error);
            connection.release;
            resolve(result);
        })
    })
})

exports.fetchCustomerByCustId = asyncHandler(async (custId) => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        await connection.query(`select * from customer_master where customer_id = '${custId}'`, (error, result) => {
            if (error) reject(error);
            connection.release;
            resolve(result[0]);
        })
    })
})

exports.getMaxCustomerId = asyncHandler(async () => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        await connection.query(`select max(customer_id) as cust_id from customer_master`, (error, result) => {
            if (error) reject(error);
            connection.release;
            resolve(result[0].cust_id);
        })
    })
})

exports.createCustomer = asyncHandler(async ({ customer_id, full_name, address, mobile_no, cable_user, internet_user }) => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        await connection.query(`insert into customer_master (customer_id, full_name, address, mobile_no, cable_user, internet_user) 
        values ('${customer_id}', '${full_name}', '${address}', '${mobile_no}', ${cable_user}, ${internet_user})`, (error, results) => {
            if (error) reject(error);
            connection.release;
            resolve(true);
        })
    })
})

exports.updateCustomer = asyncHandler(async (query) => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        await connection.query(query, (error, result) => {
            if (error) reject(error);
            connection.release;
            resolve(true);
        })

    })
})

exports.deleteCustomer = asyncHandler(async (cust_id) => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        await connection.query(`delete from customer_master where customer_id = ${cust_id}`, (error, result) => {
            if (error) reject(error);
            connection.release;
            resolve(true)
        })
    })
})