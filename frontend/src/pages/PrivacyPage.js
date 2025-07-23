import React from 'react';
import './StaticPages.css';

const PrivacyPage = () => {
  return (
    <div className="static-page">
      <h1>Privacy Policy</h1>
      <p>GlowUp values your privacy and is committed to protecting your personal information.</p>

      <h2>Information We Collect</h2>
      <p>We collect your name, email, phone number, shipping address, and purchase history when you place an order or sign up for our newsletter.</p>

      <h2>How We Use Your Information</h2>
      <ul>
        <li>To process your orders and payments</li>
        <li>To provide shipping and customer service</li>
        <li>To send promotional emails (only if subscribed)</li>
        <li>To improve our website and services</li>
      </ul>

      <h2>Security</h2>
      <p>We use SSL encryption and secure payment gateways to ensure your data is protected.</p>

      <h2>Your Rights</h2>
      <p>You can request access, correction, or deletion of your data at any time by contacting us at privacy@glowup.ca.</p>
    </div>
  );
};

export default PrivacyPage;
