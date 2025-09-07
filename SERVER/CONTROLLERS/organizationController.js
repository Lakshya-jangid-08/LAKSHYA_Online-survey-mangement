const Organization = require('../MODELS/organizationModel');
const asyncHandler = require('express-async-handler');

// @desc    Get all organizations
// @route   GET /api/organizations
// @access  Public
const getOrganizations = asyncHandler(async (req, res) => {
  try {
    const organizations = await Organization.find();
    
    // Map to format expected by frontend (with id property instead of _id)
    const formattedOrganizations = organizations.map(org => ({
      id: org._id,
      _id: org._id, // Keep _id also for compatibility
      name: org.name,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt
    }));
    
    res.status(200).json(formattedOrganizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ message: 'Failed to fetch organizations', error: error.message });
  }
});

// @desc    Get single organization
// @route   GET /api/organizations/:id
// @access  Public
const getOrganization = asyncHandler(async (req, res) => {
  const organization = await Organization.findById(req.params.id);
  
  if (!organization) {
    res.status(404);
    throw new Error('Organization not found');
  }
  
  res.status(200).json(organization);
});

// @desc    Create organization
// @route   POST /api/organizations
// @access  Private/Admin
const createOrganization = asyncHandler(async (req, res) => {
  const { name } = req.body;
  
  // Check if organization with same name exists
  const existingOrganization = await Organization.findOne({ name });
  if (existingOrganization) {
    res.status(400);
    throw new Error('Organization with this name already exists');
  }
  
  const organization = await Organization.create({
    name
  });
  
  res.status(201).json(organization);
});

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Private/Admin
const updateOrganization = asyncHandler(async (req, res) => {
  const { name } = req.body;
  
  let organization = await Organization.findById(req.params.id);
  
  if (!organization) {
    res.status(404);
    throw new Error('Organization not found');
  }
  
  // Check if another organization with the same name exists
  if (name && name !== organization.name) {
    const existingOrganization = await Organization.findOne({ name });
    if (existingOrganization) {
      res.status(400);
      throw new Error('Organization with this name already exists');
    }
  }
  
  organization.name = name || organization.name;
  organization.updatedAt = Date.now();
  
  await organization.save();
  
  res.status(200).json(organization);
});

// @desc    Delete organization
// @route   DELETE /api/organizations/:id
// @access  Private/Admin
const deleteOrganization = asyncHandler(async (req, res) => {
  const organization = await Organization.findById(req.params.id);
  
  if (!organization) {
    res.status(404);
    throw new Error('Organization not found');
  }
  
  await organization.deleteOne();
  
  res.status(200).json({ success: true, message: 'Organization removed' });
});

module.exports = {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization
};
