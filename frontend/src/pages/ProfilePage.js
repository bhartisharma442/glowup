import React, { useState, useEffect } from 'react';
import './ProfilePage.css';
import { toast } from 'react-toastify';
import axios from 'axios';

const ProfilePage = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    number: '',
    password: ''
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/verify-token', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const { name, email, number } = res.data.user;
        setUser({ name, email, number, password: '' });
        setLoading(false);
      } catch (err) {
        toast.error('Failed to load profile');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
        e.preventDefault();

        const { name, email, number, password } = user;

        if (!name.trim() || !email.trim() || !number.trim()) {
            return toast.warn('Please fill in all required fields');
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const phoneRegex = /^[0-9]{10}$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+])[A-Za-z\d@$!%*?&#^()\-_=+]{8,}$/;

        if (!emailRegex.test(email)) {
            return toast.warn('Invalid email format');
        }

        if (!phoneRegex.test(number)) {
            return toast.warn('Phone number must be exactly 10 digits');
        }

        if (password && !passwordRegex.test(password)) {
            return toast.warn('Password must be at least 8 characters and include uppercase, lowercase, number, and special character');
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/profile/update', {
            name,
            email,
            number,
            password,
            }, {
            headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Profile updated successfully!');
            setUser(prev => ({ ...prev, password: '' }));
        } catch (err) {
            if (err.response?.data?.message === 'Email is already in use by another account') {
            toast.error('This email is already registered. Try another one.');
            } else {
            console.error(err.message);
            toast.error('Profile update failed');
            }
        }
        };




  if (loading) return <div className="profile-page">Loading...</div>;

  return (
    <div className="profile-page">
      <h2>My Profile</h2>
      <form onSubmit={handleUpdate} className="profile-form">
        <div className="form-group">
          <label>Name *</label>
          <input
            name="name"
            value={user.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            name="email"
            type="email"
            value={user.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Phone *</label>
          <input
            name="number"
            type="tel"
            value={user.number}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>New Password (optional)</label>
          <input
            name="password"
            type="password"
            value={user.password}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="update-btn">Update Profile</button>
      </form>
    </div>
  );
};

export default ProfilePage;
