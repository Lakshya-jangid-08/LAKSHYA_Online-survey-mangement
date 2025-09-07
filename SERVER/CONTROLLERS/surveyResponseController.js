const Survey = require('../MODELS/surveyModel');
const SurveyResponse = require('../MODELS/surveyResponseModel');
const UserProfile = require('../MODELS/userProfileModel');
const asyncHandler = require('express-async-handler');

// @desc    Submit survey response
// @route   POST /api/survey-responses
// @access  Mixed (Public/Private depending on survey)
const submitResponse = asyncHandler(async (req, res) => {
  console.log('Received survey response submission:', req.body);
  const { survey: surveyId, answers } = req.body;
  
  try {
    // Find survey
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ detail: 'Survey not found' });
    }
    
    // Check if survey is active
    if (!survey.isActive) {
      return res.status(400).json({ detail: 'Survey is not active' });
    }
    
    // Check organization requirement if authenticated
    if (survey.requiresOrganization && req.user) {
      const userProfile = await UserProfile.findOne({ user: req.user.id });
      
      if (!userProfile || !userProfile.organization || 
          (survey.organization && userProfile.organization.toString() !== survey.organization.toString())) {
        return res.status(403).json({ detail: 'You are not authorized to submit responses to this survey' });
      }
    }
    
    // Validate answers
    try {
      validateSurveyAnswers(survey, answers);
    } catch (validationError) {
      return res.status(400).json({ 
        detail: validationError.message,
        field: validationError.field
      });
    }
    
    // Log the incoming answers for debugging
    console.log('Processing survey response for survey:', surveyId);
    console.log('Incoming answers:', answers);
    
    // Create response with more robust field handling
    const response = await SurveyResponse.create({
      survey: surveyId,
      respondent: req.user ? req.user.id : null,
      answers: answers.map(answer => ({
        question: answer.question,
        textAnswer: answer.text_answer || answer.textAnswer || null,
        selectedChoices: answer.selected_choices || answer.selectedChoices || []
      }))
    });
    
    console.log('Survey response created:', response._id);
    
    res.status(201).json({ detail: 'Response submitted successfully' });
  } catch (error) {
    console.error('Error submitting survey response:', error);
    res.status(500).json({ 
      detail: 'Failed to submit survey response',
      error: error.message 
    });
  }
});

// Helper function to validate answers
const validateSurveyAnswers = (survey, answers) => {
  // Map questions by ID for easy lookup
  const questionsMap = new Map();
  survey.questions.forEach(question => {
    questionsMap.set(question._id.toString(), question);
  });
  
  // Check all required questions have answers
  const requiredQuestions = survey.questions.filter(q => q.required);
  const answeredQuestionIds = answers.map(a => a.question);
  
  console.log('Required questions:', requiredQuestions.map(q => ({id: q._id, text: q.text})));
  console.log('Answered question IDs:', answeredQuestionIds);
  
  for (const requiredQuestion of requiredQuestions) {
    const questionId = requiredQuestion._id.toString();
    if (!answeredQuestionIds.includes(questionId)) {
      const error = new Error(`Question "${requiredQuestion.text}" is required`);
      error.statusCode = 400;
      error.field = `question_${questionId}`;
      throw error;
    }
  }
  
  // Validate each answer
  for (const answer of answers) {
    const question = questionsMap.get(answer.question);
    if (!question) {
      const error = new Error(`Question not found in survey`);
      error.statusCode = 400;
      error.field = 'general';
      throw error;
    }
    
    // Validate based on question type
    switch (question.questionType) {
      case 'text':
        if (!answer.text_answer && question.required) {
          const error = new Error(`Text answer required for question "${question.text}"`);
          error.statusCode = 400;
          error.field = `question_${question._id}`;
          throw error;
        }
        break;
      
      case 'single_choice':
        if (question.required && (!answer.selected_choices || answer.selected_choices.length !== 1)) {
          const error = new Error(`Single choice required for question "${question.text}"`);
          error.statusCode = 400;
          error.field = `question_${question._id}`;
          throw error;
        }
        break;
        
      case 'multiple_choice':
        if (question.required && (!answer.selected_choices || answer.selected_choices.length === 0)) {
          const error = new Error(`At least one choice required for question "${question.text}"`);
          error.statusCode = 400;
          error.field = `question_${question._id}`;
          throw error;
        }
        break;
    }
  }
};

// @desc    Get responses for a survey
// @route   GET /api/survey-responses
// @access  Private
const getSurveyResponses = asyncHandler(async (req, res) => {
  const { survey: surveyId } = req.query;
  
  if (!surveyId) {
    res.status(400);
    throw new Error('Survey ID is required');
  }
  
  // Find survey
  const survey = await Survey.findById(surveyId);
  if (!survey) {
    res.status(404);
    throw new Error('Survey not found');
  }
  
  // Check if user is creator
  if (survey.creator.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to access these responses');
  }
  
  // Get responses
  const responses = await SurveyResponse.find({ survey: surveyId });
  
  res.status(200).json(responses);
});

// @desc    Get single response
// @route   GET /api/survey-responses/:id
// @access  Private
const getResponse = asyncHandler(async (req, res) => {
  const response = await SurveyResponse.findById(req.params.id);
  
  if (!response) {
    res.status(404);
    throw new Error('Response not found');
  }
  
  // Find survey to check authorization
  const survey = await Survey.findById(response.survey);
  if (!survey) {
    res.status(404);
    throw new Error('Survey not found');
  }
  
  // Check if user is creator
  if (survey.creator.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to access this response');
  }
  
  res.status(200).json(response);
});

module.exports = {
  submitResponse,
  getSurveyResponses,
  getResponse
};
