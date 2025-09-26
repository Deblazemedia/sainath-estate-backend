require('dotenv').config(); // Ensure this is called once in your app

const twilio = require('twilio');
const Contact = require('../models/Contact');

// Twilio config from environment
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;
const whatsappTo = process.env.TWILIO_WHATSAPP_TO;

const client = twilio(accountSid, authToken);

// Submit contact (public)
const submitContact = async (req, res) => {
    try {
        const { name, email, phone, message, propertyId, propertyTitle } = req.body;

        const newMessage = new Contact({
            name,
            email,
            phone,
            message,
            status: 'new',
            title: propertyId || null,
            propertyTitle: propertyTitle || null
        });

        const saved = await newMessage.save();

        // Construct property link if ID exists
        const propertyUrl = propertyId
            ? `https://sainathestate.com/property-details.html?id=${propertyId}`
            : null;

        // WhatsApp text
        const text = `
📩 *New Inquiry from Website*
*Name:* ${name}
*Email:* ${email}
*Phone:* ${phone}
*Message:* ${message}
${propertyId ? `*Property ID:* ${propertyId}` : ''}
${propertyTitle ? `*Property Title:* ${propertyTitle}` : ''}
${propertyUrl ? `*Link:* ${propertyUrl}` : ''}
    `;

        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TO, // bunty + blazemedia
            subject: `New Inquiry${propertyTitle ? `: ${propertyTitle}` : ''}`,
            html: `
        <h3>New Inquiry from Website</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong> ${message}</p>
        ${propertyId ? `<p><strong>Property ID:</strong> ${propertyId}</p>` : ""}
        ${propertyTitle ? `<p><strong>Property Title:</strong> ${propertyTitle}</p>` : ""}
        ${propertyUrl ? `<p><strong>Property Link:</strong> <a href="${propertyUrl}" target="_blank">${propertyUrl}</a></p>` : ""}
      `
        };

        // Send notifications in parallel
        await Promise.all([
            client.messages.create({ body: text, from: whatsappFrom, to: whatsappTo }),
            mailTransporter.sendMail(mailOptions)
        ]);

        res.status(201).json({ message: 'Submitted, WhatsApp + Email sent', data: saved });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to submit or send notifications' });
    }
};



// Get all (admin only) + filtering + pagination
const getAllContacts = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const query = {};
        if (status && status !== 'not-read') {
            query.status = status;
        }

        const messages = await Contact.find(query)
            .sort({ createdAt: -1 })
            .skip(Number(skip))
            .limit(Number(limit));

        const now = new Date();
        const result = messages.map(msg => {
            const ageInDays = Math.floor((now - new Date(msg.createdAt)) / (1000 * 60 * 60 * 24));
            let derivedStatus = msg.status;
            if (msg.status === 'new' && ageInDays > 7) {
                derivedStatus = 'not-read';
            }
            return {
                ...msg._doc,
                derivedStatus
            };
        });

        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

// Mark message as contacted
const markContacted = async (req, res) => {
    try {
        const updated = await Contact.findByIdAndUpdate(
            req.params.id,
            { status: 'contacted' },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: "Message not found" });
        res.status(200).json({ message: "Marked as contacted", data: updated });
    } catch (err) {
        res.status(500).json({ error: "Failed to update status" });
    }
};

// ❌ Delete contact message
const deleteContact = async (req, res) => {
    try {
        const deleted = await Contact.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Message not found" });
        res.status(200).json({ message: "Message deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete message" });
    }
};

module.exports = {
    submitContact,
    getAllContacts,
    markContacted,
    deleteContact
};
