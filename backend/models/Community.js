// backend/models/Community.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String },
  text: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, default: '' },
  code: { type: String, required: true, unique: true }, // join code
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [messageSchema], // embed messages for simplicity
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Community', communitySchema);
