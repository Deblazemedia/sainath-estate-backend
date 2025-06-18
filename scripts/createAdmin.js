const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const email = 'bunty@sainathestate.com';
  const plainPassword = 'sainathestate@2025'; // ✅ You can change this
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin already exists.');
    process.exit();
  }

  const admin = new User({
    name: 'Admin',
    email,
    password: hashedPassword,
    role: 'admin'
  });

  await admin.save();
  console.log('✅ Admin created successfully.');
  process.exit();
}).catch(err => {
  console.error('❌ DB connection failed:', err);
  process.exit(1);
});
