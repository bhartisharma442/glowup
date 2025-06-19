// src/pages/LoginPage.js
import React, { useState } from 'react';
import './LoginPage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import authUtils from '../utils/auth';

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
    const [loading, setLoading] = useState(false);
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

        setLoading(true);
        
        try {
            if (isRegister) {
                // Handle registration
                const res = await authUtils.register(form);
                setMessage({ type: 'success', text: res.message });
                
                // Clear form after successful registration
                setForm({ name: '', email: '', number: '', password: '' });
                setMessage({ type: 'success', text: 'Registration successful! Please login.' });
                setIsRegister(false);
            } else {
                // Handle login using authUtils
                const res = await authUtils.login(form.email, form.password);
                console.log('Login response:', res);
                
                setMessage({ type: 'success', text: res.message });
                
                // Add a small delay to ensure storage events are processed
                setTimeout(() => {
                    // Navigate based on user role
                    if (res.user.role === 'admin') {
                        console.log('Redirecting admin to dashboard');
                        navigate('/admin/dashboard'); // Create admin dashboard route
                    } else {
                        console.log('Redirecting user to home');
                        navigate('/');
                    }
                }, 100);
            }
        } catch (err) {
            console.error('Auth error:', err);
            const msg = err.response?.data?.message || 'Something went wrong.';
            setMessage({ type: 'error', text: msg });
        } finally {
            setLoading(false);
        }
    };

    const clearMessage = () => {
        setMessage('');
    };

    return (
        <div className="login-container">
            <h2>{isRegister ? 'Register' : 'Login'}</h2>
            <form onSubmit={handleSubmit}>
                {isRegister && (
                    <>
                        <input 
                            type="text" 
                            name="name" 
                            placeholder="Full Name" 
                            value={form.name} 
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <input 
                            type="text" 
                            name="number" 
                            placeholder="Phone Number" 
                            value={form.number} 
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </>
                )}
                <input 
                    type="email" 
                    name="email" 
                    placeholder="Email" 
                    value={form.email} 
                    onChange={handleChange}
                    disabled={loading}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => {
                        handleChange(e);
                        setIsPasswordActive(true);
                    }}
                    onFocus={() => setIsPasswordActive(true)}
                    onBlur={() => {
                        if (!form.password) setIsPasswordActive(false);
                    }}
                    disabled={loading}
                />

                {isRegister && isPasswordActive && (
                    <small className="password-hint">
                        Must be at least 8 characters and include uppercase, lowercase, digit, and special character.
                    </small>
                )}

                <button type="submit" disabled={loading}>
                    {loading ? 'Processing...' : (isRegister ? 'Register' : 'Login')}
                </button>
            </form>

            <div className="auth-toggle">
                {isRegister ? (
                    <span>Already have an account?
                        <span 
                            className="auth-link" 
                            onClick={() => { 
                                setIsRegister(false); 
                                clearMessage(); 
                                setForm({ name: '', email: '', number: '', password: '' });
                            }}
                        >
                            Login
                        </span>
                    </span>
                ) : (
                    <span>New here?
                        <span 
                            className="auth-link" 
                            onClick={() => { 
                                setIsRegister(true); 
                                clearMessage(); 
                                setForm({ name: '', email: '', number: '', password: '' });
                            }}
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