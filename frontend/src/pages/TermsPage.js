import React from 'react';
import './StaticPages.css';

const TermsPage = () => {
  return (
    <div className="static-page">
      <h1>Terms & Conditions</h1>
      <p>By accessing and using GlowUp’s website, you accept and agree to be bound by the terms and provisions of this agreement.</p>

      <h2>Usage</h2>
      <p>You agree not to misuse the site or help anyone else do so. You may use our services only as permitted by law.</p>

      <h2>Products & Pricing</h2>
      <p>All prices are listed in Canadian Dollars (CAD). We reserve the right to change pricing and availability at any time.</p>

      <h2>Returns & Refunds</h2>
      <p>We accept returns within 14 days of purchase. The item must be unused and in original packaging. Refunds will be processed within 5 business days after return approval.</p>

      <h2>Changes to Terms</h2>
      <p>We may modify these terms at any time. Continued use of the site after changes constitutes your acceptance of the new terms.</p>
    </div>
  );
};

export default TermsPage;
