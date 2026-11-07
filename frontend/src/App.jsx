import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import { LoginPage, RegisterPage, ForgotPasswordPage } from './pages/AuthPages';
import Dashboard from './pages/Dashboard';
import ProfileEditor from './pages/ProfileEditor';
import MedicalEditor from './pages/MedicalEditor';
import ContactsManager from './pages/ContactsManager';
import PrivacySettings from './pages/PrivacySettings';
import QRStudio from './pages/QRStudio';
import EmergencyMode from './pages/EmergencyMode';
import { api, getAuthToken, removeAuthToken } from './services/api';

const getInitialEmergencyToken = () => {
  if (typeof window === 'undefined') return null;
  const match = window.location.pathname.match(/^\/emergency\/([A-Za-z0-9_-]+)/i);
  return match ? match[1] : null;
};

export default function App() {
  const [emergencyToken, setEmergencyToken] = useState(getInitialEmergencyToken);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('landing'); // landing | login | register | forgot | dashboard | profile | medical | contacts | privacy | qrstudio | demo
  const [loadingUser, setLoadingUser] = useState(true);

  // Check existing session only when NOT in emergency view
  useEffect(() => {
    if (!emergencyToken) {
      checkExistingSession();
    }
  }, [emergencyToken]);

  const checkExistingSession = async () => {
    const token = getAuthToken();
    if (!token) {
      setLoadingUser(false);
      return;
    }

    try {
      const res = await api.getMe();
      setUser(res.user);
      if (currentPage === 'landing' || currentPage === 'login' || currentPage === 'register') {
        setCurrentPage('dashboard');
      }
    } catch (err) {
      console.warn('Session expired or invalid:', err.message);
      removeAuthToken();
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
    setCurrentPage('landing');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Dedicated Public Emergency Scan Route (NO NAVBAR, NO FOOTER, ZERO DELAY)
  if (emergencyToken) {
    return (
      <EmergencyMode 
        token={emergencyToken} 
        onBack={() => {
          window.history.pushState({}, '', '/');
          setEmergencyToken(null);
          setCurrentPage('landing');
        }} 
      />
    );
  }

  // 2. Demo Emergency Mode triggered from Landing Page
  if (currentPage === 'demo') {
    return (
      <EmergencyMode 
        token="LT-SUDHA-A1B2C3D4E5" 
        onBack={() => setCurrentPage('landing')} 
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onNavigate={handleNavigate} 
        currentPage={currentPage} 
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentPage === 'landing' && <LandingPage onNavigate={handleNavigate} />}
        {currentPage === 'login' && <LoginPage onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />}
        {currentPage === 'register' && <RegisterPage onRegisterSuccess={handleLoginSuccess} onNavigate={handleNavigate} />}
        {currentPage === 'forgot' && <ForgotPasswordPage onNavigate={handleNavigate} />}
        
        {/* Protected Authenticated Pages */}
        {currentPage === 'dashboard' && <Dashboard user={user} onNavigate={handleNavigate} />}
        {currentPage === 'profile' && <ProfileEditor user={user} onProfileUpdated={checkExistingSession} />}
        {currentPage === 'medical' && <MedicalEditor user={user} />}
        {currentPage === 'contacts' && <ContactsManager />}
        {currentPage === 'privacy' && <PrivacySettings user={user} />}
        {currentPage === 'qrstudio' && <QRStudio user={user} />}
      </main>

      {/* Bottom Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
