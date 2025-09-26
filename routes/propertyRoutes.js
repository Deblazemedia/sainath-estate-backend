const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
    addProperty,
    updateProperty,
    getAllProperties,
    getPropertyById,
    getRecentProperties,
    deleteProperty,
    viewAllProperties // ✅ Imported new controller
} = require('../controllers/propertyController');

const verifyToken = require('../middleware/authMiddleware');

// ========== Multer Config ==========
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Make sure this folder exists
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// ========== Protected Routes ==========
router.post(
    '/',
    verifyToken,
    upload.fields([
        { name: 'slider_image', maxCount: 1 },
        { name: 'gallery', maxCount: 10 },
        { name: 'propertyBanner', maxCount: 5 } // ✅ New
    ]),
    addProperty
);

router.put(
    '/:id',
    verifyToken,
    upload.fields([
        { name: 'slider_image', maxCount: 1 },
        { name: 'gallery', maxCount: 10 },
        { name: 'propertyBanner', maxCount: 5 } // ✅ New
    ]),
    updateProperty
);

router.delete('/:id', verifyToken, deleteProperty);

// ========== Public Routes ==========
router.get('/', getAllProperties);
router.get('/view-all', viewAllProperties); // ✅ New route to fetch ALL properties
router.get('/recent', getRecentProperties);
router.get('/:id', getPropertyById);

module.exports = router;
