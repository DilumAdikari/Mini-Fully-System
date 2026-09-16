const mongoose = require('mongoose');

/**
 * Request Schema
 * Defines the structure for Maintenance Job Tickets.
 * Status Flow: Assign Pending -> Assigned -> Completed
 */
const RequestSchema = new mongoose.Schema({
  // Unique Ticket ID (e.g., TID000001)
  tid: { 
    type: String, 
    required: true, 
    unique: true 
  }, 
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: [
      'Repair', 
      'Preventive', 
      'Installation', 
      'Emergency', 
      'Plumbing', 
      'Electrical', 
      'Furniture', 
      'Network'
    ], 
    default: 'Repair' 
  },

  // Factory / Unit
  unit: { 
    type: String, 
    enum: ['Elisha', 'Usha'], 
    default: 'Elisha' 
  },

  // Department
  department: { 
    type: String, 
    required: true 
  },

  // Date
  date: { 
    type: Date, 
    default: Date.now 
  },

  // The core workflow status
  status: { 
    type: String, 
    enum: ['Assign Pending', 'Assigned', 'Completed', 'DRAFT'], 
    default: 'Assign Pending' 
  },
  
  // Requester Details
  requestedBy: { type: String, required: true },
  userId: { type: String, required: true }, 

  // 💡 INTERNAL (Staff) හෝ EXTERNAL (Service Provider) වෙන් කර හඳුනාගැනීමට
  assignType: { 
    type: String, 
    enum: ['INTERNAL', 'EXTERNAL'], 
    default: 'INTERNAL' 
  },

  // Assigned Name (Staff Name or Service Provider Name)
  assignedTo: { 
    type: String, 
    default: null 
  },   

  // Assigned ID (User ID or Service Provider ID)
  assignedToId: { 
    type: mongoose.Schema.Types.Mixed, 
    default: null 
  }, 

  // Timestamps
  completedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', RequestSchema);