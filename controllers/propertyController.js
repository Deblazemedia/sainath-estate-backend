const Property = require('../models/Property');
const path = require('path');

// 💡 Price formatting utility
const formatPrice = (price) => {
    if (!price || isNaN(price)) return "";
    if (price >= 10000000) {
        return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
        return `₹${(price / 100000).toFixed(2)} Lakh`;
    } else {
        return `₹${price}`;
    }
};

// Add new property with uploaded images
const addProperty = async (req, res) => {
    try {
        const { body, files } = req;

        const sliderImage = files?.slider_image?.[0]?.filename || null;
        const galleryImages = files?.gallery?.map(file => file.filename) || [];
        const bannerImages = files?.propertyBanner?.map(file => file.filename) || [];

        // enum checks
        const validStatuses = ['available', 'sold', 'pending'];
        const validListingTypes = ['buy', 'rent'];
        const validCategories = ['luxury', 'commercial'];

        const propertyData = {
            ...body,
            slider_image: sliderImage,
            gallery: galleryImages,
            propertyBanner: bannerImages,
            status: validStatuses.includes(body.status) ? body.status : 'available',
            listingType: validListingTypes.includes(body.listingType) ? body.listingType : null,
            category: validCategories.includes(body.category) ? body.category : null
        };

        if (!propertyData.listingType || !propertyData.category) {
            return res.status(400).json({ error: "Invalid listingType or category" });
        }

        if (propertyData.price) {
            propertyData.price = Number(propertyData.price);
        }

        const property = new Property(propertyData);
        const saved = await property.save();

        res.status(201).json({
            ...saved._doc,
            formattedPrice: formatPrice(saved.price)
        });
    } catch (err) {
        console.error("Add Property Error:", err);
        res.status(500).json({ error: "Failed to add property" });
    }
};


// Update existing property with image update
const updateProperty = async (req, res) => {
    try {
        const { body, files } = req;

        const validStatuses = ['available', 'sold', 'pending'];
        const validListingTypes = ['buy', 'rent'];
        const validCategories = ['luxury', 'commercial'];

        let updateData = {
            ...body,
            status: validStatuses.includes(body.status) ? body.status : 'available',
            listingType: validListingTypes.includes(body.listingType) ? body.listingType : null,
            category: validCategories.includes(body.category) ? body.category : null
        };

        if (!updateData.listingType || !updateData.category) {
            return res.status(400).json({ error: "Invalid listingType or category" });
        }

        if (files?.slider_image?.[0]) {
            updateData.slider_image = files.slider_image[0].filename;
        }

        if (files?.gallery?.length > 0) {
            updateData.gallery = files.gallery.map(file => file.filename);
        }

        if (files?.propertyBanner?.length > 0) {
            updateData.propertyBanner = files.propertyBanner.map(file => file.filename);
        }

        if (updateData.price) updateData.price = Number(updateData.price);

        const updated = await Property.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        if (!updated) return res.status(404).json({ error: "Property not found" });

        res.status(200).json({
            ...updated._doc,
            formattedPrice: formatPrice(updated.price)
        });
    } catch (err) {
        console.error("Update Property Error:", err);
        res.status(500).json({ error: "Failed to update property" });
    }
};


// View all properties (no filter, no pagination)
const viewAllProperties = async (req, res) => {
    try {
        const allProperties = await Property.find().sort({ createdAt: -1 });

        const formatted = allProperties.map(p => ({
            ...p._doc,
            formattedPrice: formatPrice(p.price)
        }));

        res.status(200).json(formatted);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch all properties" });
    }
};

// Get all / filter
const getAllProperties = async (req, res) => {
    try {
        const {
            location,
            category,
            offer,
            type,
            page = 1,
            limit = 10
        } = req.query;

        let filter = {};
        let sort = { createdAt: -1 };

        if (location) {
            filter.location = { $regex: location, $options: 'i' };
        }

        if (category) {
            filter.category = category;
        }

        if (type) {
            filter.type = type;
        }

        if (offer === 'latest') {
            sort = { createdAt: -1 };
        }

        const skip = (page - 1) * limit;

        const total = await Property.countDocuments(filter);
        const properties = await Property.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        const formatted = properties.map(p => ({
            ...p._doc,
            formattedPrice: formatPrice(p.price)
        }));

        res.status(200).json({
            total,
            currentPage: Number(page),
            totalPages: Math.ceil(total / limit),
            properties: formatted
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch properties" });
    }
};

// Get single by ID
const getPropertyById = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) return res.status(404).json({ error: "Property not found" });

        res.status(200).json({
            ...property._doc,
            formattedPrice: formatPrice(property.price)
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch property" });
    }
};

// Get recent properties
const getRecentProperties = async (req, res) => {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const recent = await Property.find({ createdAt: { $gte: oneWeekAgo } })
            .sort({ createdAt: -1 })
            .limit(5);

        const formatted = recent.map(p => ({
            ...p._doc,
            formattedPrice: formatPrice(p.price)
        }));

        res.status(200).json(formatted);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch recent properties" });
    }
};

// Delete property by ID
const deleteProperty = async (req, res) => {
    try {
        const deleted = await Property.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Property not found" });
        res.status(200).json({ message: "Property deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete property" });
    }
};

module.exports = {
    addProperty,
    updateProperty,
    getAllProperties,
    getPropertyById,
    getRecentProperties,
    deleteProperty,
    viewAllProperties
};
