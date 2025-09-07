const Survey = require('../MODELS/surveyModel');
const UserProfile = require('../MODELS/userProfileModel');
const SurveyResponse = require('../MODELS/surveyResponseModel');
const asyncHandler = require('express-async-handler');

// @desc    Create a new survey
// @route   POST /api/surveys
// @access  Private
const createSurvey = asyncHandler(async (req, res) => {
  const { title, description, requires_organization, organization, questions } = req.body;
  
  // Create survey
  const survey = await Survey.create({
    title,
    description,
    creator: req.user.id,
    organization: organization || null,
    requiresOrganization: requires_organization || false,
    questions: questions.map(q => ({
      text: q.text,
      questionType: q.question_type,
      required: q.required || false,
      choices: q.choices ? q.choices.map(choice => ({
        text: choice.text
      })) : []
    }))
  });
  
  // Format the survey to include id for frontend consistency
  const surveyObject = survey.toObject();
  surveyObject.id = surveyObject._id;
  
  console.log('Created survey:', surveyObject);
  res.status(201).json(surveyObject);
});

// @desc    Get all surveys for logged in user
// @route   GET /api/surveys
// @access  Private
const getSurveys = asyncHandler(async (req, res) => {
  const surveys = await Survey.find({ creator: req.user.id })
    .populate('organization');
  
  // Get response counts for all surveys
  const surveysWithCounts = await Promise.all(surveys.map(async survey => {
    const surveyObject = survey.toObject();
    surveyObject.id = surveyObject._id; // Add id field for frontend consistency
    
    // Count responses for this survey
    const responseCount = await SurveyResponse.countDocuments({ survey: survey._id });
    surveyObject.responses_count = responseCount;
    
    // Add consistent date field names
    surveyObject.created_at = surveyObject.createdAt;
    surveyObject.is_active = surveyObject.isActive;
    surveyObject.requires_organization = surveyObject.requiresOrganization;
    
    return surveyObject;
  }));
  
  res.status(200).json(surveysWithCounts);
});

// @desc    Get single survey
// @route   GET /api/surveys/:id
// @access  Private
const getSurvey = asyncHandler(async (req, res) => {
  const survey = await Survey.findById(req.params.id);
  
  if (!survey) {
    res.status(404);
    throw new Error('Survey not found');
  }
  
  // Format survey to include id for consistency
  const surveyObject = survey.toObject();
  surveyObject.id = surveyObject._id; // Add id field for frontend consistency
  
  // Add consistent date field names
  surveyObject.created_at = surveyObject.createdAt;
  
  // Check if user is the creator
  if (survey.creator.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to access this survey');
  }
  
  // Count responses for this survey
  const responseCount = await SurveyResponse.countDocuments({ survey: survey._id });
  surveyObject.responses_count = responseCount;
  
  // Get response data for each question
  const responses = await SurveyResponse.find({ survey: survey._id });
  
  // Add response counts for each question
  if (surveyObject.questions && surveyObject.questions.length > 0) {
    surveyObject.questions = surveyObject.questions.map(question => {
      const questionResponses = responses.filter(response => 
        response.answers.some(answer => answer.question.toString() === question._id.toString())
      );
      
      question.response_count = questionResponses.length;
      return question;
    });
  }
  
  res.status(200).json(surveyObject);
});

// @desc    Update survey
// @route   PUT /api/surveys/:id
// @access  Private
const updateSurvey = asyncHandler(async (req, res) => {
  const { title, description, requires_organization, organization, is_active, questions } = req.body;
  
  const survey = await Survey.findById(req.params.id);
  
  if (!survey) {
    res.status(404);
    throw new Error('Survey not found');
  }
  
  // Check if user is the creator
  if (survey.creator.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this survey');
  }
  
  // Update basic fields
  survey.title = title || survey.title;
  survey.description = description || survey.description;
  survey.requiresOrganization = requires_organization !== undefined ? requires_organization : survey.requiresOrganization;
  survey.organization = organization !== undefined ? organization : survey.organization;
  survey.isActive = is_active !== undefined ? is_active : survey.isActive;
  
  // Update questions if provided
  if (questions && questions.length > 0) {
    survey.questions = questions.map(q => ({
      _id: q.id, // Keep existing ID if updating
      text: q.text,
      questionType: q.question_type,
      required: q.required || false,
      choices: q.choices ? q.choices.map(choice => ({
        _id: choice.id, // Keep existing ID if updating
        text: choice.text
      })) : []
    }));
  }
  
  // Save updated survey
  const updatedSurvey = await survey.save();
  
  // Format the survey to include id for frontend consistency
  const surveyObject = updatedSurvey.toObject();
  surveyObject.id = surveyObject._id;
  
  res.status(200).json(surveyObject);
});

