const brcypt = require('bcryptjs');
const connectDB = require('../config/db')
const asyncHandler = require('../middleware/async');
// const { connect, delete } = require('../routes/auth');

exports.getUser = asyncHandler(async (user_value, idFlag) => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        await connection.query(`select * from user where ${idFlag ? 'user_id' : 'user_name'}  = '${user_value}'`, (error, results) => {
            if (error) reject(error);
            connection.release;
            resolve(results[0]);
        })
    })

})

exports.updateLastLogin = asyncHandler(async (user_id) => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        await connection.query(`update user set last_login = now() where user_id = ${user_id}`, (error, results) => {
            if (error) reject(error);
            connection.release;
            console.log(`Last login has been updated`.green)
            resolve(true);
        })
    })
})

exports.checkUserNameExists = asyncHandler(async (user_name) => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        await connection.query(`select count(1) as user_count from user where user_name = '${user_name}'`, (error, results) => {
            if (error) reject(error);
            connection.release;
            resolve(results[0].user_count);
        })
    })
})

exports.createUser = asyncHandler(async ({ user_name, email, password, role, address, mobile_no, full_name }) => {
    console.log('Value===>', user_name, email, password, role, address, mobile_no, full_name);
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        const salt = await brcypt.genSalt(10);
        password = await brcypt.hash(password, salt);
        await connection.query(`insert into user (user_name, password, created_at, mobile_no, role, email, address, full_name) 
        values ('${user_name}', '${password}', now(), '${mobile_no}', '${role}', '${email}', '${address}', '${full_name}')`, (error, results) => {
            if (error) reject(error);
            connection.release;
            resolve(true);
        })
    })
})

exports.updateUser = asyncHandler(async (query) => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        await connection.query(query, (error, result) => {
            if (error) reject(error);
            connection.release;
            resolve(true);
        })

    })
})

exports.updatePassword = asyncHandler(async (password, id) => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        const salt = await brcypt.genSalt(10);
        password = await brcypt.hash(password, salt);
        await connection.query(`update user set password = '${password}' where user_id = ${id}`, (error, result) => {
            if (error) reject(error);
            connection.release;
            resolve(true);
        })
    })
})

exports.getUserFromMobileNo = asyncHandler(async (mobile) => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        await connection.query(`select * from user where mobile_no = '${mobile}'`, (error, results) => {
            if (error) reject(error);
            connection.release;
            resolve(results[0]);
        })
    })

})

exports.getUserFromResetPasswordToken = asyncHandler(async (resetPasswordToken) => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        await connection.query(`select * from user where reset_password_token = '${resetPasswordToken}'`, (error, results) => {
            if (error) reject(error);
            connection.release;
            resolve(results[0]);
        })
    })
})
