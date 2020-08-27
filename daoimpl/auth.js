const brcypt = require('bcryptjs');
const connectDB = require('../config/db')
const asyncHandler = require('../middleware/async');

exports.checkUser = asyncHandler(async (email) => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        await connection.query(`select * from user where email = '${email}'`, (error, results) => {
            if (error) reject(error);
            connection.release;
            resolve(results[0]);
        })
    })

})

exports.createUser = asyncHandler(async (user_name, email, password, role, address, mobile_no, full_name) => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        const salt = await brcypt.genSalt(10);
        password = await brcypt.hash(password, salt);
        await connection.query(`insert into user (user_name, password, created_at, mobile_no, last_login, role, email, address, full_name, aadhar_no) 
        values ('${user_name}', '${password}', now(), '${mobile_no}', now(), '${role}', '${email}', ${address})`)
    })
})