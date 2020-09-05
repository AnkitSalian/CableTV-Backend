const express = require('express');

const router = express.Router();

const {
    generateExcel,
    getTableData
} = require('../controllers/excel');

router.get('/:table_name', generateExcel);
router.post('/getTableData', getTableData);

module.exports = router;