// src/pages/ManageOrders.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authUtils from '../utils/auth';
import './ManageOrders.css';

const ManageOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [sortBy, setSortBy] = useState('order_date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 2;

    const navigate = useNavigate();
    const token = authUtils.getToken();

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, sortBy, sortOrder]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:5000/api/admin/orders', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            if (res.ok) {
                fetchOrders();
            } else {
                console.error('Failed to update status');
            }
        } catch (err) {
            console.error('Error updating order status:', err);
        }
    };

    const filteredAndSortedOrders = orders
        .filter(order => {
            const matchesSearch = order._id.includes(searchTerm) ||
                                  order.user_id?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  order.user_id?.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = !filterStatus || order.status === filterStatus;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];

            if (sortBy === 'order_date') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            } else {
                aVal = String(aVal || '').toLowerCase();
                bVal = String(bVal || '').toLowerCase();
            }

            return sortOrder === 'asc' ? aVal > bVal ? 1 : -1 : aVal < bVal ? 1 : -1;
        });

    const indexOfLast = currentPage * ordersPerPage;
    const indexOfFirst = indexOfLast - ordersPerPage;
    const currentOrders = filteredAndSortedOrders.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredAndSortedOrders.length / ordersPerPage);

    const handleGoBack = () => {
        navigate('/admin/dashboard');
    };

    return (
        <div className="manage-orders-container">
            <div className="page-header">
                <div className="header-left">
                    <button onClick={handleGoBack} className="back-btn">
                        ← Back to Dashboard
                    </button>
                    <h1 className="wheat-color">Manage Orders</h1>
                </div>
            </div>

            <div className="filters-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search by Order ID, Name or Email"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select className="sort-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>

                <select value={sortBy} className="sort-select" onChange={(e) => setSortBy(e.target.value)}>
                    <option value="order_date">Sort by Date</option>
                    <option value="status">Sort by Status</option>
                </select>

                <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="sort-order-btn">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
            </div>

            {loading ? (
                <p className="loading-text">Loading orders...</p>
            ) : currentOrders.length === 0 ? (
                <p>No orders found</p>
            ) : (
                <>
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>User</th>
                                <th>Total</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentOrders.map(order => (
                                <tr key={order._id}>
                                    <td>{order._id}</td>
                                    <td>
                                        {order.user_id?.name || 'N/A'}<br />
                                        <span className="user-email">{order.user_id?.email || 'N/A'}</span>
                                    </td>
                                    <td>${order.total_amount}</td>
                                    <td>{new Date(order.order_date).toLocaleDateString()}</td>
                                    <td>
                                        <select
                                            className="status-dropdown"
                                            value={order.status}
                                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Processing">Processing</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="pagination">
                        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                            Previous
                        </button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ManageOrdersPage;
