import React, { useRef } from 'react'
import './Upload.css'
import { Link } from 'react-router-dom'
import Navbarm from './Navbarm'

const UploadPage = () => {
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
      <div className="container mt-16">
        
        {/* First Split Section */}
        <div className="split-section" id="split-1">
          <div className="split-box">
            <h1 className="split-heading">
              <span className="split-heading-main">Manual Analytics</span>
              {/* <span className="split-heading-sub">First section</span> */}
            </h1>
            <Link to="/auto" className="btn btn-outline-white">Learn More</Link>
          </div>
        </div>
        
        {/* Second Split Section */}
        <div className="split-section" id="split-2">
          <div className="split-box">
            <h1 className="split-heading">
              <span className="split-heading-main">Automated Analytics</span>
              {/* <span className="split-heading-sub">Second Section</span> */}
            </h1>
            <Link to="/workauto" className="btn btn-outline-white">Learn More</Link>
          </div>
        </div>
        
      </div>
    </>
  )
}

export default UploadPage
