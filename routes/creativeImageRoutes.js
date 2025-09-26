const express = require('express');
const router = express.Router();
const {
  addCreative,
  getCreatives,
  updateCreative,
  deleteCreative
} = require('../controllers/creativeImageController');

const verifyToken = require('../middleware/authMiddleware');

// Protected routes
router.post('/', verifyToken, addCreative);
router.put('/:id', verifyToken, updateCreative);
router.delete('/:id', verifyToken, deleteCreative);

// Public route
router.get('/', getCreatives);

module.exports = router;
