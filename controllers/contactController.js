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

        // Email Transporter Setup
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'blazemedia29@gmail.com',
                pass: 'lzzf nzsr daaf joma'
            }
        });

        // Admin notification
        await transporter.sendMail({
            from: `"Website Contact" <blazemedia29@gmail.com>`,
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
        });

        // Auto-reply to user
        await transporter.sendMail({
            from: '"Sainath Estate" <blazemedia29@gmail.com>',
            to: email,
            subject: "Thank You for Contacting Sainath Estate",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                    <h2 style="color: #333;">Thank You, ${name}</h2>
                    <p>We’ve received your message and our team at <strong>Sainath Estate</strong> will get back to you shortly.</p>
                    <p>Established in 1991, Sainath Estate is Mumbai’s trusted partner for residential and commercial real estate. Whether you’re buying, renting, investing, or selling — we’re here to assist every step of the way.</p>
                    <p>📍 <strong>Office:</strong> Shop No. 2, Evershine Embassy CHS Ltd, Veera Desai Road, Andheri West, Mumbai - 400053<br>
                    📞 <strong>Phone:</strong> +91 98205 64265 / +91 99200 40440<br>
                    ✉️ <strong>Email:</strong> bunty@sainathestate.com<br>
                    🌐 <strong>Website:</strong> <a href="https://www.sainathestate.com" target="_blank">www.sainathestate.com</a></p>
                    <p style="margin-top: 20px;">We appreciate your trust and look forward to helping you soon.</p>
                    <p style="color: #888;">- Team Sainath Estate</p>
                </div>
            `
        });

        res.status(201).json({ message: 'Message submitted and emails sent successfully', data: saved });

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
