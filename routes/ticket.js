const express = require('express');

const router = express.Router();

const {
    getTickets,
    getTicket,
    createTicket,
    updateNewTicket,
    closeTicket
} = require('../controllers/ticket');

const { protect } = require('../middleware/auth');

router.get('/all', getTickets);

router.get('/:ticketid', getTicket);

router.post('/create', protect, createTicket);

router.put('/update', protect, updateNewTicket);

router.put('/close', closeTicket);

module.exports = router;