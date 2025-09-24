// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { 
  validateRegister, 
  validateLogin, 
  handleValidationErrors 
} = require('../middleware/validation');

// POST /api/auth/register
router.post('/register', validateRegister, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'User already exists with this email' 
      });
    }

    // Create new user
    const user = new User({ name, email, password });
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user data without password
    const userProfile = user.getPublicProfile();

    res.status(201).json({ 
      success: true,
      message: 'User registered successfully',
      data: {
        user: userProfile,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error during registration' 
    });
  }
});

// POST /api/auth/login
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    // Update user status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user data without password
    const userProfile = user.getPublicProfile();

    res.json({ 
      success: true,
      message: 'Login successful',
      data: {
        user: userProfile,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error during login' 
    });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  try {
    // In a real app, you might want to blacklist the token
    // For now, just send success response
    res.json({ 
      success: true,
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error during logout' 
    });
  }
});

module.exports = router;
