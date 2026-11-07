import React, { useState } from 'react';
import { 
  Shield, QrCode, PhoneCall, AlertCircle, HeartPulse, Lock, ArrowRight, 
  CheckCircle2, AlertTriangle, Eye, Sparkles, Smartphone, ChevronDown, 
  MapPin, Activity, HelpCircle, FileText
} from 'lucide-react';

export default function LandingPage({ onNavigate }) {
  const [activeFaq, setActiveFaq] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);

  const faqs = [
    {
      q: "Does the QR code store my medical information directly?",
      a: "No. For maximum security, the QR code contains only a secure, non-guessable cryptographic URL (e.g. https://lifetag.in/emergency/LT-USR-XXXX). Medical data is fetched dynamically from our MySQL database, allowing you to update or revoke information anytime without reprinting the sticker."
    },
    {
      q: "Does a bystander or first responder need an app or account to scan?",
      a: "No! Any smartphone camera or QR scanner opens the emergency profile instantly in the mobile browser. No login, app installation, or account creation is required for the scanner in an emergency."
    },
    {
      q: "Can I control what information is shown during an emergency scan?",
      a: "Yes. In your Privacy Settings, you have granular toggles for blood group, allergies, conditions, medications, address, and secondary contacts. Only fields you authorize are displayed."
    },
    {
      q: "What happens if I lose my helmet or card with the QR code?",
      a: "You can revoke the tag with a single click from your Lifetag dashboard. Once revoked, our database trigger immediately blocks any further scans, and you can regenerate a new unique QR code instantly."
    },
    {
      q: "How does the Emergency Alert & Location feature work?",
      a: "When a bystander scans your tag, they can click 'Share Location'. If browser permission is granted, their GPS coordinates are logged and WhatsApp/SMS alert links with Google Maps pins are generated for your emergency contacts."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-navy-950 text-white">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand-500/10 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-emergency-600/15 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emergency-950/80 border border-emergency-800/80 text-emergency-400 text-xs font-bold tracking-wide shadow-inner">
                <span className="w-2 h-2 rounded-full bg-emergency-500 animate-ping"></span>
                <span>CRITICAL EMERGENCY MEDICAL IDENTIFICATION</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
                When You Can't Speak, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emergency-500 via-rose-400 to-amber-300">
                  Let Lifetag Speak for You.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Your emergency identification, blood group, vital medical alerts, and primary family contacts — one instant smartphone scan away before the golden hour slips away.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button 
                  onClick={() => onNavigate('register')}
                  className="w-full sm:w-auto px-8 py-4 bg-emergency-600 hover:bg-emergency-500 text-white font-extrabold text-base rounded-xl shadow-xl shadow-emergency-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Create Your Lifetag
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => onNavigate('demo')}
                  className="w-full sm:w-auto px-7 py-4 bg-slate-800/80 hover:bg-slate-700/80 text-white border border-slate-700 font-bold text-base rounded-xl transition-all flex items-center justify-center gap-2 backdrop-blur-sm"
                >
                  <Eye className="w-5 h-5 text-brand-400" />
                  Try Live Emergency Scan
                </button>
              </div>

              {/* Key Trust Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0">
                <div>
                  <p className="text-2xl font-black text-white">0s</p>
                  <p className="text-xs text-slate-400 font-medium">No App Download Needed</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-emerald-400">100%</p>
                  <p className="text-xs text-slate-400 font-medium">Privacy Controlled</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-brand-400">1-Tap</p>
                  <p className="text-xs text-slate-400 font-medium">Emergency Family Calling</p>
                </div>
              </div>
            </div>

            {/* Right: Realistic Motorcycle Helmet Simulation with Interactive Scan */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                
                {/* Helmet Display Card */}
                <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl overflow-hidden group">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emergency-500"></div>
                      <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">Interactive Helmet Decal</span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Live Simulation</span>
                  </div>

                  {/* Helmet Visual Canvas */}
                  <div className="relative my-6 py-6 flex flex-col items-center justify-center">
                    
                    {/* Simulated Motorcycle Helmet Graphic */}
                    <div className="relative w-64 h-60 bg-gradient-to-b from-slate-950 via-slate-900 to-black rounded-t-[100px] rounded-b-[40px] shadow-2xl border-2 border-slate-700 flex flex-col items-center justify-center p-4">
                      {/* Helmet Visor */}
                      <div className="w-48 h-20 bg-gradient-to-b from-cyan-950 via-slate-900 to-black rounded-t-3xl rounded-b-xl border border-cyan-500/30 shadow-inner flex items-center justify-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/5 transform -skew-x-12"></div>
                        <span className="text-[10px] tracking-widest text-cyan-400 font-bold uppercase opacity-60">HELMET VISOR</span>
                      </div>

                      {/* Attached Lifetag Sticker */}
                      <div className="mt-4 bg-white p-3 rounded-xl shadow-2xl border-2 border-emergency-600 flex items-center gap-3 w-52 transform hover:scale-105 transition-transform duration-300">
                        <div className="p-1 bg-slate-900 rounded-lg shrink-0">
                          <QrCode className="w-12 h-12 text-white" />
                        </div>
                        <div className="text-slate-900 leading-tight">
                          <p className="text-[9px] font-black uppercase text-emergency-600 tracking-wide">SCAN IN EMERGENCY</p>
                          <p className="text-[11px] font-black">LIFETAG #LT-001</p>
                          <p className="text-[8px] text-slate-500 font-bold">Blood: A+ | Emergency ID</p>
                        </div>
                      </div>

                      {/* Laser scanner effect when active */}
                      {scannerActive && (
                        <div className="absolute inset-x-4 top-10 h-1 bg-gradient-to-r from-transparent via-emergency-500 to-transparent shadow-[0_0_15px_#EF4444] animate-bounce"></div>
                      )}
                    </div>
                  </div>

                  {/* Simulation Trigger */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setScannerActive(true);
                        setTimeout(() => {
                          setScannerActive(false);
                          onNavigate('demo');
                        }, 900);
                      }}
                      className="w-full py-3 px-4 bg-brand-500 hover:bg-brand-400 text-slate-950 font-black rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25"
                    >
                      <Smartphone className="w-4 h-4" />
                      {scannerActive ? 'Scanning Helmet QR...' : 'Simulate Scanning This Helmet'}
                    </button>
                    <p className="text-center text-[11px] text-slate-400 mt-2">
                      Click to experience the instant emergency screen a bystander sees
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM STATEMENT */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-emergency-600">The Emergency Crisis</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              In a Road Accident, Minutes Make the Difference Between Life and Death
            </p>
            <p className="text-base text-slate-600">
              When a rider or pedestrian meets with an unexpected accident, smartphones are locked by passcodes, identity cards are buried in backpacks, and victims are frequently unconscious.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emergency-100 text-emergency-600 flex items-center justify-center font-bold">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Unconscious & Unidentifiable</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                First responders arrive at the scene with zero knowledge of the victim's identity, pre-existing conditions, or severe drug allergies like penicillin.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <PhoneCall className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Locked Phones Delay Family</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Biometric and PIN lockouts prevent police or bystanders from contacting parents, spouses, or siblings during the initial vital golden hour.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-8 rounded-2xl space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-brand-600 flex items-center justify-center font-bold">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Wrong Blood Transfusion Risk</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Crucial blood group information is not immediately accessible at the accident spot, delaying emergency field treatment or emergency transport.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW LIFETAG WORKS — 3 STEP PROCESS */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-brand-600">Simple Life-Saving Workflow</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              3 Steps to Complete Emergency Preparedness
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 relative">
            {/* Step 1 */}
            <div className="bg-white border border-slate-200/80 p-8 rounded-2xl shadow-sm space-y-4 relative">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900">Register & Enter Medical Data</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Provide your blood group, emergency contacts, known allergies, chronic conditions, and precautions. Set your privacy visibility preferences.
              </p>
              <div className="pt-2 text-xs font-semibold text-brand-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Takes less than 2 minutes
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-slate-200/80 p-8 rounded-2xl shadow-sm space-y-4 relative">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900">Download & Print QR Sticker</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Choose from 5 professionally designed templates: motorcycle helmet decal, scooter visor sticker, wallet card, student ID card, or wristband.
              </p>
              <div className="pt-2 text-xs font-semibold text-brand-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Instant PNG & High-Res PDF
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-slate-200/80 p-8 rounded-2xl shadow-sm space-y-4 relative">
              <div className="w-10 h-10 rounded-full bg-emergency-600 text-white flex items-center justify-center font-black text-sm">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900">Bystander Scans & Saves You</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                When an accident occurs, any smartphone camera opens your Emergency Profile immediately without passwords. Contacts can be called with 1 tap.
              </p>
              <div className="pt-2 text-xs font-semibold text-emergency-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Zero login required for scanner
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHERE TO ATTACH YOUR LIFETAG */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Universal Versatility</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Attach Lifetag to Any Daily Gear
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-12">
            {[
              { title: 'Motorcycle Helmets', desc: 'Directly on the chin bar or back shell', icon: '🏍️' },
              { title: 'Bicycles & Scooters', desc: 'On the handlebar stem or frame tube', icon: '🛵' },
              { title: 'Wallets & Purses', desc: 'Credit-card sized emergency ID card', icon: '💳' },
              { title: 'ID Cards & Badges', desc: 'Student, college or corporate lanyards', icon: '🪪' },
              { title: 'Medical Wristbands', desc: 'Wearable silicone or velcro wrist straps', icon: '⌚' }
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center space-y-2 hover:border-brand-500 transition-colors">
                <div className="text-3xl mb-1">{item.icon}</div>
                <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                <p className="text-xs text-slate-500 leading-normal">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PRIVACY & SECURITY ARCHITECTURE */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">Enterprise-Grade Security</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Your Health Data is Safe. <br />You Control Every Field.
              </h2>
              <p className="text-slate-300 text-base leading-relaxed">
                Emergency identification does not mean sacrificing your personal privacy. Lifetag is engineered with privacy-by-design principles:
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 text-brand-400 shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Non-Guessable Cryptographic QR Identifiers</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Tokens are generated with cryptographically secure random bytes (e.g. LT-SUDHA-A1B2C3), preventing enumeration attacks.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Granular Privacy Toggles</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Decide whether to show or hide your photograph, residential address, specific medications, or secondary contacts during emergency scans.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 text-emergency-400 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Instant Token Revocation</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Lost your helmet or wallet? Revoke the tag from your dashboard immediately. Database triggers instantly block further scans.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Privacy Simulation Graphic */}
            <div className="bg-slate-800/90 border border-slate-700 p-8 rounded-3xl shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-bold text-white">Privacy Filtering Engine</span>
                </div>
                <span className="text-xs text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded">Active Filter</span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-slate-900/80 rounded-xl border border-slate-700/50">
                  <span className="text-xs font-semibold text-slate-300">Blood Group & Allergies</span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">Visible in Emergency</span>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-slate-900/80 rounded-xl border border-slate-700/50">
                  <span className="text-xs font-semibold text-slate-300">Primary Emergency Contact</span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">Visible with 1-Tap Call</span>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-slate-900/80 rounded-xl border border-slate-700/50">
                  <span className="text-xs font-semibold text-slate-300">Full Home Address</span>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">Hidden (User Protected)</span>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-slate-900/80 rounded-xl border border-slate-700/50">
                  <span className="text-xs font-semibold text-slate-300">Scanner GPS Location</span>
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">Shared Only With Consent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Frequently Asked Questions</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">Everything You Need to Know</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <span className="font-bold text-slate-900 text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180 text-brand-600' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-6 py-4 bg-white text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section className="py-20 bg-gradient-to-r from-slate-950 via-slate-900 to-navy-950 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-emergency-600 mx-auto flex items-center justify-center shadow-2xl shadow-emergency-600/40">
            <Shield className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Be Prepared Before an Emergency Happens.
          </h2>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
            Join thousands of smart riders, commuters, and families. Create your personalized Lifetag in 2 minutes and print your sticker today.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => onNavigate('register')}
              className="px-9 py-4 bg-emergency-600 hover:bg-emergency-500 text-white font-extrabold text-base rounded-xl shadow-xl shadow-emergency-600/40 transition-all hover:scale-105"
            >
              Get Your Free Lifetag Now
            </button>
            <button 
              onClick={() => onNavigate('login')}
              className="px-7 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-base rounded-xl border border-slate-700 transition-all"
            >
              Sign In to Dashboard
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
