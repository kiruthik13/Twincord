const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Community = require('../models/Community');

// GET /api/stats
// Returns aggregate counts for dashboard
router.get('/', async (req, res) => {
  try {
    const [totalUsers, onlineUsers, totalCommunities] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isOnline: true }),
      Community.countDocuments({}),
    ]);

    // Placeholder: meetingsToday not tracked in DB yet
    const meetingsToday = 0;

    return res.json({
      success: true,
      data: {
        totalUsers,
        onlineUsers,
        totalCommunities,
        meetingsToday,
      },
    });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ success: false, error: 'Failed to load stats' });
  }
});

module.exports = router;


