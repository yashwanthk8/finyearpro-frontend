import React, { useState } from 'react';
import './Navbar.css'; // Your CSS file

function Navbarm({ scrollToSection, sections }) {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  const handleNavClick = (section) => {
    scrollToSection(section);
    setMenuOpen(false); // Close menu after clicking
  };
  
  return (
    <nav className="first">
      <h1 className="fheading">Data Analysis</h1>
      
      <div className="menu-btn" onClick={toggleMenu}>
        {menuOpen ? '✕' : '☰'}
      </div>
      
      <ul className={menuOpen ? 'flist show' : 'flist'}>
        <li onClick={() => handleNavClick(sections.heroRef)}>Home</li>
        <li onClick={() => handleNavClick(sections.stepwiseRef)}>How It Works</li>
        <li onClick={() => handleNavClick(sections.featuresRef)}>Features</li>
        <li onClick={() => handleNavClick(sections.benefitsRef)}>Benefits</li>
      </ul>
    </nav>
  );
}

export default Navbarm;
