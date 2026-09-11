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

  // 💡 අලුතින් එකතු කළ Factory / Unit (Elisha or Usha)
  unit: { 
    type: String, 
    enum: ['Elisha', 'Usha'], 
    default: 'Elisha' 
  },

  // 💡 අලුතින් එකතු කළ Department එක (DB එකෙන් තෝරන එක)
  department: { 
    type: String, 
    required: true 
  },

  // 💡 Form එකෙන් තෝරන Date එක
  date: { 
    type: Date, 
    default: Date.now 
  },

  // The core workflow status
  status: { 
    type: String, 
    enum: ['Assign Pending', 'Assigned', 'Completed'], 
    default: 'Assign Pending' 
  },
  
  // Requester Details
  requestedBy: { type: String, required: true },
  userId: { type: String, required: true }, 

  // Assignment Details
  assignedTo: { type: String, default: null },   // Staff Name
  assignedToId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  }, 

  // Timestamps
  completedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', RequestSchema);