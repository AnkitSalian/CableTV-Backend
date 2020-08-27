const connectDB = require('../config/db')
const asyncHandler = require('../middleware/async');

exports.checkUser = asyncHandler(async (email) => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        await connection.query(`select * from user where email = '${email}'`, (error, results) => {
            if (error) reject(error);
            resolve(results[0]);
        })
    })

})