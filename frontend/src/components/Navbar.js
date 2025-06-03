// src/components/Navbar.js
// import React from 'react';
// import { Link } from 'react-router-dom';

// function Navbar() {
//   return (
//     <nav style={{ padding: '10px', background: '#eee' }}>
//       <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
//       <Link to="/login">Login</Link>
//     </nav>
//   );
// }

// export default Navbar;




import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css'; // Create this for styling

const Navbar = () => {
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = () => {
          const storedUser = localStorage.getItem('user');
          setUserLoggedIn(!!storedUser);
        };
      
        checkUser();
        window.addEventListener('storage', checkUser);
        return () => window.removeEventListener('storage', checkUser);
      }, []);
      

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUserLoggedIn(false);
        navigate('/login');
    };
    
  return (
    <header className="navbar">
      <div className="brand">Glow Up - Beauty Cosmetics</div>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/">Products</Link></li>
          <li><Link to="/">About</Link></li>
          <li><Link to="/">Shop List</Link></li>
          
          {userLoggedIn ? (
                <button onClick={handleLogout} className="logout-button">Logout</button>
            ) : (
                <>
                <li><Link to="/login">Login/Register</Link></li>
                </>
            )}
            
          <li><Link to="/cart"><span role="img" aria-label="cart">🛒</span></Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;

