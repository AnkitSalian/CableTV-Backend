const connectDB = require('../config/db')
const asyncHandler = require('../middleware/async');

exports.fetchTechnician = asyncHandler(async () => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        await connection.query(`select * from technician_master`, (error, result) => {
            if (error) reject(error);
            connection.release;
            resolve(result);
        })
    })
})

exports.fetchTechnicianByTechId = asyncHandler(async (techId) => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        await connection.query(`select * from technician_master where tech_id = '${techId}'`, (error, result) => {
            if (error) reject(error);
            connection.release;
            resolve(result[0]);
        })
    })
})

exports.getMaxTechId = asyncHandler(async () => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        await connection.query(`select max(tech_id) as tech_id from technician_master`, (error, result) => {
            if (error) reject(error);
            connection.release;
            resolve(result[0].tech_id);
        })
    })
})

exports.createTechnician = asyncHandler(async ({ tech_id, name, mobile }) => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        await connection.query(`insert into technician_master (tech_id, name, mobile, createdDate) 
        values ('${tech_id}', '${name}', '${mobile}', now())`, (error, results) => {
            if (error) reject(error);
            connection.release;
            resolve(true);
        })
    })
})

exports.updateTechnician = asyncHandler(async (query) => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        await connection.query(query, (error, result) => {
            if (error) reject(error);
            connection.release;
            resolve(true);
        })

    })
})

exports.deleteTechnician = asyncHandler(async (tech_id) => {
    return new Promise(async (resolve, reject) => {
        connection = await connectDB();
        await connection.query(`delete from technician_master where tech_id = ${tech_id}`, (error, result) => {
            if (error) reject(error);
            connection.release;
            resolve(true)
        })
    })
})