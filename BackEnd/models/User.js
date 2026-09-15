const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  }, 
  userType: { 
    type: String, 
    enum: ['Admin', 'Normal User', 'Maintenance Staff'], 
    default: 'Normal User' 
  },
  department: { 
    type: String, 
    required: true 
  },
  
  // 💡 Access Matrix Configuration field එක මෙතැනට එක් කරන ලදී
  permissionMatrix: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('User', UserSchema);