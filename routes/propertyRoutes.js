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

// ========== Multer Config (use same UPLOAD_DIR as server.js) ==========
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve(__dirname, '..', 'uploads');

// Make sure the folder exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Clean filename helper
const safeName = (name) =>
    name.trim()
        .replace(/[^\w.\-]+/g, '-') // keep alnum, dash, dot, underscore
        .replace(/-+/g, '-')
        .toLowerCase();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const base = file.originalname.replace(/\.[^/.]+$/, ''); // without ext
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${safeName(base)}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const ok = /image\/(png|jpe?g|webp|gif)/i.test(file.mimetype);
    cb(ok ? null : new Error('Only images are allowed'), ok);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

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
