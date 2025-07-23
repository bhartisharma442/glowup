// src/pages/HomePage.js
import React, { useEffect, useState } from 'react';
import './HomePage.css';
import heroImage from '../assets/logo.jpg';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Check if user is logged in
    useEffect(() => {
        const verifyUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
            setUser(null);
            return;
            }

            try {
            const res = await axios.get('http://localhost:5000/api/verify-token', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUser(res.data.user);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } catch (err) {
            // Token expired or invalid
            console.warn('Token invalid or expired. Logging out.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            delete axios.defaults.headers.common['Authorization'];
            }
        };

        verifyUser();

        // Optional: Also re-verify when returning to the tab
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
            verifyUser();
            }
        });

        return () => {
            document.removeEventListener('visibilitychange', verifyUser);
        };
        }, []);



    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const res = await axios.get('http://localhost:5000/api/products');
                console.log('Fetched products:', res.data);
                setProducts(res.data.slice(0, 3)); // Show first  products
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

    const handleViewProduct = (productId) => {
      navigate(`/products/${productId}`);
    };

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
                                        
                                    </div>
                                    <button 
                                        className="view-product-btn"
                                        onClick={() => handleViewProduct(product._id || product.productId)}
                                        >
                                        View Product
                                    </button>

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            
        </main>
    );
};

export default HomePage;