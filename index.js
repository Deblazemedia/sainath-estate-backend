const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const emailRoutes = require('./routes/EmailRoute');
const popupFormRoutes = require('./routes/popupFormRoutes');

dotenv.config();
connectDB();

const app = express();

// CORS
const allowedOrigins = [
    'http://localhost:5000',
    'http://127.0.0.1:5500',
    'http://127.0.0.1:5501',
    'http://localhost:3000',
    'https://sainathestate.com',
    'https://www.sainathestate.com'
];

app.use(cors({
    origin(origin, cb) {
        if (!origin || allowedOrigins.includes(origin)) cb(null, true);
        else cb(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

// ✅ Serve uploads from a **shared** directory (persistent across releases)
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(UPLOADS_DIR, { fallthrough: true }));

app.get('/', (req, res) => {
    res.send('Sainath Estate Backend Running ✅');
});

// APIs
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/creatives', require('./routes/creativeImageRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api', emailRoutes);
app.use('/api', popupFormRoutes);

// ❌ Remove this duplicate line (and it’s after listen):
// app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running at: http://localhost:${PORT}`);
});
