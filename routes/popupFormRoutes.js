// routes/popupFormRoutes.js
const express = require('express');
const router = express.Router();
const PopupForm = require('../models/PopupForm');
const verifyToken = require('../middleware/authMiddleware');


// POST /api/popup-form
router.post('/popup-form', async (req, res) => {
    try {
        const { name, email, phone, pincode } = req.body;
        if (!name || !email) return res.status(400).json({ error: 'Name and email are required.' });

        const data = new PopupForm({ name, email, phone, pincode });
        await data.save();
        res.status(201).json({ message: 'Form submitted successfully', data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to submit form' });
    }
});

// GET /api/popup-form
router.get('/popup-form', verifyToken, async (req, res) => {
    try {
        const entries = await PopupForm.find().sort({ createdAt: -1 });
        res.status(200).json(entries);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch popup forms' });
    }
});

module.exports = router;
