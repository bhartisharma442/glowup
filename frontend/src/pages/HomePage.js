// src/pages/HomePage.js
import React, { useEffect, useState } from 'react';
import './HomePage.css';
import heroImage from '../assets/logo.jpg';
import axios from 'axios';

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);

    // Check if user is logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            setUser(JSON.parse(userData));
            // Set authorization header for authenticated requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        // Listen for storage changes (login/logout)
        const handleStorageChange = () => {
            const newToken = localStorage.getItem('token');
            const newUserData = localStorage.getItem('user');
            
            if (newToken && newUserData) {
                setUser(JSON.parse(newUserData));
                axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            } else {
                setUser(null);
                delete axios.defaults.headers.common['Authorization'];
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const res = await axios.get('http://localhost:5000/api/products');
                console.log('Fetched products:', res.data);
                setProducts(res.data.slice(0, 6)); // Show first 6 products
                setError('');
            } catch (err) {
                console.error('Failed to fetch products:', err);
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleAddToCart = async (productId) => {
        if (!user) {
            alert('Please login to add items to cart');
            return;
        }

        try {
            // You can implement add to cart API call here
            console.log(`Adding product ${productId} to cart for user ${user.userId}`);
            alert('Product added to cart! (Feature coming soon)');
        } catch (err) {
            console.error('Failed to add to cart:', err);
            alert('Failed to add product to cart');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    return (
        <main>
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-text">
                        <p className="new">NEW</p>
                        <p className="subtitle">Night Repair Serum</p>
                        <h1>Holistic & Beauty</h1>
                        {user && (
                            <p className="welcome-message">
                                Welcome back, {user.name}! 
                                {user.role === 'admin' && <span className="admin-badge"> (Admin)</span>}
                            </p>
                        )}
                    </div>
                    <div className="hero-image">
                        <img src={heroImage} alt="Beauty" />
                    </div>
                </div>
            </section>

            {/* Product Highlights Section */}
            <section className="product-highlight">
                <h2>Product Highlights</h2>
                
                {loading && (
                    <div className="loading">
                        <p>Loading products...</p>
                    </div>
                )}

                {error && (
                    <div className="error">
                        <p className="error-message">{error}</p>
                        <button onClick={() => window.location.reload()}>
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && products.length === 0 && (
                    <div className="no-products">
                        <p>No products available at the moment.</p>
                    </div>
                )}

                {!loading && !error && products.length > 0 && (
                    <div className="product-grid">
                        {products.map((product) => (
                            <div className="product-card" key={product._id || product.productId}>
                                <div className="product-image">
                                    <img 
                                        src={product.image || '/placeholder-image.jpg'} 
                                        alt={product.name}
                                        onError={(e) => {
                                            e.target.src = '/placeholder-image.jpg';
                                        }}
                                    />
                                </div>
                                <div className="product-info">
                                    <h3>{product.name}</h3>
                                    <p className="price">{formatPrice(product.price)}</p>
                                    <p className="desc">
                                        {product.description 
                                            ? product.description.substring(0, 100) + '...' 
                                            : 'No description available'
                                        }
                                    </p>
                                    <div className="product-meta">
                                        <span className="category">{product.category}</span>
                                        <span className="stock">
                                            {product.stock > 0 
                                                ? `${product.stock} in stock` 
                                                : 'Out of stock'
                                            }
                                        </span>
                                    </div>
                                    <button 
                                        className={`add-to-cart-btn ${product.stock === 0 ? 'disabled' : ''}`}
                                        onClick={() => handleAddToCart(product._id || product.productId)}
                                        disabled={product.stock === 0}
                                    >
                                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Admin Quick Actions */}
            {user && user.role === 'admin' && (
                <section className="admin-actions">
                    <h3>Admin Quick Actions</h3>
                    <div className="admin-buttons">
                        <button onClick={() => window.open('/admin/products', '_blank')}>
                            Manage Products
                        </button>
                        <button onClick={() => window.open('/admin/users', '_blank')}>
                            Manage Users
                        </button>
                        <button onClick={() => window.open('/admin/dashboard', '_blank')}>
                            Dashboard
                        </button>
                    </div>
                </section>
            )}
        </main>
    );
};

export default HomePage;