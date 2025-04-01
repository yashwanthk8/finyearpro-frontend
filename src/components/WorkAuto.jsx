import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DataVisualizer from './DataVisualizer';
import Navbarm from './Navbarm';

const WorkAuto = () => {
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
      <div className="mt-16">
        <DataVisualizer />
      </div>
    </>
  );
};

export default WorkAuto;

              