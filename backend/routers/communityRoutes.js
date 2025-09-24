// backend/routers/communityRoutes.js
const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
const User = require('../models/User');

// utility to generate short unique codes
const generateCode = (length = 6) => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // avoid ambiguous chars
  let code = '';
  for (let i = 0; i < length; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

// Create community
// POST /api/communities
// body: { name, description, creatorId }
router.post('/', async (req, res) => {
  try {
    const { name, description, creatorId } = req.body;
    if (!name || !creatorId) return res.status(400).json({ success: false, error: 'Missing name or creatorId' });

    // ensure creator exists
    const creator = await User.findById(creatorId);
    if (!creator) return res.status(404).json({ success: false, error: 'Creator not found' });

    // create unique code
    let code;
    let tries = 0;
    do {
      code = generateCode();
      const exists = await Community.findOne({ code });
      if (!exists) break;
      tries++;
      if (tries > 10) return res.status(500).json({ success: false, error: 'Unable to generate unique code' });
    } while (true);

    const community = new Community({
      name,
      description,
      code,
      creator: creator._id,
      members: [creator._id],
    });

    await community.save();
    return res.json({ success: true, community });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Join community by code
// POST /api/communities/join
// body: { userId, code }
router.post('/join', async (req, res) => {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) return res.status(400).json({ success: false, error: 'Missing userId or code' });

    const community = await Community.findOne({ code });
    if (!community) return res.status(404).json({ success: false, error: 'Community not found' });

    if (community.members.some(m => m.toString() === userId)) {
      return res.json({ success: true, community, message: 'Already a member' });
    }

    community.members.push(userId);
    await community.save();
    return res.json({ success: true, community });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// List communities
// GET /api/communities?userId=...
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    let communities;
    if (userId) {
      // communities where user is member
      communities = await Community.find({ members: userId }).select('-messages').sort({ createdAt: -1 }).populate('creator', 'name email');
    } else {
      communities = await Community.find().select('-messages').sort({ createdAt: -1 }).populate('creator', 'name email');
    }
    return res.json({ success: true, communities });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get single community (with members info)
// GET /api/communities/:id
router.get('/:id', async (req, res) => {
  try {
    const community = await Community.findById(req.params.id).populate('members', 'name email').populate('creator', 'name email');
    if (!community) return res.status(404).json({ success: false, error: 'Community not found' });
    return res.json({ success: true, community });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get messages (paginated optional)
// GET /api/communities/:id/messages
router.get('/:id/messages', async (req, res) => {
  try {
    const community = await Community.findById(req.params.id).populate('messages.sender', 'name email');
    if (!community) return res.status(404).json({ success: false, error: 'Community not found' });
    return res.json({ success: true, messages: community.messages || [] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Post a message
// POST /api/communities/:id/messages
// body: { senderId, text, senderName? }
router.post('/:id/messages', async (req, res) => {
  try {
    const { senderId, text, senderName } = req.body;
    if (!senderId || !text) return res.status(400).json({ success: false, error: 'Missing senderId or text' });

    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ success: false, error: 'Community not found' });

    // optional: check membership
    if (!community.members.some(m => m.toString() === senderId)) {
      return res.status(403).json({ success: false, error: 'You are not a member of this community' });
    }

    const message = { sender: senderId, senderName: senderName || '', text, createdAt: new Date() };
    community.messages.push(message);
    await community.save();
    // return last message or full messages per choice
    return res.json({ success: true, message: community.messages[community.messages.length - 1] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
