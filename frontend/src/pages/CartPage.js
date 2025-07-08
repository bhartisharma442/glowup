import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CartPage.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [authError, setAuthError] = useState(false);
  const navigate = useNavigate();

  const fetchCart = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthError(true);
      return;
    }

    const res = await axios.get('http://localhost:5000/cart', {
      headers: { Authorization: `Bearer ${token}` }
    });

    setCart(res.data);
  } catch (err) {
    if (err.response && err.response.status === 401) {
      setAuthError(true);
    } else {
      console.error('Error fetching cart:', err);
    }
  }
};


  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantityChange = async (productId, delta) => {
  const item = cart.items.find(i => i.product_id._id === productId);
  const newQty = item.quantity + delta;
  if (newQty < 1) return;

  try {
    // ✅ Fetch the actual product stock from backend
    const productRes = await axios.get(`http://localhost:5000/api/products/${productId}`);
    const productStock = productRes.data.stock_quantity;

    if (newQty > productStock) {
      toast.warn(`Only ${productStock} items available in stock`);
      return;
    }

    const token = localStorage.getItem('token');
    await axios.put('http://localhost:5000/cart/update', {
      product_id: productId,
      quantity: newQty
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    fetchCart();
  } catch (err) {
    toast.error('Failed to update quantity');
  }
};


  const handleRemove = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/cart/update', {
        product_id: productId,
        quantity: 0
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Item removed');
      fetchCart();
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/cart/order/place', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order placed!');
      navigate('/products');
    } catch (err) {
      toast.error('Checkout failed');
    }
  };

  const goToCheckout = () => {
    navigate('/checkout');
  };


  const getTotal = () => {
    return cart?.items.reduce(
      (sum, item) => sum + item.quantity * item.product_id.price, 0
    ).toFixed(2);
  };

  if (authError) {
  return (
    <div className="cart-page">
      <h3>Please <Link to="/login">log in</Link> to view your cart.</h3>
    </div>
  );
}

if (!cart) {
  return <div className="cart-page">Loading cart...</div>;
}
  if (cart.items.length === 0) return <div className="cart-page empty">Your cart is empty.</div>;

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>
      {cart.items.map(item => (
        <div key={item.product_id._id} className="cart-item">
            <Link to={`/products/${item.product_id._id}`}>
            <img src={item.product_id.image} alt={item.product_id.name} />
            </Link>

          <div className="cart-info">
            <h4>{item.product_id.name}</h4>
            <p>Price: ₹{item.product_id.price}</p>
            <div className="quantity-controls">
              <button onClick={() => handleQuantityChange(item.product_id._id, -1)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => handleQuantityChange(item.product_id._id, 1)}>+</button>
            </div>
            <button
                className="cart-remove-icon"
                onClick={() => handleRemove(item.product_id._id)}
                title="Remove"
                >
                ❌
                </button>

          </div>
        </div>
      ))}

      <div className="cart-summary">
        <h3>Total: ₹{getTotal()}</h3>
        <button className="checkout-btn" onClick={goToCheckout}>Checkout</button>
      </div>
    </div>
  );
};

export default CartPage;
