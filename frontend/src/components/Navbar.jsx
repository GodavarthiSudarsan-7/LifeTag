import React from 'react';
import { Shield, QrCode, User, LogOut, HeartPulse, Menu, X, ArrowRight } from 'lucide-react';

export default function Navbar({ user, onLogout, onNavigate, currentPage }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 text-emergency-500 fill-emergency-500/20" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">LIFE<span className="text-emergency-600">TAG</span></span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-100 text-brand-700 tracking-wider">SMART ID</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">Emergency Identification Platform</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {!user ? (
              <>
                <button 
                  onClick={() => onNavigate('landing')} 
                  className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${currentPage === 'landing' ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => onNavigate('demo')} 
                  className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${currentPage === 'demo' ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                >
                  Emergency Demo
                </button>
                <button 
                  onClick={() => onNavigate('login')}
                  className="ml-3 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => onNavigate('register')}
                  className="px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5"
                >
                  Create Your Lifetag
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => onNavigate('dashboard')} 
                  className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${currentPage === 'dashboard' ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => onNavigate('profile')} 
                  className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${currentPage === 'profile' ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                >
                  Profile
                </button>
                <button 
                  onClick={() => onNavigate('medical')} 
                  className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${currentPage === 'medical' ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                >
                  Medical Info
                </button>
                <button 
                  onClick={() => onNavigate('contacts')} 
                  className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${currentPage === 'contacts' ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                >
                  Contacts
                </button>
                <button 
                  onClick={() => onNavigate('privacy')} 
                  className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${currentPage === 'privacy' ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                >
                  Privacy
                </button>
                <button 
                  onClick={() => onNavigate('qrstudio')} 
                  className={`px-3.5 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-1.5 ${currentPage === 'qrstudio' ? 'bg-emergency-600 text-white shadow-sm' : 'text-emergency-600 hover:bg-emergency-50'}`}
                >
                  <QrCode className="w-4 h-4" />
                  QR Studio
                </button>

                {/* User Dropdown / Sign Out */}
                <div className="ml-4 pl-4 border-l border-slate-200 flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900 leading-tight">{user.full_name || user.email}</p>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">Blood: {user.blood_group || 'Active'}</span>
                  </div>
                  <button 
                    onClick={onLogout}
                    title="Sign Out"
                    className="p-2 text-slate-400 hover:text-emergency-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {!user ? (
            <>
              <button 
                onClick={() => { onNavigate('landing'); setMobileMenuOpen(false); }} 
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100"
              >
                Overview
              </button>
              <button 
                onClick={() => { onNavigate('demo'); setMobileMenuOpen(false); }} 
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100"
              >
                Emergency Demo
              </button>
              <button 
                onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }} 
                className="w-full text-left px-3 py-2 text-sm font-semibold rounded-lg text-brand-600 hover:bg-brand-50"
              >
                Sign In
              </button>
              <button 
                onClick={() => { onNavigate('register'); setMobileMenuOpen(false); }} 
                className="w-full px-4 py-2.5 text-center text-sm font-bold text-white bg-slate-900 rounded-lg shadow"
              >
                Create Your Lifetag
              </button>
            </>
          ) : (
            <>
              <div className="px-3 py-2 border-b border-slate-100 mb-2">
                <p className="text-sm font-bold text-slate-900">{user.full_name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <button onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100">Dashboard</button>
              <button onClick={() => { onNavigate('profile'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100">Personal Profile</button>
              <button onClick={() => { onNavigate('medical'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100">Medical Information</button>
              <button onClick={() => { onNavigate('contacts'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100">Emergency Contacts</button>
              <button onClick={() => { onNavigate('privacy'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100">Privacy Settings</button>
              <button onClick={() => { onNavigate('qrstudio'); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm font-bold rounded-lg text-emergency-600 bg-emergency-50">QR Code Studio</button>
              <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm font-semibold rounded-lg text-red-600 hover:bg-red-50 mt-2">Sign Out</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
