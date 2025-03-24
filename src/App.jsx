import React, { useRef } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import React Router components
import Navbarm from './components/Navbarm';
import HeroSec from './components/HeroSec';
import StepWise from './components/StepWise';
import Features from './components/Features';
import Benfits from './components/Benfits';
import UploadPage from './components/UploadPage'; // Assuming you have an UploadPage component
import './index.css'; // or './App.css' if you are using another file for global styles
import Auto from './components/Auto';
import Manual from './components/Manual';
import WorkAuto from './components/WorkAuto';
import Submissions from './components/Submissions';

function App() {
  const heroRef = useRef(null);
  const stepwiseRef = useRef(null);
  const featuresRef = useRef(null);
  const benefitsRef = useRef(null);

  // Function for smooth scrolling
  const scrollToSection = (sectionRef) => {
    sectionRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Router>
      <Routes>
        {/* Define route for Home (scroll to sections) */}
        <Route
          path="/"
          element={
            <>
              {/* Pass scrollToSection function to Navbarm with refs */}
              <Navbarm scrollToSection={scrollToSection} sections={{ heroRef, stepwiseRef, featuresRef, benefitsRef }} />
              <div ref={heroRef}><HeroSec /></div>
              <br />
              <hr className="responsive-line" />
              <div ref={stepwiseRef}><StepWise /></div>
              <br />
              <br />
              <br/>
              <br/>
              <br/>
              <br/>
              <br />
              <br/>
              <br/>
              <br/>
              <br/>
              <hr className="responsive-line" />
              <br/>
              <div ref={featuresRef}><Features /></div>
              <br />
              <hr className="responsive-line" />
              <div ref={benefitsRef}><Benfits /></div>

              
            </>
          }
        />
        {/* Define route for UploadPage */}
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/auto" element={<Auto/>}/>
        <Route path="/manual" element={<Manual/>}/>
        <Route path="/workauto" element={<WorkAuto/>}/>
        <Route path="/submissions" element={<Submissions/>}/>
      </Routes>
    </Router>
  );
}

export default App;
