// models/PopupForm.js
const mongoose = require('mongoose');

const popupFormSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    pincode: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('PopupForm', popupFormSchema);
