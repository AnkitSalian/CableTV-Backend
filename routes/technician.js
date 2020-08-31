const express = require('express');

const router = express.Router();

const {
    fetchAllTechnicians,
    fetchTechnicianByTechId,
    createTechnician,
    updateDetails,
    deleteTechnician
} = require('../controllers/technician');

const { protect } = require('../middleware/auth');

router.get('/all', protect, fetchAllTechnicians);

router.get('/:techid', protect, fetchTechnicianByTechId);

router.post('/register', protect, createTechnician);

router.put('/updatedetails', protect, updateDetails);

router.delete('/del/:techid', protect, deleteTechnician);

module.exports = router;