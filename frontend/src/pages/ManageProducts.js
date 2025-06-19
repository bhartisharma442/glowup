// src/pages/ManageProducts.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authUtils from '../utils/auth';
import './ManageProducts.css';

const ManageProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [categories, setCategories] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 10; 

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock_quantity: '',
        image: ''
    });

    const navigate = useNavigate();

    // Categories for the dropdown
    // const categories = [
    //     'Skin Care',
    //     'Hair Care',
    //     'Make Up',
        
    //     'Other'
    // ];

    useEffect(() => {
        checkAuthAndFetchProducts();
    }, []);

    // Reset to first page when filters/search/sort change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterCategory, sortBy, sortOrder]);


    const checkAuthAndFetchProducts = useCallback(async () => {
        try {
            const currentUser = authUtils.getCurrentUser();
            if (!currentUser || currentUser.role !== 'admin') {
                navigate('/login');
                return;
            }
    
            const isValidToken = await authUtils.verifyToken();
            if (!isValidToken) {
                authUtils.logout();
                navigate('/login');
                return;
            }
    
            await fetchProducts();
        } catch (error) {
            console.error('Auth/fetch error:', error);
            navigate('/login');
        }
    }, [navigate]);
    

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const token = authUtils.getToken();
            
            const response = await fetch('http://localhost:5000/api/admin/products', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();
            setProducts(data);
            // Extract unique categories from products
            const uniqueCategories = [...new Set(data.map(product => product.category).filter(Boolean))];
            setCategories(uniqueCategories);

        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to load products');
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
            description: '',
            price: '',
            category: '',
            stock_quantity: '',
            image: ''
        });
        setEditingProduct(null);
    };

    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name || '',
                description: product.description || '',
                price: product.price || '',
                category: product.category || '',
                stock_quantity: product.stock_quantity || '',
                image: product.image || ''
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
        if (!formData.name || !formData.price || !formData.category) {
            setError('Name, price, and category are required');
            return;
        }
    
        if (parseFloat(formData.price) <= 0) {
            setError('Price must be greater than 0');
            return;
        }
    
        const token = authUtils.getToken();
        const url = editingProduct
            ? `http://localhost:5000/api/admin/products/${editingProduct._id}`
            : 'http://localhost:5000/api/admin/products';
        const method = editingProduct ? 'PUT' : 'POST';
    
        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('category', formData.category);
        data.append('stock_quantity', formData.stock_quantity);
        if (formData.image && typeof formData.image !== 'string') {
            data.append('image', formData.image);
        }
    
        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save product');
            }
    
            const result = await response.json();
            setSuccess(result.message);
            // setShowModal(false);
            await fetchProducts();
            setTimeout(closeModal, 1500);
            // setTimeout(() => {
            //     resetForm();
            //     setSuccess('');
            // }, 1500);
    
        } catch (error) {
            console.error(error);
            setError(error.message);
        }
    };

    

    const handleDelete = async (productId, productName) => {
        if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const token = authUtils.getToken();
            
            const response = await fetch(`http://localhost:5000/api/admin/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete product');
            }

            setSuccess('Product deleted successfully');
            await fetchProducts();
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);

        } catch (error) {
            console.error('Error deleting product:', error);
            setError(error.message);
        }
    };

    // Filter and sort products
    const filteredAndSortedProducts = products
        .filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                product.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = !filterCategory || product.category === filterCategory;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];
            
            // Handle different data types
            if (sortBy === 'price' || sortBy === 'stock_quantity') {
                aVal = parseFloat(aVal) || 0;
                bVal = parseFloat(bVal) || 0;
            } else if (sortBy === 'createdAt') {
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
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredAndSortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage);

    const handleGoBack = () => {
        navigate('/admin/dashboard');
    };

    if (loading) {
        return (
            <div className="manage-products">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="manage-products">
            <div className="page-header">
                <div className="header-left">
                    <button onClick={handleGoBack} className="back-btn">
                        ← Back to Dashboard
                    </button>
                    <h1 className="wheat-color">Manage Products</h1>
                </div>
                <button onClick={() => openModal()} className="add-product-btn">
                    + Add New Product
                </button>
            </div>

            

            {/* Filters and Search */}
            <div className="filters-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="filter-controls">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="category-filter"
                    >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        <option value="name">Sort by Name</option>
                        <option value="price">Sort by Price</option>
                        <option value="category">Sort by Category</option>
                        <option value="stock_quantity">Sort by Stock</option>
                        {/* <option value="createdAt">Sort by Date</option> */}
                    </select>

                    <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="sort-order-btn"
                    >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                </div>
            </div>

            {/* Products Table */}
            <div className="products-table-container">
                {filteredAndSortedProducts.length === 0 ? (
                    <div className="no-products">
                        <p>No products found</p>
                    </div>
                ) : (
                    <>
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentProducts.map(product => (
                                    <tr key={product._id}>
                                        <td>
                                            <div className="product-image">
                                                {product.image ? (
                                                    <img src={product.image} alt={product.name} />
                                                ) : (
                                                    <div className="no-image">📦</div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="product-name">
                                                <strong>{product.name}</strong>
                                                {product.description && (
                                                    <p className="product-description">
                                                        {product.description.length > 50 
                                                            ? `${product.description.substring(0, 50)}...`
                                                            : product.description
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="category-badge">
                                                {product.category || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="price-cell">
                                            ${product.price?.toFixed(2) || '0.00'}
                                        </td>
                                        <td className="stock-cell">
                                            <span className={`stock-badge ${
                                                product.stock_quantity <= 0 ? 'out-of-stock' :
                                                product.stock_quantity < 10 ? 'low-stock' : 'in-stock'
                                            }`}>
                                                {product.stock_quantity || 0}
                                            </span>
                                        </td>
                                        <td className="actions-cell">
                                            <button
                                                onClick={() => openModal(product)}
                                                className="edit-btn"
                                                title="Edit Product"
                                            >
                                                ✏️
                                            </button>
                                            
                                            
                                            <button
                                                onClick={() => handleDelete(product._id, product.name)}
                                                className="delete-btn"
                                                title="Delete Product"
                                            >
                                                🗑️
                                            </button>
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

            {/* Modal for Add/Edit Product */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
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
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />
                            </div>
                            

                            <div className="form-row">
                                <div className="form-group half-width">
                                    <label>Price ($)*</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div className="form-group half-width">
                                    <label>Stock Quantity</label>
                                    <input
                                        type="number"
                                        name="stock_quantity"
                                        value={formData.stock_quantity}
                                        onChange={handleInputChange}
                                        min="0"
                                    />
                                </div>
                            </div>


                            <div className="form-group">
                                <label>Category*</label>
                                <input
                                    type="text"
                                    name="category"
                                    list="category-options"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                />
                                <datalist id="category-options">
                                    {categories.map(category => (
                                        <option key={category} value={category} />
                                    ))}
                                </datalist>
                            </div>

                            <div className="form-group">
                                <label>Upload Image</label>
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.files[0] }))}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="submit">{editingProduct ? 'Update' : 'Add'} Product</button>
                                <button type="button" onClick={closeModal}>Cancel</button>
                            </div>
                        </form>
                        

                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageProducts;
