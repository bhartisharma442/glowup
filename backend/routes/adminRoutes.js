// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const authMiddleware = require('../middleware/auth');
const { upload } = require('../utils/cloudinary');

// Middleware to check if user is admin
const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
};

// Apply auth middleware to all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Get all products (Admin view with additional info)
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single product
router.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


// Create new product with image
router.post('/products', upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, category, stock_quantity } = req.body;
        const imageUrl = req.file?.path;

        if (!name || !price || !category) {
            return res.status(400).json({ message: 'Name, price, and category are required' });
        }

        const newProduct = new Product({
            name,
            description,
            price,
            category,
            stock_quantity: stock_quantity || 0,
            image: imageUrl || ''
        });

        await newProduct.save();
        res.status(201).json({ message: 'Product created successfully', product: newProduct });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});



// Update product
router.put('/products/:id', upload.single('image'), async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            stock_quantity
        } = req.body;

        // Validation
        if (price && parseFloat(price) <= 0) {
            return res.status(400).json({ message: 'Price must be greater than 0' });
        }

        if (stock_quantity !== undefined && parseInt(stock_quantity) < 0) {
            return res.status(400).json({ message: 'Stock quantity cannot be negative' });
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (category !== undefined) updateData.category = category;
        if (stock_quantity !== undefined) updateData.stock_quantity = parseInt(stock_quantity);

        // If a new image was uploaded, update the image URL
        if (req.file?.path) {
            updateData.image = req.file.path;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({
            message: 'Product updated successfully',
            product: updatedProduct
        });

    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                details: err.message
            });
        }
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});



// Delete product
router.delete('/products/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ 
            message: 'Product deleted successfully',
            product: deletedProduct
        });
    } catch (err) {
        console.error(err);
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all users (Admin only)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user role (Admin only)
router.put('/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be user or admin' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'User role updated successfully',
            user: updatedUser
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


// Get single user
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user (Admin only)
router.put('/users/:id', async (req, res) => {
    try {
        const { name, email, number, role } = req.body;

        // Validation
        if (role && !['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be user or admin' });
        }

        // Check if email is already taken by another user
        if (email) {
            const existingUser = await User.findOne({ 
                email: email,
                _id: { $ne: req.params.id }
            });
            if (existingUser) {
                return res.status(400).json({ message: 'Email is already taken by another user' });
            }
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (number !== undefined) updateData.number = number;
        if (role !== undefined) updateData.role = role;
        updateData.updatedAt = new Date();

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'User updated successfully',
            user: updatedUser
        });

    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation error',
                details: err.message
            });
        }
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete user (Admin only)
router.delete('/users/:id', async (req, res) => {
    try {
        // Prevent admin from deleting themselves
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        const deletedUser = await User.findByIdAndDelete(req.params.id).select('-password');
        
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ 
            message: 'User deleted successfully',
            user: deletedUser
        });
    } catch (err) {
        console.error(err);
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Bulk operations for users
router.post('/users/bulk-update', async (req, res) => {
    try {
        const { userIds, updateData } = req.body;
        
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: 'User IDs array is required' });
        }

        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'Update data is required' });
        }

        // Validate role if provided
        if (updateData.role && !['user', 'admin'].includes(updateData.role)) {
            return res.status(400).json({ message: 'Invalid role. Must be user or admin' });
        }

        // Prevent admin from changing their own role through bulk update
        if (updateData.role && userIds.includes(req.user.id)) {
            return res.status(400).json({ message: 'You cannot change your own role' });
        }

        updateData.updatedAt = new Date();

        const result = await User.updateMany(
            { _id: { $in: userIds } },
            updateData,
            { runValidators: true }
        );

        res.json({
            message: `${result.modifiedCount} users updated successfully`,
            modifiedCount: result.modifiedCount,
            matchedCount: result.matchedCount
        });

    } catch (error) {
        console.error('Error in bulk update:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation error', 
                details: error.message 
            });
        }
        res.status(500).json({ message: 'Server error during bulk update' });
    }
});

