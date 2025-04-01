import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Lottie from 'lottie-react';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();
  const location = useLocation();
  
  // Only show footer on home page
  if (location.pathname !== '/') {
    return null;
  }
  
  return (
    <footer className="bg-gradient-to-r from-gray-800 to-blue-900 text-white py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="flex flex-col">
            <h3 className="text-xl font-bold mb-4">FinYearPro</h3>
            <p className="text-gray-300 mb-4">
              Transforming financial data into actionable insights with powerful analytics.
            </p>
            <div className="lottie-container">
              <iframe 
                src="https://lottie.host/embed/14fe035a-f3ba-4752-a5b4-d19e2afee883/KvcBdy4yIG.json"
                className="lottie-animation"
                title="Finance Animation"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="flex flex-col">
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/upload" className="text-gray-300 hover:text-white transition">
                  Upload Documents
                </Link>
              </li>
              <li>
                <Link to="/workauto" className="text-gray-300 hover:text-white transition">
                  Automated Analysis
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div className="flex flex-col">
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <p className="text-gray-300 mb-2">
              <i className="fas fa-envelope mr-2"></i> yashwanthk872@gmail.com
            </p>
            <p className="text-gray-300 mb-2">
              <i className="fas fa-phone mr-2"></i> +91 9063583262
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400 transition">
                <i className="fab fa-linkedin text-xl"></i>
              </a>
              <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400 transition">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400 transition">
                <i className="fab fa-instagram text-xl"></i>
              </a>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-center md:text-left">
            &copy; {year} All Rights Reserved | Yashwanth Kumar
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="/docs/terms-of-service.html" target="_blank" className="text-gray-300 hover:text-white text-sm transition">
              Terms of Service
            </a>
            <a href="/docs/privacy-policy.html" target="_blank" className="text-gray-300 hover:text-white text-sm transition">
              Privacy Policy
            </a>
            <Link to="/contact" className="text-gray-300 hover:text-white text-sm transition">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 