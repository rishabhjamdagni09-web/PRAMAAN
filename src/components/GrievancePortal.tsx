/**
 * Pramaan - Public Grievance Redressal Portal
 * CPGRAMS & Citizen Charter Compliant Support & Dispute Tracking
 */

import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Send,
  Search,
  CheckCircle2,
  Clock,
  ShieldAlert,
  FileCheck,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { Language, translations } from '../lib/i18n';
import { GrievanceTicket, User } from '../types';

interface GrievancePortalProps {
  lang: Language;
  currentUser: User;
}

export const GrievancePortal: React.FC<GrievancePortalProps> = ({ lang, currentUser }) => {
  const t = translations[lang];

  const [grievances, setGrievances] = useState<GrievanceTicket[]>([]);
  const [activeTab, setActiveTab] = useState<'lodge' | 'track'>('lodge');
  const [submittedTicket, setSubmittedTicket] = useState<GrievanceTicket | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Search/Track state
  const [trackQuery, setTrackQuery] = useState('');
  const [trackedResult, setTrackedResult] = useState<GrievanceTicket | null>(null);
  const [searchError, setSearchError] = useState('');

  // Form state
  const [form, setForm] = useState({
    citizenName: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone,
    departmentCode: 'AGRI',
    category: 'Verification Delay',
    subject: '',
    description: '',
  });

  useEffect(() => {
    fetch('/api/grievances')
      .then((res) => res.json())
      .then((data) => {
        if (data.grievances) setGrievances(data.grievances);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/grievances/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setSubmittedTicket(data.ticket);
        setGrievances((prev) => [data.ticket, ...prev]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setTrackedResult(null);

    const found = grievances.find(
      (g) => g.trackingNumber.toUpperCase() === trackQuery.trim().toUpperCase()
    );

    if (found) {
      setTrackedResult(found);
    } else {
      setSearchError('No grievance found with this tracking number. Please verify the ID format (e.g. GRV-2026-8812).');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-2">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Public Grievance Redressal & Citizen Charter</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Citizen Grievance Redressal Portal
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl">
          Lodge complaints regarding zero-knowledge proof verification delays, cadastral record mismatches, or DPDP consent withdrawal disputes. Guaranteed 48-hour response charter.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold space-x-6">
        <button
          onClick={() => {
            setActiveTab('lodge');
            setSubmittedTicket(null);
          }}
          className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${activeTab === 'lodge' ? 'border-indigo-600 text-indigo-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Lodge New Grievance</span>
        </button>
        <button
          onClick={() => setActiveTab('track')}
          className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${activeTab === 'track' ? 'border-indigo-600 text-indigo-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Track Grievance Status</span>
        </button>
      </div>

      {/* Tab 1: Lodge Grievance */}
      {activeTab === 'lodge' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-3xl">
          {submittedTicket ? (
            <div className="text-center py-6 space-y-4 animate-in fade-in duration-150">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h2 className="text-xl font-bold text-slate-900">Grievance Successfully Registered!</h2>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg inline-block text-left text-xs space-y-1">
                <div>
                  <span className="text-slate-500">Tracking Number: </span>
                  <span className="font-mono font-bold text-indigo-900 text-sm">{submittedTicket.trackingNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500">Concerned Department: </span>
                  <span className="font-semibold text-slate-800">{submittedTicket.departmentCode}</span>
                </div>
                <div>
                  <span className="text-slate-500">Subject: </span>
                  <span className="text-slate-800">{submittedTicket.subject}</span>
                </div>
                <div>
                  <span className="text-slate-500">Resolution SLA: </span>
                  <span className="text-emerald-700 font-bold">48 Hours Under Citizen Charter</span>
                </div>
              </div>

              <div>
                <button
                  onClick={() => {
                    setSubmittedTicket(null);
                    setForm({ ...form, subject: '', description: '' });
                  }}
                  className="px-4 py-2 bg-indigo-900 text-white rounded-lg text-xs font-semibold"
                >
                  Lodge Another Grievance
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Citizen Full Name</label>
                  <input
                    type="text"
                    required
                    value={form.citizenName}
                    onChange={(e) => setForm({ ...form, citizenName: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Registered Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Concerned Ministry / Department</label>
                  <select
                    value={form.departmentCode}
                    onChange={(e) => setForm({ ...form, departmentCode: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
                  >
                    <option value="AGRI">Dept of Agriculture & Farmers Welfare (PM-KISAN)</option>
                    <option value="EDU">Dept of Higher Education (Scholarships)</option>
                    <option value="REVENUE">Dept of Land Resources & Revenue (Bhulekh)</option>
                    <option value="HEALTH">Ministry of Health & Family Welfare (Ayushman)</option>
                    <option value="IT_GOV">Ministry of Electronics & IT (Grid Operations)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Grievance Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
                  >
                    <option value="Verification Delay">Verification Latency &gt; SLA Deadline</option>
                    <option value="Cadastral Discrepancy">Land Record / Khatauni Area Mismatch</option>
                    <option value="Consent Dispute">DPDP Consent Revocation Not Honored</option>
                    <option value="Cryptographic Error">WASM Proof Generation Error on Device</option>
                    <option value="Other">Other Administrative Inquiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject / Summary of Complaint</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Verification pending for SAN-2026-IND-883921 for over 48 hours"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide any relevant application numbers (SAN), dates, or error messages..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-indigo-900 hover:bg-indigo-950 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Registering with Sovereign Grievance Grid...' : 'Register Grievance & Issue Tracking Number'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tab 2: Track Status */}
      {activeTab === 'track' && (
        <div className="space-y-6 max-w-3xl">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <form onSubmit={handleTrackSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Enter Grievance Tracking Number (e.g. GRV-2026-8812)"
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-900 text-white rounded-lg text-xs font-bold hover:bg-indigo-950 transition-colors"
              >
                Track Status
              </button>
            </form>

            {searchError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            {trackedResult && (
              <div className="mt-6 p-5 rounded-lg border border-slate-200 bg-slate-50 space-y-3 text-xs animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-mono font-bold text-sm text-indigo-900">{trackedResult.trackingNumber}</span>
                  <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-amber-100 text-amber-800 border border-amber-200">
                    {trackedResult.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500">Applicant: </span>
                    <span className="font-semibold text-slate-800">{trackedResult.citizenName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Department: </span>
                    <span className="font-semibold text-slate-800">{trackedResult.departmentCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Category: </span>
                    <span className="text-slate-800">{trackedResult.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Submitted: </span>
                    <span className="text-slate-800">{new Date(trackedResult.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 text-[11px] font-semibold">Subject:</div>
                  <div className="font-medium text-slate-900">{trackedResult.subject}</div>
                </div>

                <div className="p-3 bg-white rounded border border-slate-200 text-[11px]">
                  <div className="text-indigo-900 font-bold mb-0.5">Section Officer Resolution Note:</div>
                  <div className="text-slate-600">{trackedResult.resolutionNote}</div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Grievances List */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
              Recently Logged Grievances in Sovereign Grid
            </h3>
            <div className="space-y-2">
              {grievances.slice(0, 5).map((g) => (
                <div
                  key={g.id}
                  onClick={() => {
                    setTrackQuery(g.trackingNumber);
                    setTrackedResult(g);
                  }}
                  className="p-3 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900">{g.trackingNumber}</span>
                      <span className="text-slate-500">• {g.departmentCode}</span>
                      <span className="text-slate-400">({g.category})</span>
                    </div>
                    <div className="text-slate-600 truncate max-w-md mt-0.5">{g.subject}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    {g.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
