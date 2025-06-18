const express = require('express');
const router = express.Router();
const {
    submitContact,
    getAllContacts,
    markContacted,
    deleteContact
} = require('../controllers/contactController');

const verifyToken = require('../middleware/authMiddleware');

// Public
router.post('/', submitContact);

// Admin only
router.get('/', verifyToken, getAllContacts);
router.put('/:id/status', verifyToken, markContacted);
router.delete('/:id', verifyToken, deleteContact);

module.exports = router;
