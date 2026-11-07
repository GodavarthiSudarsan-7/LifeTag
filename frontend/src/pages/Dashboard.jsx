import React, { useState, useEffect } from 'react';
import { 
  Shield, QrCode, PhoneCall, AlertTriangle, HeartPulse, 
  Download, Printer, ArrowRight, Activity, MapPin, 
  CheckCircle2, Clock, Smartphone, User, RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export default function Dashboard({ user, onNavigate }) {
  const [analytics, setAnalytics] = useState(null);
  const [activeTag, setActiveTag] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [anaRes, tagRes] = await Promise.all([
        api.getDashboardAnalytics(),
        api.getActiveTag()
      ]);
      setAnalytics(anaRes.analytics);
      setActiveTag(tagRes.tag);
    } catch (err) {
      console.error('[Dashboard Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-600 mb-3" />
        <p className="font-semibold text-sm">Loading Lifetag Dashboard...</p>
      </div>
    );
  }

  const readinessScore = analytics?.readiness_score || 50;
  const recentScans = analytics?.recent_scans || [];
  const contacts = analytics?.contacts || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. WELCOME BANNER & READINESS HERO */}
      <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Greeting & Status */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">LIFETAG ACTIVE & MONITORING</span>
              <span className="text-xs text-slate-400">• Code: {user?.profile_code || 'LT-00001'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, <span className="text-brand-400">{user?.full_name || 'Rider'}</span>
            </h1>

            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Your emergency QR profile is active. First responders can identify your blood group ({user?.blood_group || 'A+'}) and call your emergency contacts with one scan.
            </p>

            {/* Quick action buttons */}
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('qrstudio')}
                className="px-4 py-2.5 bg-emergency-600 hover:bg-emergency-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emergency-600/30 flex items-center gap-1.5 transition-all"
              >
                <QrCode className="w-4 h-4" /> Download Printable Stickers
              </button>
              <button
                onClick={() => onNavigate('medical')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
              >
                <HeartPulse className="w-4 h-4 text-brand-400" /> Update Medical Details
              </button>
            </div>
          </div>

          {/* Right: Emergency Readiness Gauge */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 text-center w-full max-w-xs shadow-inner">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Emergency Readiness Score</p>
              
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center my-2">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="56" cy="56" r="46"
                    className="text-slate-700 stroke-current"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="56" cy="56" r="46"
                    className={`${readinessScore >= 80 ? 'text-emerald-500' : 'text-amber-500'} stroke-current transition-all duration-1000`}
                    strokeWidth="8"
                    strokeDasharray={289}
                    strokeDashoffset={289 - (289 * readinessScore) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-white">{readinessScore}%</span>
                  <span className="text-[9px] font-bold text-slate-400">READY</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-1">
                {readinessScore >= 80 ? 'Profile fully equipped for emergencies' : 'Add contacts & medical notes to reach 100%'}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. CORE DASHBOARD GRID: QR CODE + STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Active QR Card (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-slate-900" />
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">Active Lifetag QR</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                ACTIVE
              </span>
            </div>

            {/* QR Code Graphic Preview */}
            <div className="bg-slate-50 border-2 border-slate-200/80 rounded-2xl p-5 text-center flex flex-col items-center justify-center space-y-3">
              {activeTag?.qr_image ? (
                <div className="p-2 bg-white rounded-xl shadow-md border border-slate-200">
                  <img src={activeTag.qr_image} alt="Lifetag QR" className="w-48 h-48 rounded" />
                </div>
              ) : (
                <div className="w-48 h-48 bg-slate-200 rounded flex items-center justify-center text-slate-400 text-xs">
                  Generating QR...
                </div>
              )}
              <div>
                <p className="font-black text-xs text-slate-800 tracking-wider">{activeTag?.qr_token || 'LT-TAG-001'}</p>
                <p className="text-[11px] text-slate-500 font-medium">{activeTag?.label || 'Motorcycle Helmet Tag'}</p>
              </div>
            </div>

            {/* Tag Quick Actions */}
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('qrstudio')}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download 5 Sticker Templates
              </button>
              {activeTag?.qr_token && (
                <button
                  onClick={() => window.open(`/emergency/${activeTag.qr_token}`, '_blank')}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Activity className="w-4 h-4 text-emergency-600" /> Preview Emergency Scan Screen
                </button>
              )}
            </div>
          </div>

          {/* Emergency Contacts Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-emerald-600" /> Emergency Contacts ({contacts.length})
              </h3>
              <button onClick={() => onNavigate('contacts')} className="text-xs font-bold text-brand-600 hover:underline">
                Manage
              </button>
            </div>

            {contacts.length > 0 ? (
              <div className="space-y-2.5">
                {contacts.map((c, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{c.contact_name}</span>
                        {c.is_primary && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                            PRIMARY
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500">{c.relationship} • {c.primary_phone}</p>
                    </div>
                    <a
                      href={`tel:${c.primary_phone}`}
                      className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                      title="Test Call"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-400">
                <p>No emergency contacts added yet.</p>
                <button onClick={() => onNavigate('contacts')} className="mt-2 text-brand-600 font-bold">Add Contact Now</button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Scan History & System Stats (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm text-center">
              <p className="text-2xl font-black text-slate-900">{analytics?.total_scans || 0}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Total QR Scans</p>
            </div>
            <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm text-center">
              <p className="text-2xl font-black text-emergency-600">{user?.blood_group || 'A+'}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Blood Group</p>
            </div>
            <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm text-center">
              <p className="text-2xl font-black text-brand-600">{analytics?.medical_counts?.allergies || 0}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Logged Allergies</p>
            </div>
            <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm text-center">
              <p className="text-2xl font-black text-emerald-600">{contacts.length}</p>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Emergency Contacts</p>
            </div>
          </div>

          {/* Recent Scans Activity Log Feed */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-700" />
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">Recent QR Scan Activity Feed</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">Logged in MySQL lifetag_db</span>
            </div>

            {recentScans.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentScans.map((scan, idx) => (
                  <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          scan.scan_status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {scan.scan_status}
                        </span>
                        <span className="font-bold text-slate-900 flex items-center gap-1">
                          <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                          {scan.device_type || 'Mobile Device'}
                        </span>
                      </div>
                      <p className="text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                        {scan.city || 'Location Coordinates Recorded'}
                        {scan.latitude && scan.longitude && (
                          <a
                            href={`https://maps.google.com/?q=${scan.latitude},${scan.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-brand-600 font-bold ml-1 hover:underline"
                          >
                            [View Map Pin]
                          </a>
                        )}
                      </p>
                    </div>

                    <div className="text-right text-slate-400 text-[11px] shrink-0 font-medium">
                      {new Date(scan.scan_time).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                <QrCode className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-slate-600">No scans logged yet</p>
                <p className="mt-1">When someone scans your motorcycle helmet or wallet sticker, the timestamp and device will appear here.</p>
              </div>
            )}
          </div>

          {/* Quick Shortcuts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div 
              onClick={() => onNavigate('profile')}
              className="p-5 bg-white border border-slate-200/80 rounded-2xl hover:border-brand-500 hover:shadow-sm cursor-pointer transition-all space-y-2"
            >
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Personal Details</h4>
              <p className="text-xs text-slate-500">Edit DOB, photo, address and phone</p>
            </div>

            <div 
              onClick={() => onNavigate('medical')}
              className="p-5 bg-white border border-slate-200/80 rounded-2xl hover:border-emergency-500 hover:shadow-sm cursor-pointer transition-all space-y-2"
            >
              <div className="w-9 h-9 rounded-xl bg-emergency-50 text-emergency-600 flex items-center justify-center font-bold">
                <HeartPulse className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Medical Precautions</h4>
              <p className="text-xs text-slate-500">Manage allergies, conditions & meds</p>
            </div>

            <div 
              onClick={() => onNavigate('privacy')}
              className="p-5 bg-white border border-slate-200/80 rounded-2xl hover:border-emerald-500 hover:shadow-sm cursor-pointer transition-all space-y-2"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Privacy Toggles</h4>
              <p className="text-xs text-slate-500">Control what appears on scans</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
