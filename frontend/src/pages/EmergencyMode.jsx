import React, { useState, useEffect } from 'react';
import { 
  Shield, PhoneCall, AlertTriangle, HeartPulse, MapPin, 
  Share2, AlertCircle, CheckCircle2, MessageSquare, Volume2, 
  ExternalLink, ArrowLeft, RefreshCw, Eye
} from 'lucide-react';
import { api } from '../services/api';

// Multilingual translations for emergency responders
const TRANSLATIONS = {
  en: {
    emergencyHeader: "EMERGENCY MEDICAL IDENTIFICATION",
    subHeader: "AUTHORIZED CLINICAL & CONTACT DOSSIER FOR FIRST RESPONDERS",
    bloodGroup: "BLOOD GROUP",
    organDonor: "ORGAN DONOR",
    criticalAllergies: "CRITICAL ALLERGIES",
    medicalConditions: "MEDICAL CONDITIONS",
    currentMeds: "CURRENT MEDICATIONS",
    precautions: "IMPORTANT EMERGENCY PRECAUTIONS",
    emergencyContacts: "EMERGENCY CONTACTS",
    primaryContact: "PRIMARY EMERGENCY CONTACT",
    secondaryContact: "SECONDARY CONTACT",
    callNow: "CALL NOW",
    shareLocation: "Share Accident Location With Family",
    shareLocationDesc: "Grants one-time GPS permission to send exact Google Maps location to registered family contacts.",
    locSharedSuccess: "Accident coordinates successfully logged & shared with family.",
    locDenied: "Location permission denied. Bystander can still call contacts directly.",
    sendAlert: "Dispatch Emergency Notification",
    sendAlertDesc: "Sends incident log to Lifetag and generates instant WhatsApp / SMS dispatch links.",
    largeFont: "Large Font",
    standardFont: "Standard Font",
    disclaimer: "Lifetag is an emergency identification platform. Powered by MySQL 8.0.",
    invalidTagTitle: "Invalid or Revoked Lifetag",
    invalidTagMsg: "This QR tag has either been revoked by the owner or reported lost. Information is inaccessible for security.",
    emergencyNotes: "EMERGENCY NOTES",
    city: "Location / City",
    age: "Age"
  },
  hi: {
    emergencyHeader: "आपातकालीन चिकित्सा पहचान",
    subHeader: "प्रथम उत्तरदाताओं के लिए अधिकृत आपातकालीन विवरण",
    bloodGroup: "रक्त समूह (BLOOD GROUP)",
    organDonor: "अंग दाता (ORGAN DONOR)",
    criticalAllergies: "गंभीर एलर्जी (ALLERGIES)",
    medicalConditions: "चिकित्सा स्थितियां (CONDITIONS)",
    currentMeds: "वर्तमान दवाएं (MEDICATIONS)",
    precautions: "महत्वपूर्ण आपातकालीन सावधानियां",
    emergencyContacts: "आपातकालीन संपर्क (CONTACTS)",
    primaryContact: "प्राथमिक आपातकालीन संपर्क",
    secondaryContact: "द्वितीयक संपर्क",
    callNow: "अभी कॉल करें (CALL NOW)",
    shareLocation: "परिवार के साथ दुर्घटना स्थल साझा करें",
    shareLocationDesc: "पंजीकृत परिवार को सटीक गूगल मैप्स स्थान भेजने के लिए जीपीएस अनुमति प्रदान करता है।",
    locSharedSuccess: "दुर्घटना निर्देशांक सफलतापूर्वक दर्ज किए गए।",
    locDenied: "स्थान अनुमति अस्वीकृत कर दी गई। आप अभी भी सीधे कॉल कर सकते हैं।",
    sendAlert: "आपातकालीन सूचना भेजें",
    sendAlertDesc: "लाइफटैग को घटना लॉग भेजता है और व्हाट्सएप / एसएमएस लिंक तैयार करता है।",
    largeFont: "बड़ा फ़ॉन्ट",
    standardFont: "सामान्य फ़ॉन्ट",
    disclaimer: "लाइफटैग एक आपातकालीन पहचान मंच है।",
    invalidTagTitle: "अमान्य या रद्द किया गया लाइफटैग",
    invalidTagMsg: "यह क्यूआर कोड स्वामी द्वारा रद्द कर दिया गया है या खो जाने की सूचना दी गई है।",
    emergencyNotes: "आपातकालीन नोट्स",
    city: "शहर",
    age: "आयु"
  },
  ta: {
    emergencyHeader: "அவசர மருத்துவ அடையாள அட்டை",
    subHeader: "முதல் மீட்பர்களுக்கான அங்கீகரிக்கப்பட்ட அவசர விவரங்கள்",
    bloodGroup: "இரத்த பிரிவு (BLOOD GROUP)",
    organDonor: "உறுப்பு தானம் (ORGAN DONOR)",
    criticalAllergies: "தீவிர ஒவ்வாமை (ALLERGIES)",
    medicalConditions: "மருத்துவ நிலைகள் (CONDITIONS)",
    currentMeds: "தற்போதைய மருந்துகள் (MEDS)",
    precautions: "முக்கிய அவசர முன்னெச்சரிக்கைகள்",
    emergencyContacts: "அவசர தொடர்புகள் (CONTACTS)",
    primaryContact: "முதன்மை அவசர தொடர்பு",
    secondaryContact: "இரண்டாம் தொடர்பு",
    callNow: "உடனே அழைக்கவும் (CALL NOW)",
    shareLocation: "விபத்து இடத்தை குடும்பத்துடன் பகிரவும்",
    shareLocationDesc: "குடும்பத்தினருக்கு துல்லியமான வரைபட இருப்பிடத்தை அனுப்ப ஒரு முறை ஜி.பி.எஸ் அனுமதி வழங்கவும்.",
    locSharedSuccess: "விபத்து இருப்பிடம் வெற்றிகரமாக பதிவு செய்யப்பட்டது.",
    locDenied: "இருப்பிட அனுமதி மறுக்கப்பட்டது. நீங்கள் நேரடியாக தொடர்புகளை அழைக்கலாம்.",
    sendAlert: "அவசர அறிவிப்பை அனுப்பவும்",
    sendAlertDesc: "லைஃப்டேக்கிற்கு பதிவு அனுப்பி வாட்ஸ்அப் / எஸ்எம்எஸ் இணைப்புகளை உருவாக்குகிறது.",
    largeFont: "பெரிய எழுத்து",
    standardFont: "இயல்பான எழுத்து",
    disclaimer: "லைஃப்டேக் என்பது அவசர அடையாள தளமாகும்.",
    invalidTagTitle: "செல்லுபடியாகாத அல்லது ரத்து செய்யப்பட்ட லைஃப்டேக்",
    invalidTagMsg: "இந்த க்யூஆர் குறியீடு உரிமையாளரால் ரத்து செய்யப்பட்டுள்ளது அல்லது தொலைந்துவிட்டதாக அறிவிக்கப்பட்டுள்ளது.",
    emergencyNotes: "அவசர குறிப்புகள்",
    city: "நகரம்",
    age: "வயது"
  }
};

