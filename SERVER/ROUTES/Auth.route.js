const express = require('express');
const { 
  registerUser, 
  loginUser, 
  refreshToken, 
  getProfile,
  updateProfile 
} = require('../CONTROLLERS/authController');
const { protect } = require('../MIDDLEWARE/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
