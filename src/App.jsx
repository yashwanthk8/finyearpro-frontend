import React, { useRef } from 'react';
import Navbarm from './components/Navbarm';
import HeroSec from './components/HeroSec';
import StepWise from './components/StepWise';
import Features from './components/Features';
import Benfits from './components/Benfits';
import './index.css';

function App() {
  const heroRef = useRef(null);
  const stepwiseRef = useRef(null);
  const featuresRef = useRef(null);
  const benefitsRef = useRef(null);
  const scrollToSection = (sectionRef) => {
    sectionRef.current.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <>
      {/* Pass scrollToSection function to Navbarm with refs */}
      <Navbarm scrollToSection={scrollToSection} sections={{ heroRef, stepwiseRef, featuresRef, benefitsRef }} />
      <div ref={heroRef}><HeroSec /></div>
      <br/>
      <hr className="responsive-line" />
      <div ref={stepwiseRef}><StepWise /></div>
      <br/>
      <hr className="responsive-line" />
      <br/>
      <div ref={featuresRef}><Features /></div>
      <br/>
      <hr className="responsive-line" />
      <div ref={benefitsRef}><Benfits /></div>
    </>
  );
}
export default App;