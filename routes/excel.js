const express = require('express');

const router = express.Router();

const {
    generateExcel
} = require('../controllers/excel');

router.get('/:table_name', generateExcel);

module.exports = router;