const express = require('express');
const {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization
} = require('../CONTROLLERS/organizationController');
const { protect, admin } = require('../MIDDLEWARE/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getOrganizations);
router.get('/:id', getOrganization);

// Public route for creating organizations (temporarily public for initial setup)
router.post('/', createOrganization);

// Protected admin routes (for future use)
// router.post('/', protect, admin, createOrganization);
router.put('/:id', protect, admin, updateOrganization);
router.delete('/:id', protect, admin, deleteOrganization);

module.exports = router;
