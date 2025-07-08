import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // Navigate to product details page
    navigate(`/products/${product._id}`);
  };

  const handleAddToCart = (e) => {
    // Prevent card click when clicking add to cart button
    e.stopPropagation();
    onAddToCart(product);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const isOutOfStock = product.stock_quantity === 0;

  return (
    <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`} onClick={handleCardClick}>
      <div className="product-image-container">
        <img
          src={product.image || 'https://via.placeholder.com/300x200?text=No+Image'}
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
          }}
        />
        {isOutOfStock && <div className="out-of-stock-overlay">Out of Stock</div>}
        <div className="product-category">{product.category}</div>
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">
          {product.description && product.description.length > 80
            ? `${product.description.substring(0, 80)}...`
            : product.description || 'No description available'}
        </p>
        
        <div className="product-details-card">
          <div className="price-stock">
            <span className="product-price">{formatPrice(product.price)}</span>
            <span className="stock-info">
              {product.stock_quantity === 0
                ? 'Out of stock'
                : product.stock_quantity < 10
                  ? `Only ${product.stock_quantity} left!`
                  : ''}
            </span>

          </div>
          
          <button
            className={`add-to-cart-btn ${isOutOfStock ? 'disabled' : ''}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            Add to Cart
            {/* {isOutOfStock ? 'Out of Stock' : 'Add to Cart'} */}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;