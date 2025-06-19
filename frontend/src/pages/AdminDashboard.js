// src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authUtils from '../utils/auth';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalUsers: 0,
        totalOrders: 0,
        revenue: 0
    });
    const [statsLoading, setStatsLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const navigate = useNavigate();

    // Function to fetch dashboard stats from API
    const fetchDashboardStats = async () => {
        try {
            setStatsLoading(true);
            const token = authUtils.getToken();
            
            const response = await fetch('http://localhost:5000/api/admin/dashboard-stats', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard stats');
            }

            const responseData = await response.json();
            console.log('Dashboard stats response:', responseData); // Debug log
            
            // Extract data from the nested structure
            const data = responseData.data || {};
            
            setStats({
                totalProducts: data.totalProducts || 0,
                totalUsers: data.totalUsers || 0,
                totalOrders: data.totalOrders || 0,
                revenue: data.revenue || 0
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            // Set default values on error
            setStats({
                totalProducts: 0,
                totalUsers: 0,
                totalOrders: 0,
                revenue: 0
            });
        } finally {
            setStatsLoading(false);
        }
    };

    const checkAuthAndPermissions = async () => {
        try {
            // Check if user is logged in and is admin
            const currentUser = authUtils.getCurrentUser();
            
            if (!currentUser) {
                console.log('No user found, redirecting to login...');
                navigate('/login');
                return false;
            }

            if (currentUser.role !== 'admin') {
                console.log('User is not admin, redirecting to home...');
                navigate('/');
                return false;
            }

            // Verify token is still valid
            const isValidToken = await authUtils.verifyToken();
            if (!isValidToken) {
                console.log('Token invalid or expired, logging out...');
                authUtils.logout();
                navigate('/login');
                return false;
            }

            setUser(currentUser);
            return true;
        } catch (error) {
            console.error('Auth check failed:', error);
            authUtils.logout();
            navigate('/login');
            return false;
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            const authorized = await checkAuthAndPermissions();
            setIsAuthorized(authorized);
            
            if (authorized) {
                // Load real stats from database
                await fetchDashboardStats();
                setLoading(false);
            } else {
                setLoading(false);
            }
        };

        initializeAuth();

        // Listen for storage changes (token removal, logout from another tab, etc.)
        const handleStorageChange = async (e) => {
            // Only react to token or user changes
            if (e.key === 'token' || e.key === 'user' || e.key === null) {
                console.log('Storage changed, checking auth...');
                const authorized = await checkAuthAndPermissions();
                setIsAuthorized(authorized);
                if (!authorized) {
                    setLoading(false);
                }
            }
        };

        // Listen for custom storage events dispatched by auth utils
        const handleCustomStorageEvent = async () => {
            console.log('Custom storage event triggered, checking auth...');
            const authorized = await checkAuthAndPermissions();
            setIsAuthorized(authorized);
            if (!authorized) {
                setLoading(false);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('storage', handleCustomStorageEvent);

        // Optional: Periodically check token validity (every 30 seconds)
        const tokenCheckInterval = setInterval(async () => {
            if (authUtils.isLoggedIn()) {
                const isValid = await authUtils.verifyToken();
                if (!isValid) {
                    console.log('Periodic token check failed, logging out...');
                    authUtils.logout();
                    navigate('/login');
                }
            }
        }, 30000); // Check every 30 seconds

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('storage', handleCustomStorageEvent);
            clearInterval(tokenCheckInterval);
        };
    }, [navigate]);

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // If not authorized, don't render anything (will redirect via useEffect)
    if (!isAuthorized || !user) {
        return null;
    }

    const handleLogout = () => {
        authUtils.logout();
        navigate('/login');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <div className="header-content">
                    <h1>Admin Dashboard</h1>
                    <div className="admin-info">
                        <span>Welcome, {user.name}</span>
                        <button onClick={handleLogout} className="logout-btn">
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card products">
                        <div className="stat-icon">📦</div>
                        <div className="stat-info">
                            <h3>Total Products</h3>
                            <p className="stat-number">
                                {statsLoading ? '...' : stats.totalProducts.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="stat-card users">
                        <div className="stat-icon">👨‍👦‍👦</div>
                        <div className="stat-info">
                            <h3>Total Users</h3>
                            <p className="stat-number">
                                {statsLoading ? '...' : stats.totalUsers.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="stat-card orders">
                        <div className="stat-icon">🛒</div>
                        <div className="stat-info">
                            <h3>Total Orders</h3>
                            <p className="stat-number">
                                {statsLoading ? '...' : stats.totalOrders.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="stat-card revenue">
                        <div className="stat-icon">💰</div>
                        <div className="stat-info">
                            <h3>Revenue</h3>
                            <p className="stat-number">
                                {statsLoading ? '...' : formatCurrency(stats.revenue)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                    <h2>Quick Actions</h2>
                    <div className="actions-grid">
                        <Link to="/admin/products" className="action-card">
                            <div className="action-icon">🏷️</div>
                            <div className="action-content">
                                <h3>Manage Products</h3>
                                <p>Add, edit, or remove products</p>
                            </div>
                        </Link>

                        <Link to="/admin/users" className="action-card">
                            <div className="action-icon">👤</div>
                            <div className="action-content">
                                <h3>Manage Users</h3>
                                <p>View and manage user accounts</p>
                            </div>
                        </Link>

                        <Link to="/admin/orders" className="action-card">
                            <div className="action-icon">📋</div>
                            <div className="action-content">
                                <h3>Manage Orders</h3>
                                <p>Process and track orders</p>
                            </div>
                        </Link>

                        
                    </div>
                </div>

                

                {/* Quick Navigation */}
                <div className="quick-nav">
                    <h2>Navigation</h2>
                    <div className="nav-links">
                        <Link to="/" className="nav-link">
                            🏠 Back to Home
                        </Link>
                        <Link to="/products" className="nav-link">
                            🛍️ View Products
                        </Link>
                        <Link to="/admin/settings" className="nav-link">
                            ⚙️ Settings
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;