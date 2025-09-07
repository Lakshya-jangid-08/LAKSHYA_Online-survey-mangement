const mongoose = require('mongoose');

const choiceSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Choice text is required'],
    maxlength: [200, 'Choice text cannot exceed 200 characters']
  },
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

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Question text is required'],
    maxlength: [500, 'Question text cannot exceed 500 characters']
  },
  questionType: {
    type: String,
    enum: ['text', 'multiple_choice', 'single_choice'],
    required: [true, 'Question type is required']
  },
  required: {
    type: Boolean,
    default: false
  },
  choices: [choiceSchema],
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

const surveySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Survey title is required'],
    trim: true,
    maxlength: [200, 'Survey title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Survey description is required']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  requiresOrganization: {
    type: Boolean,
    default: false
  },
  questions: [questionSchema],
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
  },
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      return ret;
    }
  },
  toObject: {
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      return ret;
    }
  }
});

surveySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Survey = mongoose.model('Survey', surveySchema);

module.exports = Survey;