export default function EmergencyMode({ token, onBack }) {
  const [lang, setLang] = useState('en');
  const [largeFont, setLargeFont] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  const [locationStatus, setLocationStatus] = useState(null);
  const [alertDispatches, setAlertDispatches] = useState(null);
  const [alertLoading, setAlertLoading] = useState(false);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  useEffect(() => {
    loadEmergencyProfile();
  }, [token]);

  const loadEmergencyProfile = async () => {
    setLoading(true);
    setErrorStatus(null);
    try {
      const res = await api.getEmergencyProfile(token);
      setProfile(res.profile);
    } catch (err) {
      console.error('[Emergency Scan Error]', err);
      setErrorStatus(err.message || 'Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  // Browser Geolocation sharing with explicit consent
  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus({ type: 'error', msg: 'Geolocation not supported by this browser.' });
      return;
    }

    setLocationStatus({ type: 'loading', msg: 'Acquiring GPS coordinates...' });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          await api.shareLocation(token, {
            latitude,
            longitude,
            city: `Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`
          });
          setLocationStatus({
            type: 'success',
            msg: t.locSharedSuccess,
            mapsUrl: `https://maps.google.com/?q=${latitude},${longitude}`
          });
        } catch (err) {
          setLocationStatus({ type: 'error', msg: 'Failed to transmit location to server.' });
        }
      },
      (err) => {
        console.warn('Geolocation denied', err);
        setLocationStatus({ type: 'error', msg: t.locDenied });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Dispatch emergency alert to contacts
  const handleTriggerAlert = async () => {
    setAlertLoading(true);
    try {
      const res = await api.triggerAlert(token, {
        message: 'Bystander initiated Lifetag emergency alert notification.',
        locationName: locationStatus?.mapsUrl ? 'GPS Shared' : 'Scanned by Bystander'
      });
      setAlertDispatches(res.dispatches);
    } catch (err) {
      alert('Alert dispatch failed: ' + err.message);
    } finally {
      setAlertLoading(false);
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-16 h-16 rounded-2xl bg-emergency-600 flex items-center justify-center animate-pulse shadow-xl shadow-emergency-600/50 mb-6">
          <HeartPulse className="w-9 h-9 text-white" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">Accessing Lifetag Emergency Profile...</h2>
        <p className="text-slate-400 text-sm mt-2 max-w-sm">
          Fetching authorized clinical precautions and emergency contacts from secure database.
        </p>
      </div>
    );
  }

  // 2. Error / Revoked / Blocked Tag State
  if (errorStatus || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="max-w-md bg-slate-900 border-2 border-emergency-600 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emergency-900/60 border border-emergency-500 flex items-center justify-center mx-auto text-emergency-500">
            <AlertTriangle className="w-9 h-9" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">{t.invalidTagTitle}</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              {errorStatus || t.invalidTagMsg}
            </p>
          </div>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 text-left space-y-1">
            <p className="font-bold text-slate-300">Security Safeguard Active:</p>
            <p>Database triggers have BLOCKED access to this tag to protect patient privacy after a reported loss or re-issuance.</p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 font-bold text-sm rounded-xl text-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Lifetag Home
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. Fully Valid Emergency Mode
  return (
    <div className={`min-h-screen bg-slate-950 text-white selection:bg-emergency-500 selection:text-white pb-20 ${largeFont ? 'text-lg' : 'text-base'}`}>
      
      {/* Top Floating Emergency Bar */}
      <header className="sticky top-0 z-50 bg-emergency-600 text-white px-4 py-3 shadow-xl border-b border-emergency-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 fill-white/20 animate-pulse" />
          <span className="font-black text-sm tracking-widest uppercase">LIFETAG EMERGENCY MODE</span>
        </div>

        {/* Accessibility & Language Toggles */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="flex items-center bg-emergency-800/80 rounded-lg p-0.5 border border-emergency-500 text-xs font-bold">
            <button onClick={() => setLang('en')} className={`px-2 py-1 rounded ${lang === 'en' ? 'bg-white text-emergency-800' : 'text-white'}`}>EN</button>
            <button onClick={() => setLang('hi')} className={`px-2 py-1 rounded ${lang === 'hi' ? 'bg-white text-emergency-800' : 'text-white'}`}>हिन्दी</button>
            <button onClick={() => setLang('ta')} className={`px-2 py-1 rounded ${lang === 'ta' ? 'bg-white text-emergency-800' : 'text-white'}`}>தமிழ்</button>
          </div>

          {/* Large font toggle */}
          <button
            onClick={() => setLargeFont(!largeFont)}
            className="p-1.5 rounded-lg bg-emergency-800 hover:bg-emergency-700 text-white text-xs font-bold border border-emergency-500"
            title="Toggle Accessibility Font Size"
          >
            {largeFont ? 'A-' : 'A+'}
          </button>
        </div>
      </header>

      {/* Main Emergency View Body */}
      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Patient Hero Card */}
        <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            
            {/* Photograph or Avatar placeholder */}
            <div className="relative shrink-0">
              {profile.photo_url ? (
                <img 
                  src={profile.photo_url} 
                  alt={profile.full_name} 
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-slate-800 shadow-xl"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-slate-800 border-4 border-slate-700 flex items-center justify-center text-4xl font-black text-slate-400">
                  {profile.full_name.charAt(0)}
                </div>
              )}
              {profile.organ_donor && (
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow border-2 border-slate-900">
                  ORGAN DONOR
                </div>
              )}
            </div>

            {/* Name & Vital Stats */}
            <div className="space-y-2 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emergency-950 border border-emergency-800 text-emergency-400 text-xs font-black uppercase">
                <span className="w-2 h-2 rounded-full bg-emergency-500 animate-ping"></span>
                Emergency Victim Profile
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {profile.full_name}
              </h1>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs sm:text-sm text-slate-400 font-medium">
                {profile.age && <span>{t.age}: <strong className="text-white">{profile.age} yrs</strong></span>}
                {profile.gender && <span>• {profile.gender}</span>}
                {profile.city && <span>• <MapPin className="w-3.5 h-3.5 inline text-brand-400" /> {profile.city}</span>}
              </div>

              {profile.address && (
                <p className="text-xs text-slate-400 border-t border-slate-800 pt-2">
                  Address: {profile.address}
                </p>
              )}
            </div>
          </div>

          {/* PROMINENT BLOOD GROUP BADGE (The most important vital sign) */}
          {profile.blood_group && (
            <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between bg-gradient-to-r from-emergency-950 via-slate-900 to-slate-900 p-4 rounded-2xl border border-emergency-900/60">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-emergency-400">{t.bloodGroup}</p>
                <p className="text-[11px] text-slate-400">Vital Transfusion Data</p>
              </div>
              <div className="px-5 py-2.5 bg-emergency-600 rounded-xl text-3xl sm:text-4xl font-black text-white tracking-wider shadow-lg shadow-emergency-600/40">
                {profile.blood_group}
              </div>
            </div>
          )}
        </div>

        {/* ONE-TAP EMERGENCY CONTACTS (Large Call Buttons) */}
        <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-extrabold uppercase tracking-wide text-white">{t.emergencyContacts}</h2>
            </div>
            <span className="text-xs text-emerald-400 font-bold bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
              One-Tap Calling
            </span>
          </div>

          {profile.contacts && profile.contacts.length > 0 ? (
            <div className="space-y-3">
              {profile.contacts.map((contact, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                    contact.is_primary ? 'bg-slate-800/90 border-emerald-500/60 shadow-lg' : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="font-black text-white text-base">{contact.contact_name}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                        {contact.relationship}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Tel: {contact.primary_phone}</p>
                    {contact.alt_phone && <p className="text-xs text-slate-500">Alt: {contact.alt_phone}</p>}
                  </div>

                  {/* LARGE CALL BUTTON */}
                  <a
                    href={`tel:${contact.primary_phone}`}
                    className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <PhoneCall className="w-5 h-5 fill-white" />
                    {t.callNow}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No emergency contacts authorized for display.</p>
          )}
        </div>

        {/* MEDICAL ALERTS SECTION */}
        <div className="space-y-4">
          
          {/* 1. Critical Allergies (Red Alert Box) */}
          {profile.allergies && profile.allergies.length > 0 && (
            <div className="bg-slate-900 border-2 border-emergency-700/80 rounded-3xl p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-emergency-500">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-black text-sm uppercase tracking-wider">{t.criticalAllergies}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {profile.allergies.map((allg, idx) => (
                  <div key={idx} className="p-3 bg-emergency-950/60 border border-emergency-800/80 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{allg.name}</span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emergency-900 text-emergency-300">
                        {allg.critical_level}
                      </span>
                    </div>
                    {allg.reaction && (
                      <p className="text-xs text-emergency-200/80">Reaction: {allg.reaction}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Medical Conditions (Amber Alert Box) */}
          {profile.conditions && profile.conditions.length > 0 && (
            <div className="bg-slate-900 border border-amber-600/60 rounded-3xl p-6 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-400">
                <HeartPulse className="w-5 h-5" />
                <h3 className="font-black text-sm uppercase tracking-wider">{t.medicalConditions}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {profile.conditions.map((cond, idx) => (
                  <div key={idx} className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{cond.name}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-900 text-amber-300">
                        {cond.severity}
                      </span>
                    </div>
                    {cond.notes && <p className="text-xs text-amber-200/70">{cond.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Current Medications */}
          {profile.medications && profile.medications.length > 0 && (
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-xl space-y-3">
              <h3 className="font-black text-sm uppercase tracking-wider text-brand-400">{t.currentMeds}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {profile.medications.map((med, idx) => (
                  <div key={idx} className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl space-y-0.5">
                    <p className="font-bold text-white text-sm">{med.name}</p>
                    <p className="text-xs text-slate-400">{med.dosage} • {med.frequency}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Precautions & Emergency Notes */}
          {(profile.precautions || profile.emergency_notes) && (
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-xl space-y-3">
              <h3 className="font-black text-sm uppercase tracking-wider text-slate-200">{t.precautions}</h3>
              {profile.precautions && (
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-sm text-slate-300 leading-relaxed">
                  {profile.precautions}
                </div>
              )}
              {profile.emergency_notes && (
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed">
                  <strong className="text-slate-300 block mb-1">{t.emergencyNotes}:</strong>
                  {profile.emergency_notes}
                </div>
              )}
            </div>
          )}
        </div>

        {/* BYSTANDER ACTIONS: SHARE LOCATION & DISPATCH ALERTS */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-white">
            <Share2 className="w-5 h-5 text-brand-400" />
            <h3 className="font-bold text-sm uppercase tracking-wide">Bystander First-Aid Tools</h3>
          </div>

          {/* Share Location Button */}
          {profile.allow_location_prompt && (
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    {t.shareLocation}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{t.shareLocationDesc}</p>
                </div>
                <button
                  onClick={handleShareLocation}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs rounded-xl text-white shrink-0 active:scale-95 transition-all"
                >
                  Share GPS
                </button>
              </div>

              {locationStatus && (
                <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  locationStatus.type === 'success' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                  locationStatus.type === 'error' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-slate-800 text-slate-300'
                }`}>
                  {locationStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  {locationStatus.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{locationStatus.msg}</span>
                </div>
              )}
            </div>
          )}

          {/* Dispatch WhatsApp/SMS Alert Link Generator */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-brand-400" />
                  {t.sendAlert}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">{t.sendAlertDesc}</p>
              </div>
              <button
                onClick={handleTriggerAlert}
                disabled={alertLoading}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-500 font-bold text-xs rounded-xl text-white shrink-0 active:scale-95 transition-all disabled:opacity-50"
              >
                {alertLoading ? 'Preparing...' : 'Notify Contacts'}
              </button>
            </div>

            {/* Generated WhatsApp / SMS Dispatches */}
            {alertDispatches && (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <p className="text-xs font-bold text-emerald-400">Incident Logged! Choose dispatch app below:</p>
                {alertDispatches.map((disp, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl text-xs">
                    <span className="font-medium text-slate-300">{disp.contact_name} ({disp.phone})</span>
                    <div className="flex items-center gap-2">
                      <a
                        href={disp.whatsapp_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 font-bold text-white rounded-lg flex items-center gap-1"
                      >
                        WhatsApp
                      </a>
                      <a
                        href={disp.sms_url}
                        className="px-3 py-1 bg-slate-700 hover:bg-slate-600 font-bold text-white rounded-lg"
                      >
                        SMS
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="text-center text-xs text-slate-500 space-y-2 pt-4">
          <p>{t.disclaimer}</p>
          {onBack && (
            <button onClick={onBack} className="text-slate-400 hover:text-white underline font-semibold">
              Exit to Lifetag Home
            </button>
          )}
        </div>

      </main>
    </div>
  );
}
