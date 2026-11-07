import React, { useState, useEffect } from 'react';
import { PhoneCall, Plus, Trash2, Edit3, Star, CheckCircle2, RefreshCw, X, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

export default function ContactsManager() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  const [formData, setFormData] = useState({
    contact_name: '',
    relationship: 'Parent',
    primary_phone: '',
    alt_phone: '',
    is_primary: false
  });

  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const res = await api.getContacts();
      setContacts(res.contacts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingContact(null);
    setFormData({
      contact_name: '',
      relationship: 'Parent',
      primary_phone: '',
      alt_phone: '',
      is_primary: contacts.length === 0
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingContact(c);
    setFormData({
      contact_name: c.contact_name,
      relationship: c.relationship,
      primary_phone: c.primary_phone,
      alt_phone: c.alt_phone || '',
      is_primary: c.is_primary
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      if (editingContact) {
        await api.updateContact(editingContact.contact_id, formData);
        setMessage({ type: 'success', text: 'Contact updated successfully.' });
      } else {
        await api.addContact(formData);
        setMessage({ type: 'success', text: 'New emergency contact registered.' });
      }
      setModalOpen(false);
      loadContacts();
    } catch (err) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this emergency contact?')) return;
    try {
      await api.deleteContact(id);
      loadContacts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSetPrimary = async (id) => {
    try {
      await api.setPrimaryContact(id);
      loadContacts();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-600 mb-3" />
        <p className="font-semibold text-sm">Loading Emergency Contacts...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Emergency Contacts Management</h1>
          <p className="text-sm text-slate-500">Family & first responders who can be dialed with one tap during an emergency.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow flex items-center justify-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Emergency Contact
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          {message.text}
        </div>
      )}

      {/* Contacts List */}
      <div className="space-y-4">
        {contacts.map((c, idx) => (
          <div
            key={c.contact_id}
            className={`p-5 rounded-3xl border transition-all ${
              c.is_primary 
                ? 'bg-gradient-to-r from-emerald-50/70 via-white to-white border-emerald-300 shadow-sm' 
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-slate-900 text-base">{c.contact_name}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                    {c.relationship}
                  </span>
                  {c.is_primary ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 fill-white" /> PRIMARY CALL TARGET
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetPrimary(c.contact_id)}
                      className="text-[11px] font-bold text-slate-500 hover:text-emerald-700 hover:underline"
                    >
                      Set as Primary
                    </button>
                  )}
                </div>

                <p className="text-sm font-semibold text-slate-800 flex items-center gap-2 pt-1">
                  <PhoneCall className="w-4 h-4 text-emerald-600" />
                  Primary Tel: {c.primary_phone}
                </p>
                {c.alt_phone && (
                  <p className="text-xs text-slate-500 ml-6">
                    Alternative: {c.alt_phone}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <a
                  href={`tel:${c.primary_phone}`}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all"
                  title="Test One-Tap Call"
                >
                  <PhoneCall className="w-3.5 h-3.5 fill-white" /> Call Now
                </a>
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(c.contact_id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {contacts.length === 0 && (
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-12 text-center text-slate-500 space-y-3">
            <ShieldAlert className="w-12 h-12 mx-auto text-amber-500" />
            <h3 className="font-bold text-slate-800">No Emergency Contacts Registered</h3>
            <p className="text-xs max-w-sm mx-auto">
              During an accident, first responders need immediate numbers to call. Please add at least 1 primary family contact.
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow mt-2"
            >
              Add First Contact
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingContact ? 'Edit Emergency Contact' : 'Register Emergency Contact'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Contact Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Srinivas V, Priya Sharma"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Relationship *</label>
                <select
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="Parent">Parent (Father / Mother)</option>
                  <option value="Spouse">Spouse (Husband / Wife)</option>
                  <option value="Sibling">Sibling (Brother / Sister)</option>
                  <option value="Child">Child (Son / Daughter)</option>
                  <option value="Friend">Friend / Colleague</option>
                  <option value="Doctor">Family Doctor / Physician</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Primary Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 9840011122"
                  value={formData.primary_phone}
                  onChange={(e) => setFormData({ ...formData, primary_phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Alternative Phone (Optional)</label>
                <input
                  type="tel"
                  placeholder="e.g. Landline or Secondary mobile"
                  value={formData.alt_phone}
                  onChange={(e) => setFormData({ ...formData, alt_phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow"
                >
                  {editingContact ? 'Update Contact' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
