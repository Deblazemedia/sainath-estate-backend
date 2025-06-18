const nodemailer = require('nodemailer');
const Contact = require('../models/Contact'); // your Mongoose model

// Submit contact (public)
const submitContact = async (req, res) => {
    try {
        const { name, email, phone, message, propertyId, propertyTitle } = req.body;

        // Save to database
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

        // Email Transporter Setup (Use Gmail or SMTP)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'blazemedia29@gmail.com',
                pass: 'lzzf nzsr daaf joma'  // Use App Password, not your Gmail password
            }
        });

        
        // Email format
        const mailOptions = {
            from: `"Website Contact" <your-email@gmail.com>`,
            to: 'blazemedia29@gmail.com',
            subject: 'New Contact Inquiry from Website',
            html: `
                <h2>New Message Received</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Message:</strong> ${message}</p>
                ${propertyTitle ? `<p><strong>Property:</strong> ${propertyTitle}</p>` : ''}
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: 'Message submitted and emailed successfully', data: saved });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to submit or send message' });
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
