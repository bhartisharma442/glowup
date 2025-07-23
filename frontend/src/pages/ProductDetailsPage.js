import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

import './ProductDetailsPage.css';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState('');


  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        setError('Product not found or server error.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;

    if (quantity > product.stock_quantity) {
      setWarning(`Only ${product.stock_quantity} items available`);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return alert("You must be logged in to add to cart.");

      await axios.post(
        'http://localhost:5000/cart/add',
        { product_id: product._id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

    //   alert(`${product.name} added to cart!`);
    toast.success(`${product.name} added to cart!`);

    } catch (err) {
      console.error(err);
    //   alert('Failed to add to cart');
    toast.error('Failed to add to cart');

    }
  };

  const handleQuantityChange = (delta) => {
    setWarning('');
    setQuantity(prev => {
      const newQty = prev + delta;
      if (newQty < 1) return 1;
      if (product && newQty > product.stock_quantity) {
        setWarning(`Only ${product.stock_quantity} items available`);
        return product.stock_quantity;
      }
      return newQty;
    });
  };

  const fetchReviews = async () => {
  try {
    const res = await axios.get(`http://localhost:5000/api/reviews/${id}`);
    setReviews(res.data);
  } catch (err) {
    console.error('Failed to load reviews:', err);
  }
};

useEffect(() => {
  const fetchProduct = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/products/${id}`);
      setProduct(res.data);
    } catch (err) {
      setError('Product not found or server error.');
    } finally {
      setLoading(false);
    }
  };

  fetchProduct();
  fetchReviews();
}, [id]);


  const submitReview = async () => {
  const token = localStorage.getItem('token');
  if (!token) return toast.error("Login required to post a review.");
  
  if (!newReview.comment.trim()) {
    toast.error("Please enter a review comment.");
    return;
  }

  if (!newReview.rating) {
    toast.error("Please select a rating.");
    return;
  }

  try {
    await axios.post(
      'http://localhost:5000/api/reviews',
      {
        product_id: id,
        rating: newReview.rating,
        comment: newReview.comment
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    toast.success("Review posted!");
    setNewReview({ rating: 5, comment: '' });
    fetchReviews(); // Refresh reviews
  } catch (err) {
    console.error(err);
    toast.error("Failed to submit review.");
  }
};



  if (loading) return <div className="product-details">Loading...</div>;
  if (error) return <div className="product-details error">{error}</div>;
  if (!product) return null;

  return (
    <div className="product-details">
      <div className="product-details-image">
        <img src={product.image} alt={product.name} />
      </div>

      <div className="product-details-info">
        <h2>{product.name}</h2>
        <p className="product-details-price">₹{product.price}</p>
        <p className="product-details-desc">{product.description}</p>
        <p className="product-details-category">
          <strong>Category:</strong> {product.category}
        </p>

        {product.stock_quantity < 10 && (
          <p className="product-details-stock-warning">
            Only {product.stock_quantity} left in stock!
          </p>
        )}

        <div className="product-details-quantity-selector">
          <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>-</button>
          <span>{quantity}</span>
          <button onClick={() => handleQuantityChange(1)}>+</button>
        </div>

        {warning && <p className="product-details-warning-text">{warning}</p>}

        <button
          onClick={handleAddToCart}
          disabled={product.stock_quantity === 0}
          className="product-details-add-to-cart-btn"
        >
          Add to Cart
        </button>

        <div className="product-details-actions">
          <Link to="/products" className="product-details-nav-btn">← Back to Products</Link>
          <Link to="/cart" className="product-details-nav-btn">🛒 Go to Cart</Link>
        </div>
      </div>

      <div className="product-reviews-section">
        <div className="product-reviews-left">
          <h3>Customer Reviews</h3>
          {reviews.length === 0 && <p>No reviews yet.</p>}
          {reviews.map((rev, idx) => (
            <div key={idx} className="review">
              <p>
                <strong>{rev.user_id?.name || 'Anonymous'}</strong>{' '}
                <i className="fas fa-star" style={{ color: '#ffc107' }}></i> {rev.rating}/5
              </p>
              <p>{rev.comment}</p>
            </div>
          ))}
        </div>

        <div className="product-reviews-right">
          <h3>Write a Review</h3>
          <div className="star-rating-input">
            <label>Give a Rating:</label>
            <div className="stars">
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className={star <= newReview.rating ? 'filled-star' : 'empty-star'}
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          
          <textarea
            rows="3"
            placeholder="Your thoughts..."
            value={newReview.comment}
            onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
          />
          <br />
          <button onClick={submitReview} className="submit-review-btn">Submit Review</button>
        </div>
      </div>

      
    </div>

    
  );
};

export default ProductDetailsPage;
