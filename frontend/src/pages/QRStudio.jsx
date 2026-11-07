import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, Download, Printer, RefreshCw, AlertTriangle, 
  ShieldAlert, CheckCircle2, Copy, ExternalLink, Sparkles
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { api } from '../services/api';

export default function QRStudio({ user }) {
  const [activeTag, setActiveTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState('helmet'); // helmet | scooter | wallet | idcard | wristband
  const [regenerating, setRegenerating] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const previewCardRef = useRef(null);

  useEffect(() => {
    loadActiveTag();
  }, []);

  const loadActiveTag = async () => {
    setLoading(true);
    try {
      const res = await api.getActiveTag();
      setActiveTag(res.tag);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!window.confirm('Regenerating will REVOKE your existing QR stickers immediately. Previously printed stickers will be blocked. Continue?')) {
      return;
    }
    setRegenerating(true);
    try {
      const res = await api.regenerateQR('Regenerated Decal');
      setActiveTag({
        qr_id: res.qr_id,
        qr_token: res.qr_token,
        qr_url: res.qr_url,
        qr_image: res.qr_image,
        status: 'Active',
        label: 'Regenerated Decal'
      });
      alert('New secure Lifetag token generated! Please download and print your new stickers.');
      setModalOpen(false);
    } catch (err) {
      alert(err.message || 'Regeneration failed');
    } finally {
      setRegenerating(false);
    }
  };

  const handleRevoke = async () => {
    if (!activeTag) return;
    if (!window.confirm('WARNING: Revoking your Lifetag will permanently block scans on this tag. First responders will not be able to view your profile. Proceed?')) {
      return;
    }
    setRevoking(true);
    try {
      await api.revokeQR(activeTag.qr_id);
      setActiveTag(prev => ({ ...prev, status: 'Revoked' }));
      alert('Lifetag successfully revoked. All scans are now blocked.');
    } catch (err) {
      alert(err.message || 'Revocation failed');
    } finally {
      setRevoking(false);
    }
  };

  const handleCopyUrl = () => {
    if (activeTag?.qr_url) {
      navigator.clipboard.writeText(activeTag.qr_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Download high-resolution PNG using HTML5 canvas
  const handleDownloadPNG = () => {
    if (!activeTag?.qr_image) return;

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');

    // Draw background
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, 1200, 1200);

    // Header border
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(0, 0, 1200, 160);

    // Header Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 54px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EMERGENCY IDENTIFICATION', 600, 105);

    // Instruction Banner
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(80, 200, 1040, 90);
    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.fillText('SCAN IN CASE OF ROAD ACCIDENT / MEDICAL EMERGENCY', 600, 258);

    // Draw QR Code
    const qrImg = new Image();
    qrImg.onload = () => {
      // White container for QR
      ctx.fillStyle = '#FFFFFF';
      ctx.roundRect(300, 320, 600, 600, 40);
      ctx.fill();
      ctx.drawImage(qrImg, 340, 360, 520, 520);

      // Victim Meta details at bottom
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 44px Inter, sans-serif';
      ctx.fillText(user?.full_name || 'Sudarsan V', 600, 990);

      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 42px Inter, sans-serif';
      ctx.fillText(`BLOOD GROUP: ${user?.blood_group || 'A+'}  •  ID: ${activeTag?.qr_token || ''}`, 600, 1050);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '30px Inter, sans-serif';
      ctx.fillText('Powered by LIFETAG Emergency Platform', 600, 1120);

      // Trigger download
      const link = document.createElement('a');
      link.download = `LIFETAG-${selectedTemplate.toUpperCase()}-${activeTag.qr_token}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    qrImg.src = activeTag.qr_image;
  };

  // Export high-resolution Printable PDF using jsPDF
  const handlePrintPDF = () => {
    if (!activeTag?.qr_image) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Page title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    doc.text('LIFETAG — Official Printable Emergency Decals', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Cut along the dotted guidelines and affix to your motorcycle helmet, bike visor, wallet, or ID lanyard.', 105, 27, { align: 'center' });

    // Sticker 1: Helmet Sticker
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(1);
    doc.roundedRect(20, 35, 80, 80, 4, 4, 'S');
    doc.setFillColor(220, 38, 38);
    doc.rect(20, 35, 80, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('SCAN IN CASE OF EMERGENCY', 60, 44, { align: 'center' });

    doc.addImage(activeTag.qr_image, 'PNG', 35, 52, 50, 50);
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`Blood: ${user?.blood_group || 'A+'}  |  ${user?.full_name || ''}`, 60, 108, { align: 'center' });
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text('Motorcycle Helmet Sticker', 60, 112, { align: 'center' });

    // Sticker 2: Bike / Scooter Frame Sticker
    doc.setDrawColor(15, 23, 42);
    doc.roundedRect(110, 35, 80, 80, 4, 4, 'S');
    doc.setFillColor(15, 23, 42);
    doc.rect(110, 35, 80, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('LIFETAG EMERGENCY ID', 150, 44, { align: 'center' });

    doc.addImage(activeTag.qr_image, 'PNG', 125, 52, 50, 50);
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`Blood: ${user?.blood_group || 'A+'}  |  ${activeTag.qr_token}`, 150, 108, { align: 'center' });
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text('Bicycle / Scooter Visor Decal', 150, 112, { align: 'center' });

    // Sticker 3: Wallet Emergency Card (Credit Card Size ~85.6mm x 53.98mm)
    doc.setDrawColor(14, 165, 233);
    doc.roundedRect(20, 125, 85, 54, 3, 3, 'S');
    doc.setFillColor(15, 23, 42);
    doc.rect(20, 125, 85, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('EMERGENCY MEDICAL IDENTIFICATION CARD', 62.5, 133, { align: 'center' });

    doc.addImage(activeTag.qr_image, 'PNG', 24, 140, 34, 34);
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(user?.full_name || 'Patient Name', 62, 145);
    doc.setFontSize(8);
    doc.setTextColor(220, 38, 38);
    doc.text(`Blood: ${user?.blood_group || 'A+'}`, 62, 151);
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Tel: ${user?.phone || ''}`, 62, 157);
    doc.text('Scan for Family Contacts & Meds', 62, 163);

    // Sticker 4: Personal ID Card Lanyard Attachment
    doc.setDrawColor(220, 38, 38);
    doc.roundedRect(110, 125, 80, 54, 3, 3, 'S');
    doc.setFillColor(220, 38, 38);
    doc.rect(110, 125, 80, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('EMERGENCY CONTACT & ALLERGY ID', 150, 133, { align: 'center' });
    doc.addImage(activeTag.qr_image, 'PNG', 113, 140, 34, 34);
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(user?.full_name || '', 150, 146);
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Code: ${activeTag.qr_token}`, 150, 153);
    doc.text('Valid for Instant Emergency Scan', 150, 160);

    // Footer instruction
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Generated dynamically from Lifetag Database. For updates, visit https://lifetag.in', 105, 280, { align: 'center' });

    doc.save(`LIFETAG-PRINTABLE-SHEET-${activeTag.qr_token}.pdf`);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-600 mb-3" />
        <p className="font-semibold text-sm">Loading QR Code Studio...</p>
      </div>
    );
  }

  const templates = [
    { id: 'helmet', name: 'Motorcycle Helmet Decal', desc: 'Curved badge for helmet chinbar & shell', tag: 'High Contrast' },
    { id: 'scooter', name: 'Bike / Scooter Decal', desc: 'Weatherproof sticker for visor or stem', tag: 'Durable' },
    { id: 'wallet', name: 'Wallet Emergency Card', desc: 'Standard credit-card form factor', tag: 'Pocket Size' },
    { id: 'idcard', name: 'Student / Corporate ID', desc: 'Badge attachment for lanyards', tag: 'Official' },
    { id: 'wristband', name: 'Medical Wristband Decal', desc: 'Compact strip for silicone bands', tag: 'Wearable' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">QR Code Generation & Print Studio</h1>
          <p className="text-sm text-slate-500">Generate high-resolution printable stickers and emergency identity cards.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPNG}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" /> Download PNG
          </button>
          <button
            onClick={handlePrintPDF}
            className="px-4 py-2.5 bg-emergency-600 hover:bg-emergency-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" /> Print PDF Sheet
          </button>
        </div>
      </div>

      {/* Grid: 5 Templates Selection on Left, Live Render Canvas on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Template Selector (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-extrabold text-sm uppercase tracking-wide text-slate-900">1. Select Sticker Template</h3>
          
          <div className="space-y-3">
            {templates.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedTemplate === t.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm">{t.name}</h4>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    selectedTemplate === t.id ? 'bg-emergency-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {t.tag}
                  </span>
                </div>
                <p className={`text-xs mt-1 ${selectedTemplate === t.id ? 'text-slate-300' : 'text-slate-500'}`}>
                  {t.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Security & Token Management Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 mt-6">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" /> Token Management
            </h4>
            <div className="text-xs text-slate-600 space-y-1">
              <p>Active Token: <strong className="text-slate-900 font-mono">{activeTag?.qr_token || 'N/A'}</strong></p>
              <p>Status: <span className="font-bold text-emerald-600">{activeTag?.status || 'Active'}</span></p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleCopyUrl}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
              >
                <Copy className="w-3.5 h-3.5" /> {copied ? 'Copied URL!' : 'Copy URL'}
              </button>
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Regenerate
              </button>
              <button
                onClick={handleRevoke}
                disabled={revoking}
                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition-colors"
              >
                Revoke
              </button>
            </div>
          </div>
        </div>

        {/* Live Template Design Canvas Preview (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-100 border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center space-y-6">
          <div className="w-full flex items-center justify-between text-xs font-bold text-slate-500 pb-2 border-b border-slate-200">
            <span>Template Preview: {selectedTemplate.toUpperCase()}</span>
            <span className="text-emerald-700">300 DPI High-Resolution Ready</span>
          </div>

          {/* Render Selected Sticker Card */}
          <div ref={previewCardRef} className="w-full max-w-md transform hover:scale-[1.01] transition-transform duration-200">
            
            {/* Template 1: Motorcycle Helmet Decal */}
            {selectedTemplate === 'helmet' && (
              <div className="bg-slate-950 border-4 border-emergency-600 rounded-[28px] p-6 text-white text-center shadow-2xl space-y-4">
                <div className="bg-emergency-600 text-white font-black text-xs sm:text-sm py-2 px-4 rounded-xl tracking-wider uppercase shadow-md flex items-center justify-center gap-1.5">
                  <Shield className="w-4 h-4 fill-white" /> SCAN IN CASE OF EMERGENCY
                </div>

                <div className="p-3 bg-white rounded-2xl mx-auto inline-block shadow-inner">
                  <img src={activeTag?.qr_image} alt="QR Code" className="w-44 h-44 rounded-lg" />
                </div>

                <div className="space-y-1">
                  <p className="font-black text-base text-white">{user?.full_name || 'Sudarsan V'}</p>
                  <p className="text-xs font-bold text-emergency-500 tracking-wider">
                    BLOOD GROUP: {user?.blood_group || 'A+'}  •  ID: {activeTag?.qr_token}
                  </p>
                  <p className="text-[10px] text-slate-400">Scan with any smartphone camera for emergency contacts & medical precautions</p>
                </div>
              </div>
            )}

            {/* Template 2: Scooter & Bicycle Visor Decal */}
            {selectedTemplate === 'scooter' && (
              <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 border-2 border-cyan-500/80 rounded-2xl p-5 text-white shadow-xl flex items-center gap-5">
                <div className="p-2 bg-white rounded-xl shrink-0">
                  <img src={activeTag?.qr_image} alt="QR Code" className="w-28 h-28 rounded" />
                </div>
                <div className="space-y-1.5 leading-tight">
                  <div className="inline-block bg-cyan-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded tracking-wide uppercase">
                    RIDER EMERGENCY ID
                  </div>
                  <h4 className="font-black text-base text-white">{user?.full_name || 'Sudarsan V'}</h4>
                  <p className="text-xs font-extrabold text-emergency-400">Blood: {user?.blood_group || 'A+'}</p>
                  <p className="text-[10px] text-slate-300">Scan QR for instant family contacts</p>
                  <p className="text-[9px] text-slate-500 font-mono">{activeTag?.qr_token}</p>
                </div>
              </div>
            )}

            {/* Template 3: Wallet Emergency Card */}
            {selectedTemplate === 'wallet' && (
              <div className="bg-white border-2 border-slate-300 rounded-2xl p-5 shadow-xl text-slate-900 space-y-3 relative overflow-hidden">
                <div className="bg-slate-900 text-white -m-5 mb-3 p-3 flex items-center justify-between">
                  <span className="font-black text-xs tracking-wider">LIFETAG EMERGENCY MEDICAL CARD</span>
                  <span className="text-[10px] font-bold bg-emergency-600 px-1.5 py-0.5 rounded">VITAL ID</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-1.5 bg-slate-100 border border-slate-300 rounded-xl shrink-0">
                    <img src={activeTag?.qr_image} alt="QR Code" className="w-28 h-28 rounded" />
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-extrabold text-sm text-slate-900">{user?.full_name || 'Sudarsan V'}</p>
                    <p className="text-emergency-600 font-black">BLOOD GROUP: {user?.blood_group || 'A+'}</p>
                    <p className="text-slate-600">Tel: {user?.phone || '+91 6302620295'}</p>
                    <p className="text-[10px] text-slate-500">Scan QR to reveal pre-authorized allergies, conditions & family contacts.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Template 4: Personal / Student ID Card Attachment */}
            {selectedTemplate === 'idcard' && (
              <div className="bg-gradient-to-b from-white to-slate-50 border-2 border-emergency-600 rounded-2xl p-5 shadow-xl text-center space-y-3">
                <div className="inline-block bg-emergency-600 text-white font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                  Emergency Medical Tag
                </div>
                <div className="p-2 bg-white border border-slate-200 rounded-xl inline-block shadow-sm">
                  <img src={activeTag?.qr_image} alt="QR Code" className="w-32 h-32 rounded" />
                </div>
                <div>
                  <p className="font-black text-sm text-slate-900">{user?.full_name || 'Sudarsan V'}</p>
                  <p className="text-xs font-bold text-emergency-600">Blood: {user?.blood_group || 'A+'}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">{activeTag?.qr_token}</p>
                </div>
              </div>
            )}

            {/* Template 5: Emergency Wristband Decal */}
            {selectedTemplate === 'wristband' && (
              <div className="bg-slate-900 border-2 border-emerald-500 rounded-full px-6 py-3.5 text-white shadow-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-1 bg-white rounded-lg shrink-0">
                    <img src={activeTag?.qr_image} alt="QR Code" className="w-14 h-14 rounded" />
                  </div>
                  <div className="leading-tight">
                    <p className="font-black text-xs text-white">{user?.full_name || 'Sudarsan V'}</p>
                    <p className="text-[11px] font-extrabold text-emergency-400">BLOOD: {user?.blood_group || 'A+'}</p>
                    <p className="text-[9px] text-slate-400">Emergency Medical Alert</p>
                  </div>
                </div>
                <div className="text-right text-[10px] font-bold text-emerald-400 shrink-0">
                  SCAN FOR<br />CONTACTS
                </div>
              </div>
            )}

          </div>

          <p className="text-center text-xs text-slate-500 max-w-sm">
            All stickers feature error correction Level H (30% damaged QR codes still scan reliably on rain-spattered helmets).
          </p>
        </div>

      </div>

    </div>
  );
}
