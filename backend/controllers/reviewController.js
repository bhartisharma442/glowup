// controllers/reviewController.js
const Review = require('../models/Review');
const mongoose = require('mongoose');

// Create or update review
exports.createOrUpdateReview = async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;
    const user_id = req.user._id; // ✅ this comes from the auth middleware
    console.log("userid--",user_id);
    let review = await Review.findOne({ user_id, product_id });

    if (review) {
      // Update existing review
      review.rating = rating;
      review.comment = comment;
      await review.save();
      return res.json({ message: 'Review updated successfully', review });
    } else {
      // ✅ Create new review with user_id
      const newReview = new Review({ user_id, product_id, rating, comment });
      await newReview.save();
      return res.status(201).json({ message: 'Review added successfully', review: newReview });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while saving review' });
  }
};


// Get all reviews for a product


exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const objectId = new mongoose.Types.ObjectId(productId); // Convert to ObjectId
    console.log(productId,objectId);
    const reviews = await Review.find({ product_id: objectId })
      .populate('user_id', 'name') // get user's name
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};

