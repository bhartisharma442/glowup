import React, { useState, useEffect } from 'react';
import './CheckoutPage.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CheckoutPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMode, setPaymentMode] = useState('cod');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [subscribe, setSubscribe] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/verify-token', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setName(res.data.user.name || '');
        setEmail(res.data.user.email || '');
        setPhone(res.data.user.number || '');
        console.log('ema-'+res.data.user.email);
        console.log('nuber-'+res.data.user.number);
      } catch (err) {
        console.error('Failed to fetch user info');
      }
    };

    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!name.trim() || !email.trim() || !address.trim()) {
    return toast.warn('Please fill in all required fields');
  }

  if (!phone.trim() ) {
    return toast.warn('Phone number is required');
    }
 
    if (phone.trim().length !== 10) {
    return toast.warn('Phone number must be 10 digits');
    }

    if (!/^\d{10}$/.test(phone.trim())) {
    return toast.warn('Phone number must be exactly 10 digits');
    }


  if (paymentMode === 'card' && (!cardNumber || !expiry || !cvv)) {
    return toast.warn('Please enter complete card details');
  }

  if (paymentMode === 'upi' && !upiId.trim()) {
    return toast.warn('Enter UPI ID');
  }

  try {
    const token = localStorage.getItem('token');
    const res = await axios.post('http://localhost:5000/cart/order/place', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const orderId = res.data.order._id;
    toast.success(`Order placed! ID: ${orderId.slice(-6).toUpperCase()}`);
    navigate('/orders');
  } catch (err) {
    toast.error('Order failed!');
  }
};


  return (
    <div className="checkout-page">
      <h2>Checkout</h2>

      <form onSubmit={handleSubmit} className="checkout-form">
        <div className="form-group">
          <label>Name *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
            <label>Phone Number *</label>
            <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
            />
        </div>


        <div className="form-group">
          <label>Delivery Address *</label>
          <textarea
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Enter full shipping address"
            required
          />
        </div>

        <div className="form-group">
          <label>Payment Mode *</label>
          <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
            <option value="cod">Cash on Delivery</option>
            <option value="card">Credit/Debit Card</option>
            <option value="upi">UPI</option>
          </select>
        </div>

        {paymentMode === 'card' && (
          <>
            <div className="form-group">
              <label>Card Number *</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group half">
                <label>Expiry *</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={e => setExpiry(e.target.value)}
                />
              </div>
              <div className="form-group half">
                <label>CVV *</label>
                <input
                  type="password"
                  placeholder="123"
                  value={cvv}
                  onChange={e => setCvv(e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        {paymentMode === 'upi' && (
          <div className="form-group">
            <label>UPI ID *</label>
            <input
              type="text"
              placeholder="name@upi"
              value={upiId}
              onChange={e => setUpiId(e.target.value)}
            />
          </div>
        )}

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={subscribe}
              onChange={() => setSubscribe(!subscribe)}
            />
            Receive event updates and special offers
          </label>
        </div>

        <button type="submit" className="checkout-btn">Confirm Order</button>
      </form>
    </div>
  );
};

export default CheckoutPage;
