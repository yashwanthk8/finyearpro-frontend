import React, { useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import FileChat from './components/FileChat';
import Navbarm from './components/Navbarm';
import HeroSec from './components/HeroSec';
import StepWise from './components/StepWise';
import Features from './components/Features';
import Benfits from './components/Benfits';
import UploadPage from './components/UploadPage';
import './index.css';
import Auto from './components/Auto';
import Manual from './components/Manual';
import WorkAuto from './components/WorkAuto';
import Submissions from './components/Submissions';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import AnalysisDetails from './components/Analysis/AnalysisDetails';
import DebugTool from './components/Dashboard/DebugTool';
import Footer from './components/Footer';
import ContactUs from './components/ContactUs';

// Debug page component
const DebugPage = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Page</h1>
      <DebugTool />
      <div className="mt-4">
        <Link to="/dashboard" className="text-blue-600 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function AppContent() {
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
        {/* Public routes */}
        <Route
          path="/"
          element={
            <>
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
              <Footer />
            </>
          }
        />
        
        {/* Authentication routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Contact Us route */}
        <Route path="/contact" element={<ContactUs />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <>
              <Dashboard />
              <Footer />
            </>
          </ProtectedRoute>
        } />
        
        <Route path="/upload" element={
          <ProtectedRoute>
            <>
              <UploadPage />
              <Footer />
            </>
          </ProtectedRoute>
        } />
        
        <Route path="/auto" element={
          <ProtectedRoute>
            <>
              <Auto/>
              <Footer />
            </>
          </ProtectedRoute>
        } />
        
        <Route path="/manual" element={
          <ProtectedRoute>
            <>
              <Manual/>
              <Footer />
            </>
          </ProtectedRoute>
        } />
        
        <Route path="/workauto" element={
          <ProtectedRoute>
            <>
              <WorkAuto/>
              <Footer />
            </>
          </ProtectedRoute>
        } />
        
        <Route path="/submissions" element={
          <ProtectedRoute>
            <>
              <Submissions/>
              <Footer />
            </>
          </ProtectedRoute>
        } />
        
        <Route path="/analysis/:id" element={
          <ProtectedRoute>
            <>
              <AnalysisDetails />
              <Footer />
            </>
          </ProtectedRoute>
        } />
        
        {/* Debug route */}
        <Route path="/debug" element={
          <ProtectedRoute>
            <>
              <DebugPage />
              <Footer />
            </>
          </ProtectedRoute>
        } />
      </Routes>
      <FileChat />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
