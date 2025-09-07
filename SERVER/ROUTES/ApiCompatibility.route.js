const express = require('express');
const { getPublicSurvey } = require('../CONTROLLERS/surveyController');
const { optionalAuth } = require('../MIDDLEWARE/authMiddleware');

const router = express.Router();

// Route to match frontend expectation
router.get('/surveys/:creatorId/:surveyId/', optionalAuth, getPublicSurvey);

module.exports = router;
