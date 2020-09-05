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

exports.getTabledataWithStartEndDate = asyncHandler(async (table_name, start_date, end_date) => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        console.log('Query===>', `select * from ${table_name} where
        ${table_name == 'user' ? 'created_at' : (table_name == 'technician_master' ? 'createdDate' : (table_name == 'complaint_register' ? 'created_date' : 'created_at'))} >= '${start_date}' and  
        ${table_name == 'user' ? 'created_at' : (table_name == 'technician_master' ? 'createdDate' : (table_name == 'complaint_register' ? 'created_date' : 'created_at'))} <= '${end_date}'`);
        await connection.query(`select * from ${table_name} where
                ${table_name == 'user' ? 'created_at' : (table_name == 'technician_master' ? 'createdDate' : (table_name == 'complaint_register' ? 'created_date' : 'created_at'))} >= '${start_date}' and  
                ${table_name == 'user' ? 'created_at' : (table_name == 'technician_master' ? 'createdDate' : (table_name == 'complaint_register' ? 'created_date' : 'created_at'))} <= '${end_date}'`, (error, result) => {
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