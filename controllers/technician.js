const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const authDao = require('../daoimpl/auth');
const commonFunctions = require('../utils/commonfunctions');
const technicianDao = require('../daoimpl/technician');

// @desc     Fetch all technicians
// @route    GET /api/v1/technician/all
// @access   public
exports.fetchAllTechnicians = asyncHandler(async (req, res, next) => {

    const { id } = req.body;

    //Fetch entire list of technicians
    const technicianList = await technicianDao.fetchTechnician();

    res.status(200).json({
        success: true,
        data: technicianList
    })
})

// @desc     Fetch single technician
// @route    GET /api/v1/technician/:techid
// @access   public
exports.fetchTechnicianByTechId = asyncHandler(async (req, res, next) => {

    const { id } = req.body;
    const { techid } = req.params;

    //Fetch customer by its custmerId
    const technician = await technicianDao.fetchTechnicianByTechId(techid);

    if (!technician) {
        return next(new ErrorResponse(`No customer found with customer id ${techid}`, 403));
    }

    res.status(200).json({
        success: true,
        data: technician
    })
})

// @desc     Create new Technician
// @route    POST /api/v1/technician/register
// @access   private
exports.createTechnician = asyncHandler(async (req, res, next) => {
    const { id, tech_id, name, mobile } = req.body;

    const user = await authDao.getUser(id, true);

    //Check if user is admin
    if (user.role != 'ADMIN') {
        return next(new ErrorResponse('Cannot perform this action, only ADMIN has a right to create technician', 403));
    }

    if (tech_id == null || tech_id == '') {
        return next(new ErrorResponse('tech_id cannot be null or blank', 400));
    }

    //Register new technician
    await technicianDao.createTechnician({ tech_id, name, mobile });

    //Fetch technician by its tech_id
    const technician = await technicianDao.fetchTechnicianByTechId(tech_id);

    res.status(200).json({
        success: true,
        data: technician
    })
})

// @desc     Update technician details
// @route    PUT /api/v1/customer/updatedetails
// @access   private
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const { id, tech_id } = req.body;

    const user = await authDao.getUser(id, true);

    if (user.role != 'ADMIN') {
        return next(new ErrorResponse('Cannot perform this action, only ADMIN has a right to update Customer data', 403));
    }

    if (tech_id == null || tech_id == '') {
        return next(new ErrorResponse('tech_id cannot be null or blank', 400));
    }

    let keyList = await commonFunctions.getTechnicianTableKeys(req.body);

    if (keyList.length == 0) {
        return next(new ErrorResponse(`No column values specified, kindly enter the value that has: ${process.env.TECHNICIAN_TABLE_COLUMNS}`, 400));
    }

    //Create dynamic query
    let query = await commonFunctions.createTechnicianTableQuery(keyList, req.body, tech_id);

    //Execute the update
    await technicianDao.updateTechnician(query);

    //Fetch the technician
    let technician = await technicianDao.fetchTechnicianByTechId(tech_id);

    res.status(200).json({
        success: true,
        data: technician
    })
})

// @desc     Delete technician
// @route    DELETE /api/v1/technician/del/:techid
// @access   private
exports.deleteTechnician = asyncHandler(async (req, res, next) => {
    const { id } = req.body;
    const { techid } = req.params;

    const user = await authDao.getUser(id, true);

    if (user.role != 'ADMIN') {
        return next(new ErrorResponse('Cannot perform this action, only ADMIN has a right to delete Technician data', 403));
    }

    //Fetch technician by its custmerId
    const technician = await technicianDao.fetchTechnicianByTechId(techid);

    if (!technician) {
        return next(new ErrorResponse(`No technician found with technician id ${techid}`, 403));
    }

    await technicianDao.deleteTechnician(techid);

    res.status(200).json({
        success: true
    })

})