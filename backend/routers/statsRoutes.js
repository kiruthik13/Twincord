const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Community = require('../models/Community');
const mongoose = require('mongoose');

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

// Server-Sent Events for realtime stats
// GET /api/stats/stream
router.get('/stream', async (req, res) => {
  // Setup SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();

  let changeStream;

  const sendSnapshot = async () => {
    try {
      const [totalUsers, onlineUsers, totalCommunities] = await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ isOnline: true }),
        Community.countDocuments({}),
      ]);
      const data = {
        totalUsers,
        onlineUsers,
        totalCommunities,
        meetingsToday: 0,
      };
      res.write(`event: stats\n`);
      res.write(`data: ${JSON.stringify({ success: true, data })}\n\n`);
    } catch (err) {
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ success: false, error: 'Failed to compute stats' })}\n\n`);
    }
  };

  // Send initial snapshot immediately
  await sendSnapshot();

  try {
    // Use MongoDB change streams to react to underlying changes
    // This requires a replica set; if not enabled, we fallback to interval polling
    if (mongoose.connection && mongoose.connection.db) {
      const db = mongoose.connection.db;
      const pipeline = [];
      changeStream = db.watch(pipeline, { fullDocument: 'updateLookup' });
      changeStream.on('change', async () => {
        await sendSnapshot();
      });
      changeStream.on('error', () => {
        // Fallback to polling if change streams fail
        if (changeStream) {
          try { changeStream.close(); } catch (_) {}
          changeStream = null;
        }
      });
    }
  } catch (_) {
    // ignore; will rely on heartbeat below
  }

  // As a safety net, also send periodic snapshots
  const intervalId = setInterval(sendSnapshot, 15000);

  // Heartbeat to keep connection alive on some proxies
  const heartbeatId = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 20000);

  // Cleanup on client disconnect
  req.on('close', () => {
    clearInterval(intervalId);
    clearInterval(heartbeatId);
    if (changeStream) {
      try { changeStream.close(); } catch (_) {}
    }
    res.end();
  });
});

module.exports = router;


