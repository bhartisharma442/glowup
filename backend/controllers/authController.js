const jwt = require('jsonwebtoken');

const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

res.status(200).json({
  message: 'Login successful',
  token,
  user: { userId: user.userId, name: user.name, role: user.role }
});
