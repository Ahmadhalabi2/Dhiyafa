const mongoose = require('mongoose');

const threadSchema = new mongoose.Schema({
  userId:              { type: String, required: true, unique: true },
  userName:            { type: String, required: true },
  lastMessageAt:       { type: Date, default: Date.now },
  lastMessagePreview:  { type: String, default: '' },
  unreadForSupport:    { type: Number, default: 0 },
  unreadForUser:       { type: Number, default: 0 },
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  threadId:        { type: mongoose.Schema.Types.ObjectId, ref: 'SupportThread', required: true },
  fromRole:        { type: String, enum: ['user', 'support', 'superadmin'], required: true },
  fromUserId:      { type: String, required: true },
  fromName:        { type: String, required: true },
  text:            { type: String, required: true },
  unreadForSupport:{ type: Boolean, default: true },
  unreadForUser:   { type: Boolean, default: false },
}, { timestamps: true });

const feedbackSchema = new mongoose.Schema({
  userId:          { type: String, required: true },
  userName:        { type: String, required: true },
  text:            { type: String, required: true },
  unreadForSupport:{ type: Boolean, default: true },
  repliedText:     { type: String, default: null },
  repliedAt:       { type: Date,   default: null },
}, { timestamps: true });

const SupportThread   = mongoose.model('SupportThread',   threadSchema);
const SupportMessage  = mongoose.model('SupportMessage',  messageSchema);
const SupportFeedback = mongoose.model('SupportFeedback', feedbackSchema);

module.exports = { SupportThread, SupportMessage, SupportFeedback };
