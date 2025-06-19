// src/pages/ManageUsers.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authUtils from '../utils/auth';
import './ManageUsers.css';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        number: '',
        role: 'user'
    });

    const navigate = useNavigate();

    const roles = ['user', 'admin'];

    useEffect(() => {
        checkAuthAndFetchUsers();
    }, []);

    // Reset to first page when filters/search/sort change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterRole, sortBy, sortOrder]);

    const checkAuthAndFetchUsers = useCallback(async () => {
        try {
            const user = authUtils.getCurrentUser();
            if (!user || user.role !== 'admin') {
                navigate('/login');
                return;
            }

            setCurrentUser(user);

            const isValidToken = await authUtils.verifyToken();
            if (!isValidToken) {
                authUtils.logout();
                navigate('/login');
                return;
            }

            await fetchUsers();
        } catch (error) {
            console.error('Auth/fetch error:', error);
            navigate('/login');
        }
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = authUtils.getToken();
            
            const response = await fetch('http://localhost:5000/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data);

        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            number: '',
            role: 'user'
        });
        setEditingUser(null);
    };

    const openModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name || '',
                email: user.email || '',
                number: user.number || '',
                role: user.role || 'user'
            });
        } else {
            resetForm();
        }
        setShowModal(true);
        setError('');
        setSuccess('');
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.email) {
            setError('Name and email are required');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        const token = authUtils.getToken();
        const url = editingUser
            ? `http://localhost:5000/api/admin/users/${editingUser._id}`
            : 'http://localhost:5000/api/admin/users';
        const method = editingUser ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save user');
            }

            const result = await response.json();
            setSuccess(result.message);
            await fetchUsers();
            setTimeout(closeModal, 1500);

        } catch (error) {
            console.error(error);
            setError(error.message);
        }
    };

    const handleDelete = async (userId, userName) => {
        // Prevent admin from deleting themselves
        if (currentUser && userId === currentUser.id) {
            setError('You cannot delete your own account');
            return;
        }

        if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const token = authUtils.getToken();
            
            const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete user');
            }

            setSuccess('User deleted successfully');
            await fetchUsers();
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);

        } catch (error) {
            console.error('Error deleting user:', error);
            setError(error.message);
        }
    };

    // Filter and sort users
    const filteredAndSortedUsers = users
        .filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                user.userId?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = !filterRole || user.role === filterRole;
            return matchesSearch && matchesRole;
        })
        .sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];
            
            // Handle different data types
            if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            } else {
                aVal = String(aVal || '').toLowerCase();
                bVal = String(bVal || '').toLowerCase();
            }
            
            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

    // Pagination logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredAndSortedUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredAndSortedUsers.length / usersPerPage);

    const handleGoBack = () => {
        navigate('/admin/dashboard');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="manage-users">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="manage-users">
            <div className="page-header">
                <div className="header-left">
                    <button onClick={handleGoBack} className="back-btn">
                        ← Back to Dashboard
                    </button>
                    <h1 className="wheat-color">Manage Users</h1>
                </div>
            </div>

            {/* Success/Error Messages */}
            {error && (
                <div className="message error-message">
                    {error}
                    <button onClick={() => setError('')} className="close-btn">×</button>
                </div>
            )}
            {success && (
                <div className="message success-message">
                    {success}
                    <button onClick={() => setSuccess('')} className="close-btn">×</button>
                </div>
            )}

            {/* Filters and Search */}
            <div className="filters-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search users by name, email, or user ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="filter-controls">
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="role-filter"
                    >
                        <option value="">All Roles</option>
                        {roles.map(role => (
                            <option key={role} value={role}>
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                            </option>
                        ))}
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        <option value="name">Sort by Name</option>
                        <option value="email">Sort by Email</option>
                        <option value="role">Sort by Role</option>
                        <option value="createdAt">Sort by Join Date</option>
                        <option value="updatedAt">Sort by Last Updated</option>
                    </select>

                    <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="sort-order-btn"
                    >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="users-table-container">
                {filteredAndSortedUsers.length === 0 ? (
                    <div className="no-users">
                        <p>No users found</p>
                    </div>
                ) : (
                    <>
                        <table className="users-table">
                            <thead className='darkmagenta-col'>
                                <tr>
                                    <th>User ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th>Join Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.map(user => (
                                    <tr key={user._id}>
                                        <td className="user-id-cell">
                                            {user.userId || 'N/A'}
                                        </td>
                                        <td>
                                            <div className="user-name">
                                                <strong>{user.name}</strong>
                                                {currentUser && user._id === currentUser.id && (
                                                    <span className="current-user-badge">You</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="email-cell">
                                            {user.email}
                                        </td>
                                        <td className="phone-cell">
                                            {user.number || 'N/A'}
                                        </td>
                                        <td>
                                            <span className={`role-badge ${user.role}`}>
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </span>
                                        </td>
                                        <td className="date-cell">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="user-actions-cell">
                                            <button
                                                onClick={() => openModal(user)}
                                                className="edit-btn"
                                                title="Edit User"
                                            >
                                                ✏️
                                            </button>
                                            
                                            {currentUser && user._id !== currentUser.id && (
                                                <button
                                                    onClick={() => handleDelete(user._id, user.name)}
                                                    className="delete-btn"
                                                    title="Delete User"
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {/* Pagination Controls */}
                        <div className="pagination">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            <span>Page {currentPage} of {totalPages}</span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Modal for Edit User */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Edit User</h2>
                        {error && (
                            <div className="message error-message">
                                {error}
                                <button onClick={() => setError('')} className="close-btn">×</button>
                            </div>
                        )}
                        {success && (
                            <div className="message success-message">
                                {success}
                                <button onClick={() => setSuccess('')} className="close-btn">×</button>
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Name*</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Email*</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="text"
                                    name="number"
                                    value={formData.number}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Role*</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    required
                                    disabled={currentUser && editingUser?._id === currentUser.id}
                                >
                                    {roles.map(role => (
                                        <option key={role} value={role}>
                                            {role.charAt(0).toUpperCase() + role.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                {currentUser && editingUser?._id === currentUser.id && (
                                    <small className="form-note">You cannot change your own role</small>
                                )}
                            </div>

                            <div className="modal-actions">
                                <button type="submit">Update User</button>
                                <button type="button" onClick={closeModal}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;