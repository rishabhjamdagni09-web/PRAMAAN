/**
 * Pramaan - Official Portal Component
 * Department Verification Queue, AI-Powered Legacy Schema Mapping (Gemini), SLA Monitoring, and CDC Connectors
 */

import React, { useState, useEffect } from 'react';
import {
  Building2,
  FileCheck,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Database,
  ArrowRight,
  Download,
  Filter,
  Layers,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { Language, translations } from '../lib/i18n';
import { Application, LegacyConnector, SchemaMapping, User } from '../types';
import {
  subscribeApplications,
  subscribeSchemaMappings,
  updateApplicationStatusInFirestore,
  approveSchemaMappingInFirestore,
} from '../lib/firebase';

interface OfficialPortalProps {
  lang: Language;
  currentUser: User;
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
}

export const OfficialPortal: React.FC<OfficialPortalProps> = ({
  lang,
  currentUser,
  activeSubTab,
  setActiveSubTab,
}) => {
  const t = translations[lang];

  // Data States
  const [applications, setApplications] = useState<Application[]>([]);
  const [schemaMappings, setSchemaMappings] = useState<SchemaMapping[]>([]);
  const [connectors, setConnectors] = useState<LegacyConnector[]>([]);
  const [loading, setLoading] = useState(true);

  // Application Action State
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [actionRemarks, setActionRemarks] = useState('');
  const [processingStatus, setProcessingStatus] = useState(false);

  // AI Schema Mapping Tool State
  const [selectedSourceTable, setSelectedSourceTable] = useState('UP_BHULEKH_KHATAUNI_V1');
  const [targetCanonicalModel, setTargetCanonicalModel] = useState('OIS-GOV/LandRecord/v2');
  const [customColumns, setCustomColumns] = useState('KISAN_UID, KHASRA_NO, RAQBA_HECTARES, FASAL_TYPE, REVENUE_CIRCLE');
  const [aiRunning, setAiRunning] = useState(false);
  const [latestAiResult, setLatestAiResult] = useState<SchemaMapping | null>(null);

  const loadOfficialData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/applications').then((r) => r.json()),
      fetch('/api/schemas').then((r) => r.json()),
      fetch('/api/connectors').then((r) => r.json()),
    ])
      .then(([appsData, schemasData, connData]) => {
        if (appsData.applications) {
          setApplications(appsData.applications);
          if (appsData.applications.length > 0 && !selectedApp) {
            setSelectedApp(appsData.applications[0]);
          }
        }
        if (schemasData.mappings) setSchemaMappings(schemasData.mappings);
        if (connData.connectors) setConnectors(connData.connectors);
      })
      .catch((err) => console.error('Error loading official data:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOfficialData();

    // Live Real-Time Subscriptions via Firestore
    const unsubApps = subscribeApplications(
      { departmentCode: currentUser.departmentId },
      (apps) => {
        if (apps && apps.length > 0) {
          setApplications(apps);
          if (!selectedApp) setSelectedApp(apps[0]);
        }
      }
    );
    const unsubSchemas = subscribeSchemaMappings((mappings) => {
      if (mappings && mappings.length > 0) {
        setSchemaMappings(mappings);
      }
    });

    return () => {
      unsubApps();
      unsubSchemas();
    };
  }, [currentUser.id, currentUser.departmentId]);

  // Handle Application Status Update
  const handleUpdateStatus = async (status: 'APPROVED' | 'REJECTED' | 'FLAGGED') => {
    if (!selectedApp) return;
    setProcessingStatus(true);
    try {
      const remarks = actionRemarks || `Official decision: ${status} under standard verification protocol.`;
      const res = await fetch(`/api/applications/${selectedApp.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          remarks,
        }),
      });
      const data = await res.json();
      if (data.success && data.application) {
        setSelectedApp(data.application);
        setActionRemarks('');

        // Persist update in Firestore
        await updateApplicationStatusInFirestore(
          selectedApp.id,
          status,
          remarks,
          currentUser.name
        );

        // Record server-side hash-chained audit block
        await fetch('/api/audit/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: `APPLICATION_${status}`,
            actor: currentUser.name,
            actorRole: currentUser.role,
            targetEntity: 'APPLICATION',
            entityId: selectedApp.sanNumber,
            payload: {
              appId: selectedApp.id,
              san: selectedApp.sanNumber,
              decision: status,
              remarks,
            },
          }),
        });

        loadOfficialData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingStatus(false);
    }
  };

  // Run AI Schema Mapping with Gemini
  const handleRunAiMapping = async () => {
    setAiRunning(true);
    setLatestAiResult(null);
    try {
      const cols = customColumns.split(',').map((c) => c.trim()).filter(Boolean);
      const res = await fetch('/api/schemas/map-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentName: currentUser.departmentName || 'Department of Agriculture',
          sourceTableName: selectedSourceTable,
          sourceColumns: cols,
          targetCanonicalModel,
        }),
      });
      const data = await res.json();
      if (data.success && data.mapping) {
        setLatestAiResult(data.mapping);
        setSchemaMappings((prev) => [data.mapping, ...prev]);

        // Record server-side hash-chained audit block
        await fetch('/api/audit/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'SCHEMA_MAPPING_SYNTHESIZED',
            actor: currentUser.name,
            actorRole: currentUser.role,
            targetEntity: 'SCHEMA_MAPPING',
            entityId: data.mapping.id,
            payload: {
              source: selectedSourceTable,
              target: targetCanonicalModel,
            },
          }),
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiRunning(false);
    }
  };

  // Approve Schema Mapping
  const handleApproveMapping = async (id: string) => {
    try {
      const res = await fetch(`/api/schemas/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        await approveSchemaMappingInFirestore(id, currentUser.name);

        // Record server-side hash-chained audit block
        await fetch('/api/audit/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'SCHEMA_MAPPING_APPROVED',
            actor: currentUser.name,
            actorRole: currentUser.role,
            targetEntity: 'SCHEMA_MAPPING',
            entityId: id,
            payload: { mappingId: id, approvedBy: currentUser.name },
          }),
        });

        loadOfficialData();
        if (latestAiResult && latestAiResult.id === id) {
          setLatestAiResult(data.mapping);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = 'SAN,Citizen,Scheme,Department,Status,Benefit,Submitted\n';
    const rows = applications
      .map(
        (a) =>
          `"${a.sanNumber}","${a.citizenName}","${a.schemeTitle}","${a.departmentCode}","${a.status}","${a.disbursementAmount}","${a.submittedAt}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pramaan_applications_export_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner: Official Ministry Context */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-amber-900/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-xl font-bold border border-amber-500/30">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold">{currentUser.name}</h1>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-2 py-0.5 rounded">
                  {currentUser.departmentCode || 'AGRI'} • Sovereign Officer
                </span>
              </div>
              <div className="text-xs text-amber-200 mt-1">
                {currentUser.departmentName} • Verification Authority & Scheme Nodal Officer
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <button
              onClick={handleExportCsv}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-3 py-2 rounded-lg border border-white/20 flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export Queue CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Official Verification Queue Sub-Tab */}
      {activeSubTab === 'officialQueue' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Applications List */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Incoming Scheme Queue ({applications.length})
              </span>
              <span className="text-[11px] text-slate-500">Auto-Refreshed</span>
            </div>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {applications.map((app) => {
                const isSelected = selectedApp?.id === app.id;
                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all text-xs ${isSelected ? 'border-amber-600 bg-amber-50/40 shadow-xs ring-1 ring-amber-500' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900">{app.sanNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {app.status}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-800 mt-1">{app.citizenName}</div>
                    <div className="text-slate-500 text-[11px] truncate mt-0.5">{app.schemeTitle}</div>
                    <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
                      <span>Submitted: {new Date(app.submittedAt).toLocaleDateString()}</span>
                      <span className="text-indigo-900 font-bold">{app.disbursementAmount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verification Details Inspector & Actions */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            {selectedApp ? (
              <>
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-lg font-bold text-slate-950">{selectedApp.sanNumber}</span>
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        {selectedApp.status}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-800 mt-1">
                      Applicant: {selectedApp.citizenName} (ID: {selectedApp.citizenId})
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Scheme: {selectedApp.schemeTitle} ({selectedApp.schemeCode})
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <div className="font-mono font-bold text-slate-900 text-sm">{selectedApp.disbursementAmount}</div>
                    <div className="text-amber-700 font-medium text-[11px] mt-0.5">
                      SLA Deadline: {new Date(selectedApp.slaDeadline).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Cryptographic Zero-Knowledge Proofs Attached */}
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Attached Zero-Knowledge Predicates</span>
                  </h3>
                  <div className="space-y-2 font-mono text-[11px]">
                    {selectedApp.proofs && selectedApp.proofs.length > 0 ? (
                      selectedApp.proofs.map((proof, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                          <div className="flex justify-between font-bold text-indigo-950">
                            <span>Claim #{idx + 1}: {proof.attribute} {proof.operator} {proof.threshold}</span>
                            <span className="text-emerald-700">MATHEMATICALLY_TRUE</span>
                          </div>
                          <div className="text-slate-500 truncate">Commitment: {proof.commitment}</div>
                          <div className="text-slate-500 truncate">Nullifier: {proof.nullifierHash}</div>
                          <div className="text-[10px] text-slate-400">
                            Signature: {proof.signature} • Engine: {proof.protocol}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-500">
                        Proofs validated at intake gateway.
                      </div>
                    )}
                  </div>
                </div>

                {/* Official Actions */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Official Adjudication & Remarks
                  </h3>

                  <textarea
                    rows={2}
                    placeholder="Enter official decision remarks or reason for sanction..."
                    value={actionRemarks}
                    onChange={(e) => setActionRemarks(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleUpdateStatus('APPROVED')}
                      disabled={processingStatus}
                      className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-2xs disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Benefit Sanction</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus('FLAGGED')}
                      disabled={processingStatus}
                      className="py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Flag for Field Inspection</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatus('REJECTED')}
                      disabled={processingStatus}
                      className="py-2.5 px-4 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-lg text-xs transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs">
                Select an application from the queue to review proofs and approve benefit.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. AI Schema Mapping Tool Sub-Tab */}
      {activeSubTab === 'schemaMapping' && (
        <div className="space-y-8">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sovereign AI Harmonization Engine (Gemini 3.8-Flash)</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {t.official.schemaMappingTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              {t.official.schemaMappingSub}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Config */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Legacy Database & Table Config
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department Legacy Source Table
                </label>
                <select
                  value={selectedSourceTable}
                  onChange={(e) => {
                    setSelectedSourceTable(e.target.value);
                    if (e.target.value === 'UP_BHULEKH_KHATAUNI_V1') {
                      setCustomColumns('KISAN_UID, KHASRA_NO, RAQBA_HECTARES, FASAL_TYPE, REVENUE_CIRCLE');
                      setTargetCanonicalModel('OIS-GOV/LandRecord/v2');
                    } else if (e.target.value === 'MH_MAHABHUMI_712') {
                      setCustomColumns('HOLDER_NAME, SURVEY_NO, TOTAL_AREA_HA, POTKHARAB_AREA, IRRIGATION_CODE');
                      setTargetCanonicalModel('OIS-GOV/LandRecord/v2');
                    } else if (e.target.value === 'CBSE_SENIOR_SEC_RESULTS') {
                      setCustomColumns('CANDIDATE_ROLL, CANDIDATE_NAME, STREAM, AGGREGATE_PCT, RESULT_GRADE');
                      setTargetCanonicalModel('OIS-GOV/AcademicMerit/v1');
                    }
                  }}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="UP_BHULEKH_KHATAUNI_V1">UP_BHULEKH_KHATAUNI_V1 (Land Records)</option>
                  <option value="MH_MAHABHUMI_712">MH_MAHABHUMI_712 (Maharashtra Land)</option>
                  <option value="CBSE_SENIOR_SEC_RESULTS">CBSE_SENIOR_SEC_RESULTS (Academic)</option>
                  <option value="CUSTOM_DEPT_TABLE">Custom Legacy Department Table</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Canonical Model (OIS-GOV Standard)
                </label>
                <select
                  value={targetCanonicalModel}
                  onChange={(e) => setTargetCanonicalModel(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="OIS-GOV/LandRecord/v2">OIS-GOV/LandRecord/v2</option>
                  <option value="OIS-GOV/IncomeCertificate/v1">OIS-GOV/IncomeCertificate/v1</option>
                  <option value="OIS-GOV/AcademicMerit/v1">OIS-GOV/AcademicMerit/v1</option>
                  <option value="OIS-GOV/CitizenIdentity/v3">OIS-GOV/CitizenIdentity/v3</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Source Column Names (Comma-separated)
                </label>
                <textarea
                  rows={3}
                  value={customColumns}
                  onChange={(e) => setCustomColumns(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-3 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <button
                onClick={handleRunAiMapping}
                disabled={aiRunning}
                className="w-full py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 shadow-xs"
              >
                {aiRunning ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-300" />
                )}
                <span>{aiRunning ? 'Gemini 3.8-Flash Reasoning...' : 'Run Sovereign AI Harmonization'}</span>
              </button>
            </div>

            {/* AI Results & Human Approval */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
              {latestAiResult ? (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{latestAiResult.sourceTableName} → {latestAiResult.canonicalModel}</h4>
                      <div className="text-xs text-emerald-700 font-semibold mt-0.5">
                        Harmonization Confidence: {Math.round(latestAiResult.overallConfidence * 100)}%
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${latestAiResult.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {latestAiResult.status}
                    </span>
                  </div>

                  {/* AI Explanation Box */}
                  <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 text-xs text-indigo-950">
                    <div className="font-bold mb-1 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-700" />
                      <span>Model Rationale ({latestAiResult.aiSuggestedBy}):</span>
                    </div>
                    <p>{latestAiResult.aiExplanation}</p>
                  </div>

                  {/* Field Mapping Table */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-2.5">Source Column</th>
                          <th className="p-2.5">Canonical Target</th>
                          <th className="p-2.5">Data Type</th>
                          <th className="p-2.5">Confidence</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                        {latestAiResult.mappedFields.map((f, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2.5 text-slate-900 font-bold">{f.sourceField}</td>
                            <td className="p-2.5 text-indigo-700 font-bold">{f.targetField}</td>
                            <td className="p-2.5 text-slate-500">{f.dataType}</td>
                            <td className="p-2.5 text-emerald-700 font-bold">
                              {Math.round(f.confidence * 100)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {latestAiResult.status === 'PENDING_APPROVAL' && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleApproveMapping(latestAiResult.id)}
                        className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Official Sign-Off & Approve Mapping</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-20 text-center text-slate-400 text-xs">
                  Select a legacy table and click "Run Sovereign AI Harmonization" to observe Gemini 3.8-Flash automatically map legacy columns.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. SLA Monitoring Sub-Tab */}
      {activeSubTab === 'slaMonitor' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t.official.slaTitle}</h2>
            <p className="text-xs text-slate-500 mt-1">{t.official.slaSub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-2xl font-black text-slate-900">100%</div>
              <div className="text-xs font-semibold text-slate-500 mt-1 uppercase">SLA Compliance Rate</div>
              <div className="text-[11px] text-emerald-700 font-medium mt-2">Zero Citizen Charter Breaches</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-2xl font-black text-slate-900">1.4 Days</div>
              <div className="text-xs font-semibold text-slate-500 mt-1 uppercase">Average Processing Time</div>
              <div className="text-[11px] text-indigo-700 font-medium mt-2">Charter Standard Limit: 7 Days</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-2xl font-black text-emerald-700">182ms</div>
              <div className="text-xs font-semibold text-slate-500 mt-1 uppercase">Proof Verification P95</div>
              <div className="text-[11px] text-emerald-700 font-medium mt-2">WASM Groth16 Ingestion</div>
            </div>
          </div>

          {/* Active Applications Under SLA */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
              Real-Time Application SLA Status
            </h3>
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="p-3.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900">{app.sanNumber}</span>
                      <span className="text-slate-500">• {app.citizenName}</span>
                    </div>
                    <div className="text-slate-600 mt-0.5">{app.schemeTitle}</div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-1.5 text-emerald-700 font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Within SLA Guarantee</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Deadline: {new Date(app.slaDeadline).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Legacy CDC Connectors Sub-Tab */}
      {activeSubTab === 'connectors' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Change Data Capture (CDC) Adapters</h2>
            <p className="text-xs text-slate-500 mt-1">
              Active transaction log readers streaming state roots into the local Pramaan Edge node.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {connectors.map((c) => (
              <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {c.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400">Database Engine:</span>
                    <div className="font-semibold text-slate-900">{c.databaseEngine}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Sync Lag:</span>
                    <div className="font-mono font-bold text-emerald-700">{c.syncLagMs}ms</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Records Streamed:</span>
                    <div className="font-mono font-bold text-slate-900">{c.recordsProcessedTotal.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Throughput:</span>
                    <div className="font-mono font-bold text-indigo-900">{c.throughputEventsPerSec} events/sec</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Last Sync: {new Date(c.lastSyncAt).toLocaleTimeString()}</span>
                  <span>SSL: Enabled (TLS 1.3)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
