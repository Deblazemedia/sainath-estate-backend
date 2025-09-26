const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const emailRoutes = require('./routes/EmailRoute');
const popupFormRoutes = require('./routes/popupFormRoutes');

dotenv.config();
connectDB();

const app = express();

// ✅ Enable CORS for specific origins
const allowedOrigins = [
    'http://localhost:5000',
    'http://127.0.0.1:5500', // For local HTML testing
    'http://127.0.0.1:5501',
    'https://sainathestate.com'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

/* ================================
   ✅ Static uploads (Volume + Legacy)
   ================================ */

// Canonical uploads dir (set this in Railway → Variables: UPLOAD_DIR=/data/uploads)
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve(__dirname, 'uploads');

// Ensure canonical dir exists (safe in dev)
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Serve Volume (or canonical) first
app.use('/uploads', express.static(UPLOAD_DIR, {
    maxAge: '30d',
    etag: true,
    fallthrough: true // let legacy mounts handle misses
}));

// Serve legacy folder inside backend (earlier files committed to repo)
const LEGACY_BACKEND_UPLOADS = path.resolve(__dirname, 'uploads');
app.use('/uploads', express.static(LEGACY_BACKEND_UPLOADS, {
    maxAge: '30d',
    etag: true,
    fallthrough: true
}));

// Serve legacy root-level uploads (old multer 'uploads/' at project root)
const LEGACY_ROOT_UPLOADS = path.resolve(__dirname, '..', 'uploads');
app.use('/uploads', express.static(LEGACY_ROOT_UPLOADS, {
    maxAge: '30d',
    etag: true
}));

// (Optional) quick debug to see where files are — remove after verifying
// app.get('/debug/where', (req, res) => {
//   const dirs = [UPLOAD_DIR, LEGACY_BACKEND_UPLOADS, LEGACY_ROOT_UPLOADS];
//   const out = dirs.map(d => {
//     try { return { dir: d, exists: true, sample: fs.readdirSync(d).slice(0, 10) }; }
//     catch (e) { return { dir: d, exists: false, error: e.message }; }
//   });
//   res.json(out);
// });

/* ================================
   Routes
   ================================ */

// ✅ Root test route
app.get('/', (req, res) => {
    res.send('Sainath Estate Backend Running ✅');
});

// ✅ API Routes
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/creatives', require('./routes/creativeImageRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api', emailRoutes);
app.use('/api', popupFormRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running at: http://localhost:${PORT}`);
});
