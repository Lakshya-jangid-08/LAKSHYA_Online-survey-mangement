const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey.questions',
    required: true
  },
  textAnswer: {
    type: String,
    default: null
  },
  selectedChoices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey.questions.choices'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

const surveyResponseSchema = new mongoose.Schema({
  survey: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
    required: true
  },
  respondent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  answers: [answerSchema],
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: {
    createdAt: 'submittedAt'
  }
});

const SurveyResponse = mongoose.model('SurveyResponse', surveyResponseSchema);

module.exports = SurveyResponse;
