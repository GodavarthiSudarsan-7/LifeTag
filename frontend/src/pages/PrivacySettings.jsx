import React, { useState, useEffect } from 'react';
import { Shield, Eye, Lock, CheckCircle2, RefreshCw, Smartphone, MapPin, AlertTriangle, PhoneCall } from 'lucide-react';
import { api } from '../services/api';

export default function PrivacySettings({ user }) {
  const [settings, setSettings] = useState({
    show_photo: true,
    show_blood_group: true,
    show_allergies: true,
    show_conditions: true,
    show_medications: true,
    show_precautions: true,
    show_disability: true,
    show_address: false,
    show_secondary_contacts: true,
    allow_location_prompt: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadPrivacy();
  }, []);

  const loadPrivacy = async () => {
    setLoading(true);
    try {
      const res = await api.getPrivacy();
      if (res.settings) {
        setSettings({
          show_photo: Boolean(res.settings.show_photo),
          show_blood_group: Boolean(res.settings.show_blood_group),
          show_allergies: Boolean(res.settings.show_allergies),
          show_conditions: Boolean(res.settings.show_conditions),
          show_medications: Boolean(res.settings.show_medications),
          show_precautions: Boolean(res.settings.show_precautions),
          show_disability: Boolean(res.settings.show_disability),
          show_address: Boolean(res.settings.show_address),
          show_secondary_contacts: Boolean(res.settings.show_secondary_contacts),
          allow_location_prompt: Boolean(res.settings.allow_location_prompt)
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      await api.updatePrivacy(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-600 mb-3" />
        <p className="font-semibold text-sm">Loading Privacy Configuration...</p>
      </div>
    );
  }

  const toggleItems = [
    { key: 'show_photo', label: 'Display Profile Photograph', desc: 'Allows first responders to confirm patient identity at the scene.' },
    { key: 'show_blood_group', label: 'Display Blood Group', desc: 'Vital for immediate emergency blood transfusion clearance.' },
    { key: 'show_allergies', label: 'Display Life-Threatening Allergies', desc: 'Prevents administration of contra-indicated drugs (e.g. Penicillin).' },
    { key: 'show_conditions', label: 'Display Chronic Medical Conditions', desc: 'Alerts paramedics to Diabetes, Asthma, Epilepsy, or Heart Stents.' },
    { key: 'show_medications', label: 'Display Active Medications', desc: 'Prevents dangerous emergency drug interactions.' },
    { key: 'show_precautions', label: 'Display Emergency Precautions', desc: 'Specialized instructions like where an inhaler or EpiPen is carried.' },
    { key: 'show_disability', label: 'Display Disability & Mobility Notes', desc: 'Special handling instructions for emergency extraction.' },
    { key: 'show_address', label: 'Display Full Residential Address', desc: 'Recommended OFF for privacy unless you require home transport.' },
    { key: 'show_secondary_contacts', label: 'Display Secondary Contacts', desc: 'Shows alternative relatives if primary family member cannot be reached.' },
    { key: 'allow_location_prompt', label: 'Enable Scanner GPS Location Sharing', desc: 'Allows scanner to share exact accident coordinates with family.' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Privacy & Emergency Consent Controls</h1>
          <p className="text-sm text-slate-500">You have complete autonomy over what information is revealed during an emergency scan.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition-all flex items-center justify-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? 'Saving Preferences...' : 'Save Privacy Settings'}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          Privacy preferences saved. Emergency scans will immediately honor your visibility rules.
        </div>
      )}

      {/* Grid: Controls on Left, Live Simulation on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Toggle Switches (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900">
            <Lock className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-sm uppercase tracking-wide">Emergency Scan Field Visibility</h3>
          </div>

          <div className="space-y-4">
            {toggleItems.map(item => (
              <div 
                key={item.key} 
                onClick={() => handleToggle(item.key)}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-4 transition-colors"
              >
                <div className="space-y-0.5">
                  <p className="font-bold text-sm text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>

                {/* Switch indicator */}
                <div className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 cursor-pointer shrink-0 ${
                  settings[item.key] ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                }`}>
                  <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Emergency Scan Simulator Preview (5 Cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5 text-slate-900">
              <Smartphone className="w-4 h-4 text-brand-600" /> Live Scanner Preview
            </span>
            <span className="text-emerald-600">Simulating Scanner View</span>
          </div>

          {/* Miniature Emergency Screen */}
          <div className="bg-slate-950 border-4 border-slate-800 rounded-[32px] p-5 text-white shadow-2xl space-y-4 text-xs">
            {/* Top Bar */}
            <div className="p-2 bg-emergency-600 rounded-xl text-center font-black tracking-wider text-[10px] uppercase shadow">
              EMERGENCY MEDICAL IDENTIFICATION
            </div>

            {/* Profile Bar */}
            <div className="flex items-center gap-3">
              {settings.show_photo ? (
                <div className="w-12 h-12 rounded-xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-bold text-lg text-slate-300 shrink-0">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[9px] text-slate-500 shrink-0">
                  Hidden
                </div>
              )}
              <div className="leading-tight">
                <p className="font-black text-sm text-white">{user?.full_name || 'Sudarsan V'}</p>
                <p className="text-[10px] text-slate-400">Code: {user?.profile_code || 'LT-00001'}</p>
                {settings.show_address && <p className="text-[10px] text-slate-500 mt-0.5">Address: {user?.address || 'Beach Road, Vizag'}</p>}
              </div>
            </div>

            {/* Blood Group */}
            {settings.show_blood_group && (
              <div className="p-2.5 bg-emergency-950/80 border border-emergency-800 rounded-xl flex items-center justify-between">
                <span className="font-bold text-[10px] text-emergency-300">BLOOD GROUP</span>
                <span className="font-black text-base text-white">{user?.blood_group || 'A+'}</span>
              </div>
            )}

            {/* Allergies Alert */}
            {settings.show_allergies && (
              <div className="p-2.5 bg-red-950/50 border border-red-800 rounded-xl space-y-1">
                <p className="font-bold text-[10px] text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> ALLERGIES
                </p>
                <p className="text-white text-[10px]">Penicillin & Beta-lactams [Severe]</p>
              </div>
            )}

            {/* Conditions Alert */}
            {settings.show_conditions && (
              <div className="p-2.5 bg-amber-950/40 border border-amber-800 rounded-xl space-y-1">
                <p className="font-bold text-[10px] text-amber-400">CONDITIONS</p>
                <p className="text-white text-[10px]">Mild Persistent Asthma</p>
              </div>
            )}

            {/* Calling Target */}
            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-[10px]">Primary Contact</p>
                <p className="text-slate-400 text-[9px]">Srinivas (Father)</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-600 text-white font-bold text-[9px] rounded-lg flex items-center gap-1">
                <PhoneCall className="w-2.5 h-2.5" /> Call Now
              </span>
            </div>

            <p className="text-[9px] text-slate-500 text-center italic">
              Live preview dynamically updates as you toggle options on the left.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
