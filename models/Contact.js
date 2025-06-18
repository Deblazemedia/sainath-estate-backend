const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
    status: {
        type: String,
        enum: ['new', 'contacted'],
        default: 'new'
    },
    // ✅ Property page association
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    propertyTitle: { type: String }
}, {
    timestamps: true
});


module.exports = mongoose.model('Contact', contactSchema);
