const path = require('path');

const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const excelDao = require('../daoimpl/exceldao');
const commonFunctions = require('../utils/commonfunctions');

// @desc     Export excel file
// @route    GET /api/v1/excel/:table_name
// @access   public
exports.generateExcel = asyncHandler(async (req, res, next) => {
    const { id } = req.body;
    const { table_name } = req.params;

    if (!process.env.AVAILABLE_TABLES.split(',').includes(table_name)) {
        return next(new ErrorResponse(`No table found with table name ${table_name}`, 403));
    }

    const json_array = await excelDao.getTabledata(table_name);

    await commonFunctions.generateExcelFile(json_array, table_name);

    let excelFilePath = path.join(__dirname, `../${table_name}.xlsx`);

    res.download(`${excelFilePath}`, `${table_name}.xlsx`);

})