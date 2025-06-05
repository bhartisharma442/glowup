
// src/pages/HomePage.js
import React, { useEffect, useState } from 'react';
import './HomePage.css';
import heroImage from '../assets/logo.jpg';
import axios from 'axios';


const HomePage = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
      axios.get('http://localhost:5000/api/products')
        .then(res => {
          console.log('Fetched products:', res.data); // Add this
          setProducts(res.data.slice(0, 6));
        })
        .catch(err => {
          console.error('Failed to fetch products:', err);
        });
    }, []);

  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
            <div className="hero-text">
            <p className="new">NEW</p>
            <p className="subtitle">Night Repair Serum</p>
            <h1>Holistic & Beauty</h1>
            </div>
            <div className="hero-image">
            <img src={heroImage} alt="Beauty" />
            </div>
        </div>
        </section>

        {/* Product Highlihts Section */}
        <section className="product-highlight">
            <h2>Product Highlights</h2>
            <div className="product-grid">
            {products.map((product) => (
                <div className="product-card" key={product._id}>
                <img src={product.image} alt={product.name} />
                <h3>{product.name}</h3>
                <p>${product.price}</p>
                <p className="desc">{product.description.substring(0, 100)}...</p>
                <button>Add to Cart</button>
                </div>
            ))}
            </div>
        </section>

      
    </main>
  );
};

export default HomePage;


