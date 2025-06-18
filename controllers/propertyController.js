const Property = require('../models/Property');
const path = require('path');

// Add new property with uploaded images
const addProperty = async (req, res) => {
    try {
        const { body, files } = req;

        const sliderImage = files?.slider_image?.[0]?.filename || null;
        const galleryImages = files?.gallery?.map(file => file.filename) || [];
        const bannerImages = files?.propertyBanner?.map(file => file.filename) || [];

        const propertyData = {
            ...body,
            slider_image: sliderImage,
            gallery: galleryImages,
            propertyBanner: bannerImages
        };

        // Convert price to number
        if (propertyData.price) propertyData.price = Number(propertyData.price);

        const property = new Property(propertyData);
        const saved = await property.save();

        res.status(201).json(saved);
    } catch (err) {
        console.error("Add Property Error:", err);
        res.status(500).json({ error: "Failed to add property" });
    }
};

// Update existing property with image update
const updateProperty = async (req, res) => {
    try {
        const { body, files } = req;

        let updateData = { ...body };

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

        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ error: "Failed to update property" });
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

        res.status(200).json({
            total,
            currentPage: Number(page),
            totalPages: Math.ceil(total / limit),
            properties
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
        res.status(200).json(property);
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

        res.status(200).json(recent);
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
    deleteProperty
};
