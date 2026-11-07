import React from 'react';
import { Shield, Heart, AlertTriangle, Database, Lock, PhoneCall } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emergency-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emergency-600/30">
                <Shield className="w-5 h-5 fill-white/20" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">LIFE<span className="text-emergency-500">TAG</span></span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-normal">
              "When you can't speak, let Lifetag speak for you." Smart QR-based identification connecting first responders with life-saving medical data and immediate contacts.
            </p>
            <div className="pt-2 text-xs text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Emergency Dispatch Network Active
            </div>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Supported QR Accessories</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="hover:text-white transition-colors cursor-pointer" onClick={() => onNavigate('qrstudio')}>Motorcycle Helmet Stickers</li>
              <li className="hover:text-white transition-colors cursor-pointer" onClick={() => onNavigate('qrstudio')}>Scooter & Bike Visor Decals</li>
              <li className="hover:text-white transition-colors cursor-pointer" onClick={() => onNavigate('qrstudio')}>Wallet Emergency Cards</li>
              <li className="hover:text-white transition-colors cursor-pointer" onClick={() => onNavigate('qrstudio')}>Student & Corporate ID Cards</li>
              <li className="hover:text-white transition-colors cursor-pointer" onClick={() => onNavigate('qrstudio')}>Medical Alert Wristbands</li>
            </ul>
          </div>

          {/* Technology & Privacy */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Security & Architecture</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-brand-400" /> Non-guessable Crypto Tokens</li>
              <li className="flex items-center gap-2"><Database className="w-3.5 h-3.5 text-brand-400" /> MySQL 8.0 3NF Architecture</li>
              <li className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-brand-400" /> User-Controlled Privacy Toggles</li>
              <li className="flex items-center gap-2"><PhoneCall className="w-3.5 h-3.5 text-brand-400" /> Instant One-Tap Contact Calling</li>
            </ul>
          </div>

          {/* Academic Disclaimer */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Emergency Platform Notice
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Lifetag is an emergency identification platform. It displays authorized personal & emergency contact details to first responders. Lifetag does not replace emergency medical diagnosis, ambulance dispatch, or hospital services.
            </p>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 LIFETAG Platform. Built as an Academic DBMS Capstone Project on MySQL 8.0 & Java JDBC.</p>
          <div className="flex items-center gap-6">
            <span>MySQL 8.0 (3NF)</span>
            <span>Java 24 JDBC</span>
            <span>Node.js / Express</span>
            <span>React + Tailwind</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
