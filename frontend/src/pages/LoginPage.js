// import React from 'react';

// function LoginPage() {
//   return (
//     <div>
//       <h2>Login Page</h2>
//       <p>Please login to continue.</p>
//     </div>
//   );
// }

// export default LoginPage;




// src/pages/LoginPage.js
import React, { useState } from 'react';
import './LoginPage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        number: '',
        password: '',
      });

  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState('');
  const [isPasswordActive, setIsPasswordActive] = useState(false);
  const navigate = useNavigate();


  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (isRegister) {
      if (!form.name || !form.number || !form.email || !form.password) {
        setMessage({ type: 'error', text: 'Please fill in all fields.' });
        return false;
      }
  
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const phoneRegex = /^[0-9]{10}$/;
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+])[A-Za-z\d@$!%*?&#^()\-_=+]{8,}$/;

  
      if (!emailRegex.test(form.email)) {
        setMessage({ type: 'error', text: 'Invalid email address.' });
        return false;
      }
  
      if (!phoneRegex.test(form.number)) {
        setMessage({ type: 'error', text: 'Phone number must be 10 digits.' });
        return false;
      }
  
      if (!passwordRegex.test(form.password)) {
        setMessage({
          type: 'error',
          text: 'Password must be at least 8 characters and include uppercase, lowercase, digit, and special character.',
        });
        return false;
      }
  
    } else {
      if (!form.email || !form.password) {
        setMessage({ type: 'error', text: 'Please enter both email and password.' });
        return false;
      }
    }
  
    return true;
  };


  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    const endpoint = isRegister ? '/register' : '/login';
    const payload = isRegister
      ? form
      : { email: form.email, password: form.password };

    try {
      const res = await axios.post(`http://localhost:5000${endpoint}`, payload);
    //   setMessage(res.data.message);
      setMessage({ type: 'success', text: res.data.message });
      if (!isRegister && res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        window.dispatchEvent(new Event('storage')); // trigger update
        navigate('/');
      } else {
        setForm({ name: '', email: '', number: '', password: '' });
      }
    } catch (err) {
    //   setMessage(err.response?.data?.message || 'Something went wrong');
      const msg = err.response?.data?.message || 'Something went wrong.';
    setMessage({ type: 'error', text: msg });
    }
  };

  return (
    <div className="login-container">
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        {isRegister && (
          <>
            
            <input type="text" name="name" placeholder="Full Name"  value={form.name} onChange={handleChange} />
            <input type="text" name="number" placeholder="Phone Number"  value={form.number} onChange={handleChange} />
            
          </>
        )}
        <input type="email" name="email" placeholder="Email"  value={form.email} onChange={handleChange} />
        <input
            type="password"
            name="password"
            placeholder="Password"
            
            value={form.password}
            onChange={(e) => {
                handleChange(e);
                setIsPasswordActive(true); // this ensures it shows when typing
            }}
            onFocus={() => setIsPasswordActive(true)}
            onBlur={() => {
                if (!form.password) setIsPasswordActive(false); // only hide if input is empty
            }}
        />

        {isRegister && isPasswordActive && (
            <small className="password-hint">
                Must be at least 8 characters and include uppercase, lowercase, digit, and special character.
            </small>
        )}


        <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
      </form>

      <div className="auth-toggle">
        {isRegister ? (
            <span>Already have an account?
            <span 
                className="auth-link" 
                onClick={() => { setIsRegister(false); setMessage(null); }}
                >
                Login
            </span>

            </span>
        ) : (
            <span>New here?
            <span 
                className="auth-link" 
                onClick={() => { setIsRegister(true); setMessage(null); }}
                >
                Register
            </span>
            </span>
        )}
        </div>
        {message && (
            <p className={`message ${message.type === 'error' ? 'error' : 'success'}`}>
            {message.text}
            </p>
            )}

    </div>
  );
}

export default LoginPage;


