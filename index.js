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

// ✅ CORS
const allowedOrigins = [
    'http://localhost:5000',
    'http://127.0.0.1:5500', // local HTML testing
    'http://127.0.0.1:5501',
    'https://sainathestate.com'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

// ✅ Unified, absolute uploads directory (env override supports Railway Volume)
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve(__dirname, 'uploads');

// Ensure folder exists (safe on boot and in dev)
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ✅ Serve uploaded files (mount once, before routes)
app.use('/uploads', express.static(UPLOAD_DIR, {
    maxAge: '30d',
    etag: true
}));

// ✅ Optional: quick debug to verify files exist in prod
// app.get('/debug/uploads', (req, res) => {
//   fs.readdir(UPLOAD_DIR, (err, files) => res.json({
//     servingFrom: UPLOAD_DIR,
//     ok: !err,
//     error: err?.message,
//     files
//   }));
// });

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
