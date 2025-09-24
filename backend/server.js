require('dotenv').config();
const express = require('express');
const connectDB = require('./db');
const cors = require('cors');
const authRoutes = require('./routers/authRoutes');
const communityRoutes = require('./routers/communityRoutes');
const statsRoutes = require('./routers/statsRoutes');


const app = express();
const PORT = process.env.PORT || 3000;

// Connect to DB
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8081', 'http://localhost:19006'], // Add your frontend URLs
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/stats', statsRoutes);
// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
