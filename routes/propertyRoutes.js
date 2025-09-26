const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
    addProperty,
    updateProperty,
    getAllProperties,
    getPropertyById,
    getRecentProperties,
    deleteProperty,
    viewAllProperties
} = require('../controllers/propertyController');

const verifyToken = require('../middleware/authMiddleware');

/* ================================
   ✅ Multer Config (Shared Upload Dir)
   ================================ */

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve(__dirname, '..', 'uploads');

// Ensure upload dir exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

/* ================================
   Routes
   ================================ */

// ========== Protected Routes ==========
router.post(
    '/',
    verifyToken,
    upload.fields([
        { name: 'slider_image', maxCount: 1 },
        { name: 'gallery', maxCount: 10 },
        { name: 'propertyBanner', maxCount: 5 }
    ]),
    addProperty
);

router.put(
    '/:id',
    verifyToken,
    upload.fields([
        { name: 'slider_image', maxCount: 1 },
        { name: 'gallery', maxCount: 10 },
        { name: 'propertyBanner', maxCount: 5 }
    ]),
    updateProperty
);

router.delete('/:id', verifyToken, deleteProperty);

// ========== Public Routes ==========
router.get('/', getAllProperties);
router.get('/view-all', viewAllProperties);
router.get('/recent', getRecentProperties);
router.get('/:id', getPropertyById);

module.exports = router;
