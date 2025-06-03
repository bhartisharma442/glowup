

// src/pages/HomePage.js
// import React from 'react';
// import './HomePage.css';
// import heroImage from '../assets/logo.jpg';

// const HomePage = () => {
//   return (
//     <main className="hero">
//       <div className="hero-text">
//         <p className="new">NEW</p>
//         <p className="subtitle">Night Repair Serum</p>
//         <h1>Holistic & Beauty</h1>
//       </div>
//       <div className="hero-image">
//         <img src={heroImage} alt="Beauty" />
//       </div>
//     </main>
//   );
// };

// export default HomePage;




// src/pages/HomePage.js
import React, { useEffect, useState } from 'react';
import './HomePage.css';
import heroImage from '../assets/logo.jpg';
import axios from 'axios';


const HomePage = () => {
  

  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
  <div className="hero-content">
    <div className="hero-text">
      <p className="new">NEW</p>
      <p className="subtitle">Night Repair Serum</p>
      <h1>Holistic & Beauty</h1>
    </div>
    <div className="hero-image">
      <img src={heroImage} alt="Beauty" />
    </div>
  </div>
</section>

      
    </main>
  );
};

export default HomePage;


