// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const User = require('./models/User');
const Product = require('./models/Product');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Sample route
app.get('/', (req, res) => {
  res.send('API is running...');
});




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
  
  app.get('/api/products', async (req, res) => {
    try {
      const products = await Product.find(); // assuming Product is your mongoose model
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });  


  app.post('/login', async (req, res) => {
    try {
        console.log(`login req: $req.body`)
      const { email, password } = req.body;
  
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'Invalid email or password' });
  
      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });
  
      res.status(200).json({ message: 'Login successful', user: { userId: user.userId, name: user.name, role: user.role } });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  






// MongoDB connection
mongoose.connect(process.env.MONGO_URI )
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });


// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });