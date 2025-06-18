const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const emailRoutes = require('./routes/EmailRoute'); // ✅ path to your router fi

dotenv.config();
connectDB();

const app = express();

// ✅ Enable CORS for specific origins
const allowedOrigins = [
    'http://localhost:5000',
    'http://127.0.0.1:5500',  // For local HTML testing
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

// ✅ Serve uploaded image files from /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Root test route
app.get('/', (req, res) => {
    res.send('Sainath Estate Backend Running ✅');
});

// ✅ API Routes
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/creatives', require('./routes/creativeImageRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api', emailRoutes); // ✅ Prefixing with `/api`

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running at: http://localhost:${PORT}`);
});
