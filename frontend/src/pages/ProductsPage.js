import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Using axios to fetch from your actual API endpoint
      const response = await axios.get('http://localhost:5000/api/products');

      // With axios, the data is directly available in response.data
      const data = response.data;
      setProducts(data);

      // Extract unique categories
      const uniqueCategories = [...new Set(data.map(product => product.category))];
      setCategories(uniqueCategories);

      console.log('Products fetched successfully:', data.length, 'products');
      setError(null); // Clear any previous errors

    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);

      // Mock data for development/fallback
      const mockProducts = [
        {
          _id: '1',
          name: 'Wireless Headphones',
          price: 99.99,
          description: 'High-quality wireless headphones with noise cancellation',
          image: 'https://via.placeholder.com/300x200?text=Headphones',
          category: 'Electronics',
          stock_quantity: 15
        },
        {
          _id: '2',
          name: 'Coffee Maker',
          price: 149.99,
          description: 'Automatic coffee maker with programmable timer',
          image: 'https://via.placeholder.com/300x200?text=Coffee+Maker',
          category: 'Home & Kitchen',
          stock_quantity: 8
        }
      ];

      setProducts(mockProducts);
      const uniqueCategories = [...new Set(mockProducts.map(product => product.category))];
      setCategories(uniqueCategories);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddToCart = (product) => {
    // This will be implemented with cart context later
    console.log('Adding to cart:', product);

    // For now, show a simple alert
    alert(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>Our Products</h1>
        {/* <p>Discover our amazing collection of products</p> */}
      </div>

      <div className="products-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        <div className="category-filters">
          <button
            className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleCategoryChange('all')}
          >
            All Categories
          </button>
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))
        ) : (
          <div className="no-products">
            <p>No products found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
