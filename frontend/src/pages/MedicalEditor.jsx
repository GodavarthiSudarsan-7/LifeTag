import React, { useState, useEffect } from 'react';
import { HeartPulse, AlertTriangle, Pill, AlertCircle, Plus, Trash2, Save, RefreshCw, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export default function MedicalEditor({ user }) {
  const [medical, setMedical] = useState(null);
  const [conditions, setConditions] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [medications, setMedications] = useState([]);
  const [catalogs, setCatalogs] = useState({ conditions: [], allergies: [], medications: [] });
  const [clinicalRisk, setClinicalRisk] = useState('STANDARD');

  // Form selections for new items
  const [selectedCondition, setSelectedCondition] = useState('');
  const [condNotes, setCondNotes] = useState('');
  const [selectedAllergy, setSelectedAllergy] = useState('');
  const [allergyReaction, setAllergyReaction] = useState('');
  const [selectedMedication, setSelectedMedication] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFrequency, setMedFrequency] = useState('');

  const [loading, setLoading] = useState(true);
  const [savingNotes, setSavingNotes] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [medRes, catRes] = await Promise.all([
        api.getMedical(),
        api.getCatalogs()
      ]);
      setMedical(medRes.medical);
      setConditions(medRes.conditions || []);
      setAllergies(medRes.allergies || []);
      setMedications(medRes.medications || []);
      setClinicalRisk(medRes.clinical_risk_tier || 'STANDARD');
      setCatalogs(catRes.catalogs || { conditions: [], allergies: [], medications: [] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async (e) => {
    e.preventDefault();
    setSavingNotes(true);
    setMessage(null);
    try {
      await api.updateMedical({
        precautions: medical.precautions,
        disability_info: medical.disability_info,
        emergency_notes: medical.emergency_notes,
        organ_donor: medical.organ_donor
      });
      setMessage({ type: 'success', text: 'Medical precautions & notes saved successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Save failed.' });
    } finally {
      setSavingNotes(false);
    }
  };

  const handleAddCondition = async () => {
    if (!selectedCondition) return;
    try {
      await api.addCondition({ condition_id: selectedCondition, notes: condNotes });
      setSelectedCondition('');
      setCondNotes('');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveCondition = async (id) => {
    try {
      await api.removeCondition(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddAllergy = async () => {
    if (!selectedAllergy) return;
    try {
      await api.addAllergy({ allergy_id: selectedAllergy, reaction: allergyReaction });
      setSelectedAllergy('');
      setAllergyReaction('');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveAllergy = async (id) => {
    try {
      await api.removeAllergy(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddMedication = async () => {
    if (!selectedMedication) return;
    try {
      await api.addMedication({ medication_id: selectedMedication, dosage: medDosage, frequency: medFrequency });
      setSelectedMedication('');
      setMedDosage('');
      setMedFrequency('');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveMedication = async (id) => {
    try {
      await api.removeMedication(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-600 mb-3" />
        <p className="font-semibold text-sm">Loading Medical Information...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Emergency Medical Information</h1>
          <p className="text-sm text-slate-500">Crucial clinical data displayed to first responders and emergency personnel.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500">Clinical Risk Tier:</span>
          <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
            clinicalRisk === 'CRITICAL_ALERT' ? 'bg-red-100 text-red-800 border border-red-300' :
            clinicalRisk === 'HIGH_ATTENTION' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
            'bg-slate-100 text-slate-700'
          }`}>
            {clinicalRisk}
          </span>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <ShieldCheck className="w-5 h-5 shrink-0" />
          {message.text}
        </div>
      )}

      {/* 1. Blood Group & Organ Donor Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-emergency-600 text-white flex items-center justify-center text-2xl font-black shadow-md shadow-emergency-600/30">
            {medical?.blood_group || 'A+'}
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Registered Blood Group</h3>
            <p className="text-xs text-slate-500">Prominently visible during emergency scans for immediate blood matching.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl">
          <label className="text-xs font-bold text-slate-700 cursor-pointer">Organ Donor Consent</label>
          <input
            type="checkbox"
            checked={Boolean(medical?.organ_donor)}
            onChange={(e) => setMedical({ ...medical, organ_donor: e.target.checked })}
            className="w-5 h-5 text-emerald-600 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* 2. Critical Allergies (Normalized 1NF, 2NF, 3NF with allergies catalog) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-emergency-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-extrabold text-sm uppercase tracking-wide text-slate-900">Known Allergies ({allergies.length})</h3>
          </div>
          <span className="text-xs font-bold text-emergency-600 bg-emergency-50 px-2 py-0.5 rounded">High Medical Impact</span>
        </div>

        {/* Existing allergies */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allergies.map(a => (
            <div key={a.allergy_id} className="p-3.5 bg-red-50/60 border border-red-200 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-black text-slate-900 text-sm">{a.name}</p>
                <p className="text-red-700 font-bold uppercase text-[10px]">{a.critical_level} • {a.category}</p>
                {a.reaction && <p className="text-slate-600 mt-0.5">Reaction: {a.reaction}</p>}
              </div>
              <button 
                onClick={() => handleRemoveAllergy(a.allergy_id)} 
                className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Allergy Control */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <p className="text-xs font-bold text-slate-700">Add Known Allergen from Clinical Catalog</p>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <select
                value={selectedAllergy}
                onChange={(e) => setSelectedAllergy(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
              >
                <option value="">Select allergen (Drug, Food, Venom)...</option>
                {catalogs.allergies.map(a => (
                  <option key={a.allergy_id} value={a.allergy_id}>
                    {a.name} ({a.category} - {a.critical_level})
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-4">
              <input
                type="text"
                placeholder="Specific reaction (e.g. Swelling, Rash)"
                value={allergyReaction}
                onChange={(e) => setAllergyReaction(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={handleAddAllergy}
                className="w-full py-2 bg-emergency-600 hover:bg-emergency-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Chronic Medical Conditions */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-amber-600">
            <HeartPulse className="w-5 h-5" />
            <h3 className="font-extrabold text-sm uppercase tracking-wide text-slate-900">Chronic Medical Conditions ({conditions.length})</h3>
          </div>
        </div>

        {/* Existing conditions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {conditions.map(c => (
            <div key={c.condition_id} className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-black text-slate-900 text-sm">{c.name}</p>
                <p className="text-amber-800 font-bold uppercase text-[10px]">Severity: {c.severity}</p>
                {c.notes && <p className="text-slate-600 mt-0.5">{c.notes}</p>}
              </div>
              <button onClick={() => handleRemoveCondition(c.condition_id)} className="p-1.5 text-slate-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Condition Control */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <p className="text-xs font-bold text-slate-700">Add Pre-existing Condition</p>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
              >
                <option value="">Select diagnosed condition...</option>
                {catalogs.conditions.map(c => (
                  <option key={c.condition_id} value={c.condition_id}>
                    {c.name} ({c.severity})
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-4">
              <input
                type="text"
                placeholder="Clinical notes (e.g. Diagnosed 2021)"
                value={condNotes}
                onChange={(e) => setCondNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={handleAddCondition}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Current Medications */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-brand-600">
            <Pill className="w-5 h-5" />
            <h3 className="font-extrabold text-sm uppercase tracking-wide text-slate-900">Current Medications ({medications.length})</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {medications.map(m => (
            <div key={m.medication_id} className="p-3.5 bg-sky-50/50 border border-sky-200 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-black text-slate-900 text-sm">{m.name}</p>
                <p className="text-slate-600">{m.dosage || 'Standard Dose'} • {m.frequency || 'Daily'}</p>
              </div>
              <button onClick={() => handleRemoveMedication(m.medication_id)} className="p-1.5 text-slate-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Medication Control */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <p className="text-xs font-bold text-slate-700">Add Active Medication</p>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5">
              <select
                value={selectedMedication}
                onChange={(e) => setSelectedMedication(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
              >
                <option value="">Select medication...</option>
                {catalogs.medications.map(m => (
                  <option key={m.medication_id} value={m.medication_id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-3">
              <input
                type="text"
                placeholder="Dosage (e.g. 5mg)"
                value={medDosage}
                onChange={(e) => setMedDosage(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <input
                type="text"
                placeholder="Frequency (e.g. 1/day)"
                value={medFrequency}
                onChange={(e) => setMedFrequency(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={handleAddMedication}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Precautions & Emergency Notes Form */}
      <form onSubmit={handleSaveNotes} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="font-extrabold text-sm uppercase tracking-wide text-slate-900">Emergency Precautions & First-Aid Notes</h3>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase">Emergency Precautions</label>
            <textarea
              rows={3}
              value={medical?.precautions || ''}
              onChange={(e) => setMedical({ ...medical, precautions: e.target.value })}
              placeholder="e.g. Keep upright during asthma attacks; Inhaler in right pocket; Stent placed in 2023."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-900 leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase">Disability / Mobility Notes (Optional)</label>
            <input
              type="text"
              value={medical?.disability_info || ''}
              onChange={(e) => setMedical({ ...medical, disability_info: e.target.value })}
              placeholder="e.g. Mild hearing impairment, Left knee prosthesis"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase">General Emergency Notes</label>
            <textarea
              rows={2}
              value={medical?.emergency_notes || ''}
              onChange={(e) => setMedical({ ...medical, emergency_notes: e.target.value })}
              placeholder="e.g. Carry insurance card in bike jacket; Call family immediately."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-900 leading-relaxed"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={savingNotes}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {savingNotes ? 'Saving Notes...' : 'Save Precautions & Notes'}
          </button>
        </div>
      </form>

    </div>
  );
}
