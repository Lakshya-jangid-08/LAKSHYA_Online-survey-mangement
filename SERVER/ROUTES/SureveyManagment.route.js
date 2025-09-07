const express = require('express');
const {
  createSurvey,
  getSurveys,
  getSurvey,
  updateSurvey,
  deleteSurvey,
  getPublicSurvey,
  getPublicSurveys,
  getOrganizationSurveys
} = require('../CONTROLLERS/surveyController');
const { protect, optionalAuth } = require('../MIDDLEWARE/authMiddleware');

const router = express.Router();

// Protected routes
router.post('/', protect, createSurvey);
router.get('/', protect, getSurveys);
router.get('/public', protect, getPublicSurveys); // Get all public surveys
router.get('/organization-surveys', protect, getOrganizationSurveys); // Get organization-specific surveys
router.get('/:id', protect, getSurvey);
router.put('/:id', protect, updateSurvey);
router.delete('/:id', protect, deleteSurvey);

// Public routes with optional auth
router.get('/:creatorId/:surveyId/public', optionalAuth, getPublicSurvey);

module.exports = router;
