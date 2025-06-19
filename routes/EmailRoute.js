const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Newsletter = require('../models/Newsletter');
const verifyToken = require('../middleware/authMiddleware'); // ✅ Import middleware

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'blazemedia29@gmail.com',
        pass: 'lzzf nzsr daaf joma'
    }
});

// POST /api/newsletter - Public route to subscribe
router.post('/newsletter', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
        const existing = await Newsletter.findOne({ email });
        if (!existing) await new Newsletter({ email }).save();

        await transporter.sendMail({
            from: '"Newsletter Signup" <blazemedia29@gmail.com>',
            to: 'blazemedia29@gmail.com',
            subject: 'New Newsletter Subscription',
            text: `New subscriber email: ${email}`
        });

        res.status(201).json({ message: "Subscribed successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Subscription failed" });
    }
});

// ✅ GET /api/newsletter - Admin-only access
router.get('/newsletter', verifyToken, async (req, res) => {
    try {
        const emails = await Newsletter.find({}, { email: 1, _id: 0 }).sort({ createdAt: -1 });
        res.status(200).json(emails);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch emails" });
    }
});

module.exports = router;
