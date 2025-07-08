const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');



// ✅ Update profile info
router.put('/profile/update', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const updates = {};

    if (req.body.name) updates.name = req.body.name;
    if (req.body.email) updates.email = req.body.email;
    if (req.body.number) updates.number = req.body.number;

    // Check if new email is already taken by another user
    const email = req.body.email;
    if (email) {
    const existing = await User.findOne({ email, userId: { $ne: userId } });
    if (existing) {
        return res.status(400).json({ message: 'Email is already in use by another account' });
    }
    }


    // Optional password update
    if (req.body.password && req.body.password.length >= 6) {
      const hashed = await bcrypt.hash(req.body.password, 10);
      updates.password = hashed;
    }



    updates.updatedAt = new Date();

    const updatedUser = await User.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
});

module.exports = router;
