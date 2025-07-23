import React from 'react';
import './StaticPages.css';
import phoneIcon from '../assets/phone.png'; // add a phone icon image in assets folder

const ContactPage = () => {
  return (
    <div className="static-page contact-page">
      <h1>Contact Us</h1>
      <p>We're always here to help. Reach out to us anytime and our team will get back to you as soon as possible.</p>

      <div className="contact-info">
        <img src={phoneIcon} alt="Phone Icon" className="contact-icon" />
        <div>
          <p><strong>Email:</strong> support@glowup.ca</p>
          <p><strong>Phone:</strong> +1 (416) 123-4567</p>
          <p><strong>Address:</strong> 456 Maple Street, Toronto, Ontario, Canada M4B 1B3</p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
