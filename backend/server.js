// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const User = require('./models/User');
const Product = require('./models/Product');
const authMiddleware = require('./middleware/auth');

// Import admin routes
const adminRoutes = require('./routes/adminRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Mount admin routes
app.use('/api/admin', adminRoutes);

// Sample route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// User Registration
app.post('/register', async (req, res) => {
    try {
      const { name, email, number, password } = req.body;
  
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });
  
      // Generate new userId (e.g., u1003 based on count or UUID)
      const userCount = await User.countDocuments();
      const userId = `u${1000 + userCount + 1}`;  
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        userId,
        name,
        email,
        number,
        role: 'user',  // Default role
        password: hashedPassword,
      });
  
      await newUser.save();
  
      res.status(201).json({ message: 'User registered successfully' });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
});

// User Login with JWT
app.post('/login', async (req, res) => {
    try {
        console.log(`login req: ${JSON.stringify(req.body)}`);
        const { email, password } = req.body;
  
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });
  
        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.userId, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
  
        res.status(200).json({ 
            message: 'Login successful', 
            token,
            user: { 
                userId: user.userId, 
                name: user.name, 
                email: user.email,
                role: user.role 
            } 
        });
  
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all products (public)
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get single product by ID (public)
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Verify token endpoint
app.get('/api/verify-token', authMiddleware, (req, res) => {
    res.json({ 
        message: 'Token is valid', 
        user: {
            userId: req.user.userId,
            email: req.user.email,
            role: req.user.role
        }
    });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });