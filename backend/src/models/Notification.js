const mongoose = require('mongoose');

const notifSchema = new mongoose.Schema({
  type:            { type: String, required: true },
  bookingId:       { type: String, default: null },
  createdByUserId: { type: String, required: true },
  createdByName:   { type: String, required: true },
  targetRole:      { type: String, enum: ['superadmin', 'support', 'user'], required: true },
  targetUserId:    { type: String, default: null },
  title:           { type: String, required: true },
  desc:            { type: String, required: true },
  unread:          { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notifSchema);
