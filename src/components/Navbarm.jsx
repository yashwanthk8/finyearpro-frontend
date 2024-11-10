import React from 'react';
import './Navbar.css'; // Your CSS file
function Navbarm({ scrollToSection, sections }) {
  return (
    <nav className="first">
      <h1 className="fheading">Data Analysis</h1>
      <ul className="flist">
        <li onClick={() => scrollToSection(sections.heroRef)}>Home</li>
        <li onClick={() => scrollToSection(sections.stepwiseRef)}>How It Works</li>
        <li onClick={() => scrollToSection(sections.featuresRef)}>Features</li>
        <li onClick={() => scrollToSection(sections.benefitsRef)}>Benefits</li>
      </ul>
    </nav>
  );
}

export default Navbarm;
