const mongoose = require('mongoose');

const ServiceProviderSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true, uppercase: true },
  nic: { type: String, required: true, trim: true, uppercase: true }, // 💡 NIC අංකය
  serviceType: { type: String, required: true }, // e.g. AC Repair, Electrical, Boiler Maintenance
  contactPerson: { type: String },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ServiceProvider', ServiceProviderSchema);