// Delete multiple users
router.delete('/users/bulk-delete', async (req, res) => {
    try {
        const { userIds } = req.body;
        
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: 'User IDs array is required' });
        }

        // Prevent admin from deleting themselves
        if (userIds.includes(req.user.id)) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        const result = await User.deleteMany({ _id: { $in: userIds } });

        res.json({
            message: `${result.deletedCount} users deleted successfully`,
            deletedCount: result.deletedCount
        });

    } catch (error) {
        console.error('Error in bulk delete:', error);
        res.status(500).json({ message: 'Server error during bulk delete' });
    }
});


// Dashboard stats (Legacy route - kept for compatibility)
router.get('/dashboard', async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        const lowStockProducts = await Product.countDocuments({ stock_quantity: { $lt: 10 } });

        res.json({
            totalProducts,
            totalUsers,
            totalAdmins,
            lowStockProducts
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Enhanced dashboard stats
router.get('/dashboard-stats', async (req, res) => {
    try {
        // Get total counts using Promise.all for parallel execution
        const [totalUsers, totalProducts, totalOrders, revenueResult, lowStockProducts, recentOrders] = await Promise.all([
            // Count total users (excluding admins if you want)
            User.countDocuments({ role: { $ne: 'admin' } }),
            
            // Count total products
            Product.countDocuments(),
            
            // Count total orders
            Order.countDocuments(),
            
            // Calculate total revenue from all orders
            Order.aggregate([
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$total_amount' }
                    }
                }
            ]),

            // Low stock products (less than 10 items)
            Product.countDocuments({ stock_quantity: { $lt: 10 } }),

            // Recent orders (last 7 days)
            Order.countDocuments({ 
                order_date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
            })
        ]);

        // Extract revenue from aggregation result
        const revenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        // Send response
        res.json({
            success: true,
            data: {
                totalUsers,
                totalProducts,
                totalOrders,
                revenue: revenue || 0
            },
            additionalStats: {
                recentOrders,
                lowStockProducts,
                averageOrderValue: totalOrders > 0 ? (revenue / totalOrders) : 0
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            error: error.message
        });
    }
});

// Bulk operations
router.post('/products/bulk-update', async (req, res) => {
    try {
        const { productIds, updateData } = req.body;
        
        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ message: 'Product IDs array is required' });
        }

        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'Update data is required' });
        }

        // Validate update data
        if (updateData.price !== undefined && updateData.price <= 0) {
            return res.status(400).json({ message: 'Price must be greater than 0' });
        }

        if (updateData.stock_quantity !== undefined && updateData.stock_quantity < 0) {
            return res.status(400).json({ message: 'Stock quantity cannot be negative' });
        }

        const result = await Product.updateMany(
            { _id: { $in: productIds } },
            updateData,
            { runValidators: true }
        );

        res.json({
            message: `${result.modifiedCount} products updated successfully`,
            modifiedCount: result.modifiedCount,
            matchedCount: result.matchedCount
        });

    } catch (error) {
        console.error('Error in bulk update:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation error', 
                details: error.message 
            });
        }
        res.status(500).json({ message: 'Server error during bulk update' });
    }
});

// Delete multiple products
router.delete('/products/bulk-delete', async (req, res) => {
    try {
        const { productIds } = req.body;
        
        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ message: 'Product IDs array is required' });
        }

        const result = await Product.deleteMany({ _id: { $in: productIds } });

        res.json({
            message: `${result.deletedCount} products deleted successfully`,
            deletedCount: result.deletedCount
        });

    } catch (error) {
        console.error('Error in bulk delete:', error);
        res.status(500).json({ message: 'Server error during bulk delete' });
    }
});


// Get all orders (admin)
router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user_id', 'name email') // optional
            .sort({ order_date: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update order status
router.put('/orders/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ message: 'Order status updated', order: updatedOrder });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});



module.exports = router;