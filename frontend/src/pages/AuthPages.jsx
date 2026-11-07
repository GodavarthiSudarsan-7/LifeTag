import React, { useState } from 'react';
import { Shield, Lock, Mail, User, Phone, Calendar, MapPin, ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { api, setAuthToken } from '../services/api';

export function LoginPage({ onLoginSuccess, onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ email, password });
      setAuthToken(res.token);
      onLoginSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill demo user for evaluators
  const handleQuickFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password@123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 mx-auto flex items-center justify-center text-emergency-500 shadow-md">
            <Shield className="w-7 h-7 fill-emergency-500/20" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to Lifetag</h2>
          <p className="text-xs text-slate-500">Access your emergency profile, QR decals & scan analytics.</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Password</label>
              <button 
                type="button" 
                onClick={() => onNavigate('forgot')}
                className="text-xs text-brand-600 font-bold hover:underline"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Logins for Professor / Reviewers */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide text-center">
            Demo Accounts for Academic Evaluation:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickFill('sudarsan@lifetag.in')}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold text-slate-800 text-left"
            >
              Sudarsan V (A+)
            </button>
            <button
              onClick={() => handleQuickFill('priya.sharma@lifetag.in')}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold text-slate-800 text-left"
            >
              Priya Sharma (O+)
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center italic">Default password: Password@123</p>
        </div>

        {/* Register Link */}
        <div className="text-center text-xs text-slate-500">
          Don't have a Lifetag account yet?{' '}
          <button onClick={() => onNavigate('register')} className="text-brand-600 font-bold hover:underline">
            Register in 2 minutes
          </button>
        </div>

      </div>
    </div>
  );
}

export function RegisterPage({ onRegisterSuccess, onNavigate }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    dateOfBirth: '2000-01-01',
    gender: 'Prefer not to say',
    bloodGroup: 'A+',
    phone: '',
    city: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.register(formData);
      setAuthToken(res.token);
      onRegisterSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emergency-600 mx-auto flex items-center justify-center text-white shadow-md">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Your Lifetag</h2>
          <p className="text-xs text-slate-500">Generate your unique emergency QR code connected to MySQL 8.0.</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Sudarsan V"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Email Address *</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Blood Group *</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-emergency-600 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Date of Birth *</label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 9840011122"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">City / Region *</label>
              <input
                type="text"
                required
                placeholder="e.g. Visakhapatnam, Chennai"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emergency-600 hover:bg-emergency-500 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating Lifetag...' : 'Generate My Lifetag QR'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <button onClick={() => onNavigate('login')} className="text-brand-600 font-bold hover:underline">
            Sign In here
          </button>
        </div>

      </div>
    </div>
  );
}

export function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-5 text-center">
        <h2 className="text-2xl font-black text-slate-900">Reset Password</h2>
        <p className="text-xs text-slate-500">Enter your registered email to receive recovery instructions.</p>

        {submitted ? (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-medium space-y-2">
            <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600" />
            <p>Password reset instructions simulated for {email}.</p>
            <p className="text-slate-600">For academic demonstration, you can log in with password: <strong>Password@123</strong></p>
            <button onClick={() => onNavigate('login')} className="text-brand-600 font-bold block mx-auto underline pt-2">
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase text-slate-700">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <button type="submit" className="w-full py-3 bg-slate-900 text-white font-bold text-sm rounded-xl">
              Send Reset Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
