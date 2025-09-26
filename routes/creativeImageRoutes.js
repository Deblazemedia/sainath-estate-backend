const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const cloudinary = require('../config/cloudinary'); // Import Cloudinary config
const { addCreative, getCreatives, updateCreative, deleteCreative } = require('../controllers/creativeController');

// 📦 Set up multer storage to keep images temporarily in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 📤 Upload with Image API
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, subTitle, publish } = req.body;

    // Check if the image file is provided
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      { folder: 'creatives' },
      (error, result) => {
        if (error) {
          return res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
        }

        const imagePath = result.secure_url;  // Get the secure URL from Cloudinary

        // Save creative data (including image URL)
        const creative = new Creative({
          title,
          subTitle,
          image: imagePath,
          publish: publish === 'true'  // Convert to boolean
        });

        creative.save()
          .then(saved => res.status(201).json(saved))
          .catch(err => res.status(500).json({ error: 'Failed to save creative image' }));
      }
    );

    req.file.stream.pipe(result); // Upload the image stream to Cloudinary

  } catch (err) {
    res.status(500).json({ error: 'Failed to upload creative image' });
  }
});

// Get all creatives
router.get('/', getCreatives);

// Update creative image by ID
router.put('/:id', updateCreative);

// Delete creative image by ID
router.delete('/:id', deleteCreative);

module.exports = router;
