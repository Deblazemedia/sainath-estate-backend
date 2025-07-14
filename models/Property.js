const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    propertyBanner: [String], // multiple banner images
    title: String,
    description: String,
    price: Number,
    location: String,
    type: String, // e.g., 1BHK, Plot
    status: { type: String, enum: ['available', 'sold', 'pending'], default: 'available' },
    listingType: { type: String, enum: ['buy', 'rent'], required: true }, // 👈 New
    category: { type: String, enum: ['luxury', 'commercial'], required: true }, // 👈 New
    amenities: [String],
    gallery: [String],
    slider_image: String, // 👈 Add this line in schema
    reraNumber: String,
    floorPlans: [String],
    createdAt: { type: Date, default: Date.now },
    status: { type: String, default: "draft" } // Default is now 'draft'

});

module.exports = mongoose.model('Property', propertySchema);
