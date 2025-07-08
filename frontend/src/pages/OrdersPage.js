import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './OrdersPage.css';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setAuthError(true);
          return;
        }

        const res = await axios.get('http://localhost:5000/cart/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setOrders(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          setAuthError(true);
        } else {
          toast.error('Failed to load orders');
          console.error(err);
        }
      }
    };

    fetchOrders();
  }, []);

  if (authError) {
    return (
      <div className="orders-page">
        <h3>Please <Link to="/login">log in</Link> to view your orders.</h3>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return <div className="orders-page">You have no past orders.</div>;
  }

  return (
    <div className="orders-page">
      <h2>My Orders</h2>
      {orders.map((order) => (
        <div key={order._id} className="order-card">
          <div className="order-header">
            <div>
                <strong>Order ID:</strong> #{order._id.slice(-6).toUpperCase()}
            </div>
            <div>
                <strong>Date:</strong> {new Date(order.order_date).toLocaleString()}
            </div>
            <div>
                <strong>Total:</strong> ₹{order.total_amount.toFixed(2)}
            </div>
            </div>

          <div className="order-items">
            {order.order_items.map((item, index) => (
              <div className="order-item">
                    <img
                        src={item.product_id?.image || 'https://via.placeholder.com/60x40?text=No+Image'}
                        alt={item.product_id?.name}
                        className="order-item-image"
                    />
                    <div className="order-item-info">
                        <div className="order-item-name">{item.product_id?.name}</div>
                        <div className="order-item-meta">
                        <span>Qty: {item.quantity}</span>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    </div>
                    </div>

            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrdersPage;
