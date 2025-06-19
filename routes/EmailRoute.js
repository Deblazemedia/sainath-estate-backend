const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Newsletter = require('../models/Newsletter');
const verifyToken = require('../middleware/authMiddleware');

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'blazemedia29@gmail.com',
        pass: 'lzzf nzsr daaf joma'
    }
});

// POST /api/newsletter - Save + notify + thank user
router.post('/newsletter', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
        const existing = await Newsletter.findOne({ email });
        if (!existing) await new Newsletter({ email }).save();

        // Notify admin
        await transporter.sendMail({
            from: '"Sainath Estate - Newsletter" <blazemedia29@gmail.com>',
            to: 'blazemedia29@gmail.com',
            subject: 'New Newsletter Subscription',
            text: `New subscriber email: ${email}`
        });

        // ✅ Send thank-you email to user
        await transporter.sendMail({
            from: '"Sainath Estate" <blazemedia29@gmail.com>',
            to: email,
            subject: "Thank You for Subscribing to Sainath Estate",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                    <h2 style="color: #333;">Thank You for Connecting with Sainath Estate</h2>
                    <p>We appreciate your interest in Sainath Estate, Mumbai's trusted real estate firm since 1991.</p>
                    <p>From property buying and selling to leasing, resale, and investment consultation — we offer complete real estate solutions tailored to your needs.</p>
                    <p>📍 <strong>Office:</strong> Shop No. 2, Evershine Embassy CHS Ltd, Veera Desai Road, Andheri West, Mumbai - 400053<br>
                    📞 <strong>Phone:</strong> +91 98205 64265 / +91 99200 40440<br>
                    ✉️ <strong>Email:</strong> bunty@sainathestate.com<br>
                    🌐 <strong>Website:</strong> <a href="https://www.sainathestate.com" target="_blank">www.sainathestate.com</a></p>
                    <p style="margin-top: 20px;">We look forward to helping you find your perfect property.</p>
                    <p style="color: #888;">- Team Sainath Estate</p>
                </div>
            `
        });

        res.status(201).json({ message: "Subscribed successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Subscription failed" });
    }
});

// GET /api/newsletter - Admin only
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
