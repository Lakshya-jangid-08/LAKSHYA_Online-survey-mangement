const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    maxlength: [255, 'Organization name cannot exceed 255 characters']
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

organizationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;
