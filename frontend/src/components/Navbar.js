// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import authUtils from '../utils/auth';

const Navbar = () => {
    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in on component mount
        const currentUser = authUtils.getCurrentUser();
        setUser(currentUser);

        // Listen for storage changes (login/logout events)
        const handleStorageChange = () => {
            const updatedUser = authUtils.getCurrentUser();
            setUser(updatedUser);
        };

        window.addEventListener('storage', handleStorageChange);
        
        // Verify token on mount
        authUtils.verifyToken().then((isValid) => {
            if (!isValid && currentUser) {
                setUser(null);
            }
        });

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []); // Remove user dependency to prevent infinite loop

    const handleLogout = () => {
        authUtils.logout();
        setUser(null);
        setShowDropdown(false);
        navigate('/login');
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDropdown && !event.target.closest('.user-menu')) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showDropdown]);

    return (
        <header className="navbar">
            <div className="brand">Glow Up - Beauty Cosmetics</div>
            <nav>
                <ul>
                    <li><Link to="/"><span role="img" aria-label="home">🏠</span> Home</Link></li>
                    <li><Link to="/products"><span role="img" aria-label="products">🛍️</span> Products</Link></li>
                    <li><Link to="/about"><span role="img" aria-label="about">ℹ️</span> About</Link></li>
                    <li><Link to="/cart"><span role="img" aria-label="cart">🛒</span> Cart</Link></li>

                    
                    {user ? (
                        <li className="user-menu">
                            <div className="user-dropdown">
                                <button 
                                    className={`user-button${showDropdown ? ' open' : ''}`}
                                    onClick={toggleDropdown}
                                >
                                    <span className="user-name">{user.name}</span>
                                    {user.role === 'admin' && (
                                        <span className="admin-badge">Admin</span>
                                    )}
                                    <span className="dropdown-arrow">▼</span>
                                </button>
                                
                                {showDropdown && (
                                    <div className="dropdown-menu">
                                        <Link 
                                            to="/profile" 
                                            className="dropdown-item"
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            Profile
                                        </Link>
                                        <Link 
                                            to="/orders" 
                                            className="dropdown-item"
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            My Orders
                                        </Link>
                                        
                                        {user.role === 'admin' && (
                                            <>
                                                <hr className="dropdown-divider" />
                                                <Link 
                                                    to="/admin/dashboard" 
                                                    className="dropdown-item admin-item"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    Admin Dashboard
                                                </Link>
                                                <Link 
                                                    to="/admin/products" 
                                                    className="dropdown-item admin-item"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    Manage Products
                                                </Link>
                                                <Link 
                                                    to="/admin/users" 
                                                    className="dropdown-item admin-item"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    Manage Users
                                                </Link>
                                                <Link 
                                                    to="/admin/orders" 
                                                    className="dropdown-item admin-item"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    Manage Orders
                                                </Link>
                                            </>
                                        )}
                                        
                                        <hr className="dropdown-divider" />
                                        <button 
                                            className="dropdown-item logout-item"
                                            onClick={handleLogout}
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </li>
                    ) : (
                        <li class="bold"><Link to="/login">Login/Register</Link></li>
                    )}
                    
                    
                </ul>
            </nav>
        </header>
    );
};

export default Navbar;