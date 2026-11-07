import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Calendar, Camera, CheckCircle2, Save, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function ProfileEditor({ user, onProfileUpdated }) {
  const [profile, setProfile] = useState({
    full_name: '',
    date_of_birth: '',
    gender: 'Prefer not to say',
    blood_group: 'A+',
    phone: '',
    address: '',
    city: '',
    photo_url: '',
    completion_percentage: 50
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await api.getProfile();
      if (res.profile) {
        setProfile({
          ...res.profile,
          date_of_birth: res.profile.date_of_birth ? res.profile.date_of_birth.substring(0, 10) : ''
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.updateProfile(profile);
      setMessage({ type: 'success', text: 'Personal profile updated successfully!' });
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setAvatarUploading(true);
    setMessage(null);
    try {
      const res = await api.uploadAvatar(formData);
      setProfile(prev => ({ ...prev, photo_url: res.photo_url }));
      setMessage({ type: 'success', text: 'Profile photograph uploaded!' });
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Avatar upload failed.' });
    } finally {
      setAvatarUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-600 mb-3" />
        <p className="font-semibold text-sm">Loading Profile Details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Personal Profile Management</h1>
          <p className="text-sm text-slate-500">Keep your identification and emergency details accurate.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Profile Completion:</span>
          <span className="text-xs font-black px-2.5 py-1 rounded-full bg-brand-100 text-brand-800">
            {profile.completion_percentage}%
          </span>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
        
        {/* Photo Upload Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
          <div className="relative group">
            {profile.photo_url ? (
              <img 
                src={profile.photo_url} 
                alt="Profile Avatar" 
                className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 shadow"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                <User className="w-10 h-10" />
              </div>
            )}
            <label className="absolute -bottom-2 -right-2 p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg cursor-pointer transition-colors">
              <Camera className="w-4 h-4" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>
          <div className="text-center sm:text-left space-y-1">
            <h3 className="font-bold text-sm text-slate-900">Profile Photograph</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Helps first responders and police verify your identity at the accident scene immediately. (PNG, JPG, max 5MB)
            </p>
            {avatarUploading && <p className="text-xs font-bold text-brand-600 animate-pulse">Uploading photograph...</p>}
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Full Legal Name *</label>
            <input
              type="text"
              required
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Blood Group */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Blood Group *</label>
            <select
              value={profile.blood_group}
              onChange={(e) => setProfile({ ...profile, blood_group: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-emergency-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          {/* Date of Birth */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Date of Birth *</label>
            <input
              type="date"
              required
              value={profile.date_of_birth}
              onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Gender */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Gender</label>
            <select
              value={profile.gender}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          {/* Primary Phone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Phone Number *</label>
            <input
              type="tel"
              required
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">City / Region *</label>
            <input
              type="text"
              required
              value={profile.city}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Residential Address */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Residential Address (Optional)</label>
            <input
              type="text"
              value={profile.address || ''}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              placeholder="Door No, Street Name, Landmark"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-[11px] text-slate-500">You can hide this address from emergency QR scans in Privacy Settings.</p>
          </div>

        </div>

        {/* Save Button */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Changes...' : 'Save Profile Details'}
          </button>
        </div>

      </form>
    </div>
  );
}
