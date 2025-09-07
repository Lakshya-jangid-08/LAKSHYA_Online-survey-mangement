const mongoose = require('mongoose');

const csvUploadSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  columns: {
    type: [String],
    default: []
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const plotSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Untitled Plot'
  },
  type: {
    type: String,
    enum: ['scatter', 'bar', 'line', 'pie', 'histogram', 'heatmap', 'box', 'area'],
    required: true
  },
  configuration: {
    type: Object,
    required: true
  },
  data: {
    type: Object,
    required: true
  }
});

const analysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'Untitled Analysis'
  },
  authorName: {
    type: String,
    default: 'Unknown Author'
  },
  description: {
    type: String,
    default: ''
  },
  plots: [plotSchema],
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

const CSVUpload = mongoose.model('CSVUpload', csvUploadSchema);
const Analysis = mongoose.model('Analysis', analysisSchema);

module.exports = {
  CSVUpload,
  Analysis
};
