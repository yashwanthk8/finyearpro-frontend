import React, { useRef } from 'react';
import Navbarm from './Navbarm';

const ContactUs = () => {
  // Create empty refs for the Navbarm component
  const heroRef = useRef(null);
  const stepwiseRef = useRef(null);
  const featuresRef = useRef(null);
  const benefitsRef = useRef(null);

  return (
    <>
      <Navbarm 
        scrollToSection={() => {}} 
        sections={{ heroRef, stepwiseRef, featuresRef, benefitsRef }} 
      />
      
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
              Our Team
            </h1>
            <p className="mt-4 text-xl text-gray-500">
              Meet the talented professionals behind FinYearPro.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12">
            {/* Team Member 1 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:transform hover:scale-105">
              <div className="bg-blue-600 h-8"></div>
              <div className="p-6 text-center">
                <div className="h-32 w-32 rounded-full bg-blue-500 mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                  YK
                </div>
                <h3 className="text-xl font-bold text-gray-900">Yashwanth Kumar</h3>
                <p className="text-blue-600 mb-3">Lead Developer</p>
                <p className="text-gray-600 mb-4">
                  Responsible for application architecture, backend development, and system integration.
                </p>
                <div className="flex justify-center space-x-4">
                  <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                    <i className="fab fa-linkedin text-xl"></i>
                  </a>
                  <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-black">
                    <i className="fab fa-github text-xl"></i>
                  </a>
                  <a href="mailto:yashwanthk872@gmail.com" className="text-red-500 hover:text-red-700">
                    <i className="fas fa-envelope text-xl"></i>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Team Member 2 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:transform hover:scale-105">
              <div className="bg-blue-600 h-8"></div>
              <div className="p-6 text-center">
                <div className="h-32 w-32 rounded-full bg-blue-500 mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                  R
                </div>
                <h3 className="text-xl font-bold text-gray-900">bindu</h3>
                <p className="text-blue-600 mb-3">Data Analyst</p>
                <p className="text-gray-600 mb-4">
                  Specializes in data analytics, statistical modeling, and visualization of financial data.
                </p>
                <div className="flex justify-center space-x-4">
                  <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                    <i className="fab fa-linkedin text-xl"></i>
                  </a>
                  <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-black">
                    <i className="fab fa-github text-xl"></i>
                  </a>
                  <a href="mailto:info@finyearpro.com" className="text-red-500 hover:text-red-700">
                    <i className="fas fa-envelope text-xl"></i>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Team Member 3 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:transform hover:scale-105">
              <div className="bg-blue-600 h-8"></div>
              <div className="p-6 text-center">
                <div className="h-32 w-32 rounded-full bg-blue-500 mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                  A
                </div>
                <h3 className="text-xl font-bold text-gray-900">Bhushan</h3>
                <p className="text-blue-600 mb-3">UI/UX Designer</p>
                <p className="text-gray-600 mb-4">
                  Creates intuitive user interfaces and experiences, focusing on accessibility and aesthetics.
                </p>
                <div className="flex justify-center space-x-4">
                  <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                    <i className="fab fa-linkedin text-xl"></i>
                  </a>
                  <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-black">
                    <i className="fab fa-github text-xl"></i>
                  </a>
                  <a href="mailto:info@finyearpro.com" className="text-red-500 hover:text-red-700">
                    <i className="fas fa-envelope text-xl"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Get In Touch</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                <p className="flex items-center text-gray-600 mb-3">
                  <i className="fas fa-envelope mr-3 text-blue-600"></i>
                  yashwanthk872@gmail.com
                </p>
                <p className="flex items-center text-gray-600 mb-3">
                  <i className="fas fa-phone mr-3 text-blue-600"></i>
                  +91 9063583262
                </p>
                <p className="flex items-center text-gray-600">
                  <i className="fas fa-map-marker-alt mr-3 text-blue-600"></i>
                  Hyderabad, Telangana, India
                </p>
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Follow Us</h3>
                  <div className="flex space-x-4">
                    <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      <i className="fab fa-linkedin text-2xl"></i>
                    </a>
                    <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">
                      <i className="fab fa-twitter text-2xl"></i>
                    </a>
                    <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800">
                      <i className="fab fa-instagram text-2xl"></i>
                    </a>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Send us a message</h3>
                <form>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-2">Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      placeholder="Your email"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="message" className="block text-gray-700 text-sm font-medium mb-2">Message</label>
                    <textarea 
                      id="message" 
                      rows="4" 
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      placeholder="Your message"
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUs; 