const express = require('express');
const {
  submitResponse,
  getSurveyResponses,
  getResponse
} = require('../CONTROLLERS/surveyResponseController');
const { protect, optionalAuth } = require('../MIDDLEWARE/authMiddleware');

const router = express.Router();

// Mixed routes - can be used with or without authentication
router.post('/', optionalAuth, submitResponse);

// Protected routes
router.get('/', protect, getSurveyResponses);
router.get('/:id', protect, getResponse);

module.exports = router;