// @desc    Delete survey
// @route   DELETE /api/surveys/:id
// @access  Private
const deleteSurvey = asyncHandler(async (req, res) => {
  const survey = await Survey.findById(req.params.id);
  
  if (!survey) {
    res.status(404);
    throw new Error('Survey not found');
  }
  
  // Check if user is the creator
  if (survey.creator.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete this survey');
  }
  
  await survey.deleteOne();
  
  res.status(204).end();
});

// @desc    Get public survey for responses
// @route   GET /api/surveys/:creatorId/:surveyId/public
// @access  Public
const getPublicSurvey = asyncHandler(async (req, res) => {
  const { creatorId, surveyId } = req.params;
  
  try {
    const survey = await Survey.findOne({
      _id: surveyId,
      creator: creatorId
    }).populate('organization');
    
    if (!survey) {
      res.status(404);
      throw new Error('Survey not found');
    }
    
    // Check if the survey is inactive
    if (!survey.isActive) {
      return res.status(403).json({ error: 'Form currently unavailable' });
    }
    
    // If survey requires organization membership and this is an authenticated request
    if (req.user && survey.requiresOrganization && survey.organization) {
      // Get user's organization
      const userProfile = await UserProfile.findOne({ user: req.user.id }).populate('organization');
      
      // Check if user belongs to the required organization
      if (!userProfile || !userProfile.organization || 
          userProfile.organization._id.toString() !== survey.organization._id.toString()) {
        return res.status(403).json({ error: 'Not authorized to access this survey. This survey is only available to members of the same organization.' });
      }
    }
    
    // Map the survey data to match frontend expectations
    const formattedSurvey = {
      id: survey._id,
      title: survey.title,
      description: survey.description,
      creator: survey.creator,
      organization: survey.organization,
      is_active: survey.isActive,
      requires_organization: survey.requiresOrganization,
      created_at: survey.createdAt,
      updated_at: survey.updatedAt,
      questions: survey.questions.map(question => ({
        id: question._id,
        text: question.text,
        question_type: question.questionType,
        required: question.required,
        choices: question.choices.map(choice => ({
          id: choice._id,
          text: choice.text
        }))
      }))
    };
    
    res.status(200).json(formattedSurvey);
  } catch (error) {
    console.error('Error fetching public survey:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve survey',
      details: error.message 
    });
  }
});

// @desc    Get surveys from user's organization
// @route   GET /api/surveys/organization-surveys
// @access  Private
const getOrganizationSurveys = asyncHandler(async (req, res) => {
  // Get user's organization
  const userProfile = await UserProfile.findOne({ user: req.user.id }).populate('organization');
  
  if (!userProfile || !userProfile.organization) {
    return res.status(200).json([]);
  }
  
  // Find all surveys from the same organization
  const surveys = await Survey.find({
    organization: userProfile.organization._id,
    isActive: true
  }).populate('creator', 'username email')
    .populate('organization');
  
  // Format surveys to include id for consistency and match frontend expectations
  const formattedSurveys = surveys.map(survey => {
    const surveyObject = survey.toObject();
    surveyObject.id = surveyObject._id;
    surveyObject.created_at = surveyObject.createdAt;
    surveyObject.updated_at = surveyObject.updatedAt;
    surveyObject.is_active = surveyObject.isActive;
    surveyObject.requires_organization = surveyObject.requiresOrganization;
    
    // Remove duplicate data
    delete surveyObject._id;
    
    return surveyObject;
  });
  
  res.status(200).json(formattedSurveys);
});

// @desc    Get all public surveys (not requiring organization)
// @route   GET /api/surveys/public
// @access  Private
const getPublicSurveys = asyncHandler(async (req, res) => {
  try {
    // Get all public surveys (active and not requiring organization)
    const surveys = await Survey.find({
      isActive: true,
      requiresOrganization: false
    }).populate('creator', 'username email')
      .populate('organization');
    
    // Format surveys to match frontend expectations
    const formattedSurveys = surveys.map(survey => {
      const surveyObject = survey.toObject();
      surveyObject.id = surveyObject._id;
      surveyObject.created_at = surveyObject.createdAt;
      surveyObject.updated_at = surveyObject.updatedAt;
      surveyObject.is_active = surveyObject.isActive;
      surveyObject.requires_organization = surveyObject.requiresOrganization;
      
      // Remove duplicate data
      delete surveyObject._id;
      
      return surveyObject;
    });
    
    res.status(200).json(formattedSurveys);
  } catch (error) {
    console.error('Error fetching public surveys:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve public surveys',
      details: error.message 
    });
  }
});

module.exports = {
  createSurvey,
  getSurveys,
  getSurvey,
  updateSurvey,
  deleteSurvey,
  getPublicSurvey,
  getPublicSurveys,
  getOrganizationSurveys
};
