// routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const { createOrUpdateReview, getReviewsByProduct } = require('../controllers/reviewController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, createOrUpdateReview);
router.get('/:productId', getReviewsByProduct);

module.exports = router;
