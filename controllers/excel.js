const path = require('path');

const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const excelDao = require('../daoimpl/exceldao');
const commonFunctions = require('../utils/commonfunctions');
const excel = require('exceljs');

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

    // await commonFunctions.generateExcelFile(json_array, table_name);

    // let excelFilePath = path.join(__dirname, `../${table_name}.xlsx`);

    // var workbook = new excel.Workbook();
    // workbook.xlsx.readFile(excelFilePath)
    //     .then(function () {
    //         var worksheet = workbook.getWorksheet(sheet);
    //     });

    // // res.download(`${excelFilePath}`, `${table_name}.xlsx`);
    // res.setHeader(
    //     "Content-Type",
    //     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    // );
    // res.setHeader(
    //     "Content-Disposition",
    //     "attachment; filename=" + `${table_name}.xlsx`
    // );

    // return workbook.xlsx.write(res).then(function () {
    //     res.status(200).end();
    // });

    res.status(200).json({
        status: true,
        data: json_array
    })
})

// @desc     Export excel file with start or end date params
// @route    GET /api/v1/excel/getTableData
// @access   public
exports.getTableData = asyncHandler(async (req, res, next) => {
    const { table_name, startDateTime, endDateTime } = req.body;

    if (!process.env.AVAILABLE_TABLES.split(',').includes(table_name)) {
        return next(new ErrorResponse(`No table found with table name ${table_name}`, 403));
    }

    if (startDateTime == null || startDateTime == undefined || startDateTime == '') {
        return next(new ErrorResponse(`startDateTime cannot be null or empty`, 403));
    }

    if (endDateTime == null || endDateTime == undefined || endDateTime == '') {
        return next(new ErrorResponse(`endDateTime cannot be null or empty`, 403));
    }

    const json_array = await excelDao.getTabledataWithStartEndDate(table_name, startDateTime, endDateTime);

    // await commonFunctions.generateExcelFile(json_array, table_name);

    // let excelFilePath = path.join(__dirname, `../${table_name}.xlsx`);

    // var workbook = new excel.Workbook();
    // workbook.xlsx.readFile(excelFilePath)
    //     .then(function () {
    //         var worksheet = workbook.getWorksheet(sheet);
    //     });

    // // res.download(`${excelFilePath}`, `${table_name}.xlsx`);

    // res.setHeader(
    //     "Content-Type",
    //     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    // );
    // res.setHeader(
    //     "Content-Disposition",
    //     "attachment; filename=" + `${table_name}.xlsx`
    // );

    // return workbook.xlsx.write(res).then(function () {
    //     res.status(200).end();
    // });

    res.status(200).json({
        status: true,
        data: json_array
    })

})