const connectDB = require('../config/db')
const asyncHandler = require('../middleware/async');

exports.getTabledata = asyncHandler(async (table_name) => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        await connection.query(`select * from ${table_name}`, (error, result) => {
            if (error) reject(error);
            connection.release;
            let output = [];
            result.forEach(element => {
                output.push(element);
            });
            resolve(output)
        })
    })
})