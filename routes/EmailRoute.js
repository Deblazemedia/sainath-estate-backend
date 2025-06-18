const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const Newsletter = require('../models/Newsletter'); // Mongoose model

// Google Sheets Setup
const auth = new google.auth.GoogleAuth({
    keyFile: 'google-credentials.json', // 🔐 Your service account JSON file
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheetId = '1u1K6u1L2fQjO5Z82S-xRWr9iy3x8p-Td6O0LpQzi8-4';

router.post('/newsletter', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
        // 1. Save to MongoDB
        const existing = await Newsletter.findOne({ email });
        if (!existing) await new Newsletter({ email }).save();

        // 2. Save to Google Sheet
        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });
        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'Sheet1!A1',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[email, new Date().toLocaleString()]]
            }
        });

        res.status(201).json({ message: "Subscribed successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Subscription failed" });
    }
});

module.exports = router;
