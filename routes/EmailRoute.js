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
                <div style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #f9f9f9; padding: 30px; border-radius: 1px; box-shadow: 0 0 10px rgba(0,0,0,0.05); color: #333;">
    <h2 style="color: #1e1e1e; font-size: 24px; border-bottom: 2px solid #d1d1d1; padding-bottom: 10px;">Thank You for Connecting with Sainath Estate</h2>

    <p style="font-size: 16px; line-height: 1.6;">We truly appreciate your interest in Sainath Estate — Mumbai’s trusted name in real estate since 1991.</p>

    <p style="font-size: 16px; line-height: 1.6;">Whether you're buying, selling, renting, or investing — we provide comprehensive real estate services that prioritize your goals and peace of mind.</p>

    <div style="margin-top: 20px; font-size: 15px; line-height: 1.6;">
        📍 <strong>Office:</strong> Shop No. 2, Evershine Embassy CHS Ltd, Veera Desai Road, Andheri West, Mumbai - 400053<br>
        📞 <strong>Phone:</strong> +91 98205 64265 / +91 99200 40440<br>
        ✉️ <strong>Email:</strong> <a href="mailto:bunty@sainathestate.com" style="color: #0066cc;">bunty@sainathestate.com</a><br>
        🌐 <strong>Website:</strong> <a href="https://www.sainathestate.com" target="_blank" style="color: #0066cc;">www.sainathestate.com</a>
    </div>

    <div style="margin-top: 30px;">
        <p style="font-size: 16px;">Follow us for updates, listings & property insights:</p>
        <a href="https://www.instagram.com/sainathestate/" target="_blank" style="text-decoration: none; margin-right: 10px;">
            <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="24" style="vertical-align: middle;" alt="Instagram">
            <span style="margin-left: 5px; color: #E1306C;">Instagram</span>
        </a>
        <a href="https://www.facebook.com/sainathestates" target="_blank" style="text-decoration: none; margin-left: 20px;">
            <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="24" style="vertical-align: middle;" alt="Facebook">
            <span style="margin-left: 5px; color: #3b5998;">Facebook</span>
        </a>
    </div>

    <p style="margin-top: 30px; color: #777;">We look forward to helping you find your perfect property.<br>
    <strong>- Team Sainath Estate</strong></p>
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
