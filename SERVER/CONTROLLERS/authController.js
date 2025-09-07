const User = require('../MODELS/userModel');
const UserProfile = require('../MODELS/userProfileModel');
const Organization = require('../MODELS/organizationModel');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, password2, organization_id } = req.body;

  if (password !== password2) {
    res.status(400);
    throw new Error('Passwords do not match');
  }

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password
  });

  // Create profile
  const profileData = {
    user: user._id
  };

  if (organization_id) {
    const organization = await Organization.findById(organization_id);
    if (!organization) {
      res.status(400);
      throw new Error('Organization not found');
    }
    profileData.organization = organization_id;
  }

  await UserProfile.create(profileData);

  if (user) {
    const accessToken = user.getSignedJwtToken();
    const refreshToken = user.getRefreshToken();

    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
      access: accessToken,
      refresh: refreshToken
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Get user profile with organization
  const profile = await UserProfile.findOne({ user: user._id }).populate('organization');

  const accessToken = user.getSignedJwtToken();
  const refreshToken = user.getRefreshToken();

  res.status(200).json({
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      profile: profile ? {
        id: profile._id,
        organization: profile.organization,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      } : null
    },
    access: accessToken,
    refresh: refreshToken
  });
});

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
  const { refresh } = req.body;

  if (!refresh) {
    res.status(400);
    throw new Error('Refresh token is required');
  }

  try {
    // Verify token
    const decoded = jwt.verify(refresh, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401);
      throw new Error('Invalid token');
    }

    const accessToken = user.getSignedJwtToken();

    res.status(200).json({
      access: accessToken
    });
  } catch (err) {
    res.status(401);
    throw new Error('Invalid token');
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  // req.user is set by the auth middleware
  const user = await User.findById(req.user.id);
  const profile = await UserProfile.findOne({ user: req.user.id }).populate('organization');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    id: user._id,
    username: user.username,
    email: user.email,
    profile: profile ? {
      id: profile._id,
      organization: profile.organization,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    } : null
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  // Find user
  const user = await User.findById(req.user.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Update user fields
  if (req.body.username) {
    user.username = req.body.username;
  }

  if (req.body.email) {
    // Check if email is already in use
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser && existingUser._id.toString() !== req.user.id) {
      res.status(400);
      throw new Error('Email already in use');
    }
    user.email = req.body.email;
  }

  // Save user
  await user.save();

  // Find and update profile if needed
  let profile = await UserProfile.findOne({ user: req.user.id });
  
  if (req.body.organization_id) {
    const organization = await Organization.findById(req.body.organization_id);
    if (!organization) {
      res.status(400);
      throw new Error('Organization not found');
    }
    
    if (!profile) {
      profile = await UserProfile.create({
        user: req.user.id,
        organization: req.body.organization_id
      });
    } else {
      profile.organization = req.body.organization_id;
      await profile.save();
    }
  }

  // Refresh profile data
  profile = await UserProfile.findOne({ user: req.user.id }).populate('organization');

  res.status(200).json({
    id: user._id,
    username: user.username,
    email: user.email,
    profile: profile ? {
      id: profile._id,
      organization: profile.organization,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    } : null
  });
});

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  getProfile,
  updateProfile
};
