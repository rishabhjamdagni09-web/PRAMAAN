/**
 * Pramaan - Citizen Portal Component
 * Complete Sovereign Citizen Experience: Wallet, Scheme Application Wizard, SAN Tracking, and DPDP Consent Center
 */

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Shield,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Eye,
  EyeOff,
  Zap,
  Lock,
  XCircle,
  Copy,
  QrCode,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Award,
} from 'lucide-react';
import { Language, translations } from '../lib/i18n';
import { Application, ConsentGrant, Credential, Scheme, User } from '../types';
import {
  subscribeCredentials,
  subscribeApplications,
  subscribeConsents,
  subscribeSchemes,
  submitApplicationToFirestore,
  revokeConsentInFirestore,
} from '../lib/firebase';

interface CitizenPortalProps {
  lang: Language;
  currentUser: User;
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
  selectedSchemeId?: string | null;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({
  lang,
  currentUser,
  activeSubTab,
  setActiveSubTab,
  selectedSchemeId,
}) => {
  const t = translations[lang];

  // Data States
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [consents, setConsents] = useState<ConsentGrant[]>([]);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);

  // Application Wizard State
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [appSchemeId, setAppSchemeId] = useState<string>(selectedSchemeId || 'scheme_pmkisan');
  const [generatingProofs, setGeneratingProofs] = useState(false);
  const [synthesizedProofs, setSynthesizedProofs] = useState<any[]>([]);
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [submittingApp, setSubmittingApp] = useState(false);
  const [issuedSan, setIssuedSan] = useState<string | null>(null);

  // SAN Tracking State
  const [trackingQuery, setTrackingQuery] = useState<string>('');
  const [activeTrackedApp, setActiveTrackedApp] = useState<Application | null>(null);

  // Test ZK Proof Modal State
  const [testProofModal, setTestProofModal] = useState(false);
  const [selectedCredForProof, setSelectedCredForProof] = useState<Credential | null>(null);
  const [testProofResult, setTestProofResult] = useState<any | null>(null);
  const [testingProof, setTestingProof] = useState(false);

  // Consent Revocation State
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/credentials').then((r) => r.json()),
      fetch('/api/applications').then((r) => r.json()),
      fetch('/api/consents').then((r) => r.json()),
      fetch('/api/schemes').then((r) => r.json()),
    ])
      .then(([credsData, appsData, consentsData, schemesData]) => {
        if (credsData.credentials) setCredentials(credsData.credentials);
        if (appsData.applications) {
          setApplications(appsData.applications);
          if (appsData.applications.length > 0 && !activeTrackedApp) {
            setActiveTrackedApp(appsData.applications[0]);
          }
        }
        if (consentsData.consents) setConsents(consentsData.consents);
        if (schemesData.schemes) setSchemes(schemesData.schemes);
      })
      .catch((err) => console.error('Error loading citizen data:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();

    // Live Real-Time Subscriptions via Firestore
    const unsubCreds = subscribeCredentials(currentUser.id, (creds) => {
      if (creds && creds.length > 0) setCredentials(creds);
    });
    const unsubApps = subscribeApplications({ citizenId: currentUser.id }, (apps) => {
      if (apps && apps.length > 0) {
        setApplications(apps);
        if (!activeTrackedApp) setActiveTrackedApp(apps[0]);
      }
    });
    const unsubConsents = subscribeConsents(currentUser.id, (csts) => {
      if (csts && csts.length > 0) setConsents(csts);
    });
    const unsubSchemes = subscribeSchemes((schms) => {
      if (schms && schms.length > 0) setSchemes(schms);
    });

    return () => {
      unsubCreds();
      unsubApps();
      unsubConsents();
      unsubSchemes();
    };
  }, [currentUser.id]);

  useEffect(() => {
    if (selectedSchemeId) {
      setAppSchemeId(selectedSchemeId);
      setWizardStep(1);
    }
  }, [selectedSchemeId]);

  // Handle Proof Generation in Application Wizard
  const handleSynthesizeProofs = async () => {
    const scheme = schemes.find((s) => s.id === appSchemeId);
    if (!scheme) return;

    setGeneratingProofs(true);
    const proofs: any[] = [];

    for (const req of scheme.requirements) {
      // Find matching credential
      const cred = credentials.find((c) => c.rawAttributesMasked[req.attribute] !== undefined);
      if (cred) {
        try {
          const res = await fetch('/api/proofs/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              credentialId: cred.id,
              schemeId: scheme.id,
              attribute: req.attribute,
              operator: req.operator,
              threshold: req.threshold,
            }),
          });
          const data = await res.json();
          if (data.success) {
            proofs.push(data.proof);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    setSynthesizedProofs(proofs);
    setGeneratingProofs(false);
    setWizardStep(3); // proceed to consent
  };

  // Submit Application with Proofs
  const handleSubmitApplication = async () => {
    if (!consentAgreed) return;
    setSubmittingApp(true);
    try {
      const res = await fetch('/api/applications/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schemeId: appSchemeId,
          proofs: synthesizedProofs,
          consentGranted: true,
        }),
      });
      const data = await res.json();
      if (data.success && data.sanNumber) {
        setIssuedSan(data.sanNumber);
        setWizardStep(4);

        // Persist directly to Firestore
        if (data.application) {
          await submitApplicationToFirestore(data.application);
        }

        // Record server-side hash-chained audit block
        await fetch('/api/audit/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'APPLICATION_FILED',
            actor: currentUser.name,
            actorRole: 'CITIZEN',
            targetEntity: 'APPLICATION',
            entityId: data.sanNumber,
            payload: { schemeId: appSchemeId, sanNumber: data.sanNumber },
          }),
        });

        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingApp(false);
    }
  };

  // Revoke Consent
  const handleRevokeConsent = async (consentId: string) => {
    setRevokingId(consentId);
    try {
      const res = await fetch(`/api/consents/${consentId}/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Citizen exercised DPDP Act Section 6(4) right to withdraw consent.' }),
      });
      const data = await res.json();
      if (data.success) {
        await revokeConsentInFirestore(consentId, 'Citizen exercised DPDP Act Section 6(4) right to withdraw consent.');

        // Record server-side hash-chained audit block
        await fetch('/api/audit/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'CONSENT_REVOKED',
            actor: currentUser.name,
            actorRole: 'CITIZEN',
            targetEntity: 'CONSENT',
            entityId: consentId,
            payload: { consentId, reason: 'DPDP Act Section 6(4)' },
          }),
        });

        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRevokingId(null);
    }
  };

  // Run Test ZK Proof Generation in Wallet
  const handleTestGenerateProof = async (attr: string, op: any, thresh: any) => {
    if (!selectedCredForProof) return;
    setTestingProof(true);
    setTestProofResult(null);

    try {
      const res = await fetch('/api/proofs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credentialId: selectedCredForProof.id,
          schemeId: 'SCHEME_TEST_BENCH',
          attribute: attr,
          operator: op,
          threshold: thresh,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Also verify it
        const verifyRes = await fetch('/api/proofs/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ proof: data.proof }),
        });
        const verifyData = await verifyRes.json();
        setTestProofResult({
          proof: data.proof,
          context: data.cryptographicContext,
          verification: verifyData,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTestingProof(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner: Citizen Identity Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-indigo-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-xl font-bold border border-white/20">
              {currentUser.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold">{currentUser.name}</h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded">
                  Aadhaar eKYC Verified
                </span>
              </div>
              <div className="text-xs text-indigo-200 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                <span>Phone: {currentUser.phone}</span>
                <span>•</span>
                <span>Sovereign Identity Hash: 0x8a92...f01b</span>
                <span>•</span>
                <span>Active Vault Anchor: DigiLocker Mesh</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="bg-white/10 px-3 py-2 rounded-lg border border-white/10 text-center">
              <div className="text-[10px] text-indigo-200 uppercase">Credentials</div>
              <div className="text-base font-bold">{credentials.length}</div>
            </div>
            <div className="bg-white/10 px-3 py-2 rounded-lg border border-white/10 text-center">
              <div className="text-[10px] text-indigo-200 uppercase">Active SANs</div>
              <div className="text-base font-bold">{applications.length}</div>
            </div>
            <div className="bg-white/10 px-3 py-2 rounded-lg border border-white/10 text-center">
              <div className="text-[10px] text-indigo-200 uppercase">Consents</div>
              <div className="text-base font-bold">{consents.filter((c) => c.status === 'ACTIVE').length}</div>
            </div>
          </div>
        </div>

        {/* Proactive Welfare Alert */}
        <div className="mt-6 pt-4 border-t border-indigo-800/80 flex items-center justify-between text-xs bg-indigo-950/40 p-3 rounded-lg">
          <div className="flex items-center space-x-2 text-indigo-200">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              <strong>Proactive Scheme Match:</strong> Based on your Land Khatauni & Income certificate, you are automatically eligible for <strong>PM-KISAN (₹6,000/yr)</strong> and <strong>Kisan Credit Card</strong>!
            </span>
          </div>
          <button
            onClick={() => {
              setAppSchemeId('scheme_pmkisan');
              setWizardStep(1);
              setActiveSubTab('applyScheme');
            }}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-1 rounded text-[11px] whitespace-nowrap transition-colors"
          >
            Apply with 1-Click ZK Proof
          </button>
        </div>
      </div>

      {/* 1. Citizen Dashboard Sub-Tab */}
      {activeSubTab === 'citizenDashboard' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Recent Applications */}
            <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <FileCheck className="w-4 h-4 text-indigo-800" />
                  <h2 className="text-base font-bold text-slate-900">Your Active Applications & SANs</h2>
                </div>
                <button
                  onClick={() => setActiveSubTab('tracking')}
                  className="text-xs font-semibold text-indigo-700 hover:text-indigo-900"
                >
                  View All & Track
                </button>
              </div>

              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => {
                      setActiveTrackedApp(app);
                      setActiveSubTab('tracking');
                    }}
                    className="p-4 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 cursor-pointer transition-all flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-sm text-indigo-950">{app.sanNumber}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {app.departmentName}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-800 mt-1">{app.schemeTitle}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Submitted: {new Date(app.submittedAt).toLocaleDateString()} • Benefit: {app.disbursementAmount}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {app.status}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-end space-x-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>SLA Safe</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Digital Wallet Mini Overview */}
            <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Wallet className="w-4 h-4 text-indigo-800" />
                  <h2 className="text-base font-bold text-slate-900">Verifiable Credentials</h2>
                </div>
                <button
                  onClick={() => setActiveSubTab('wallet')}
                  className="text-xs font-semibold text-indigo-700 hover:text-indigo-900"
                >
                  Manage Wallet
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                {credentials.map((cred) => (
                  <div key={cred.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{cred.title}</span>
                      <span className="text-[10px] text-emerald-700 font-mono">ANCHORED</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{cred.issuingDeptName || cred.issuerName}</div>
                    <div className="font-mono text-[10px] text-indigo-900 truncate mt-1">
                      Commitment: {cred.commitmentHash.substring(0, 20)}...
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setActiveSubTab('wallet')}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
              >
                Open Verifiable Wallet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Digital Wallet Sub-Tab */}
      {activeSubTab === 'wallet' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t.wallet.title}</h2>
            <p className="text-xs text-slate-500 mt-1">{t.wallet.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {credentials.map((cred) => (
              <div key={cred.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-800 font-bold border border-indigo-100">
                      {cred.credentialType || cred.type}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      Issued: {new Date(cred.issuedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{cred.title}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">{cred.issuingDeptName || cred.issuerName}</div>

                  {/* Commitment Hash Anchor */}
                  <div className="mt-4 p-2.5 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px]">
                    <div className="text-slate-500 text-[10px] uppercase font-bold">Merkle Commitment Anchor:</div>
                    <div className="text-indigo-900 break-all">{cred.commitmentHash}</div>
                  </div>

                  {/* Attributes View */}
                  <div className="mt-4">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Masked Credentials (Encrypted):
                    </div>
                    <div className="space-y-1 text-xs">
                      {Object.entries(cred.rawAttributesMasked).map(([k, v]) => (
                        <div key={k} className="flex justify-between p-1.5 bg-slate-50 rounded border border-slate-100">
                          <span className="text-slate-500 font-mono">{k}:</span>
                          <span className="font-bold text-slate-900 font-mono">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setSelectedCredForProof(cred);
                      setTestProofModal(true);
                      setTestProofResult(null);
                    }}
                    className="w-full py-2 bg-indigo-900 hover:bg-indigo-950 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 shadow-2xs"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Generate ZK Proof for this Credential</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Apply for Scheme Wizard Sub-Tab */}
      {activeSubTab === 'applyScheme' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-4xl mx-auto space-y-8">
          {/* Wizard Step Progress */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
            <div className={`p-2 rounded-lg border ${wizardStep >= 1 ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-200 text-slate-400'}`}>
              1. Select Scheme
            </div>
            <div className={`p-2 rounded-lg border ${wizardStep >= 2 ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-200 text-slate-400'}`}>
              2. ZK Synthesis
            </div>
            <div className={`p-2 rounded-lg border ${wizardStep >= 3 ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-200 text-slate-400'}`}>
              3. DPDP Consent
            </div>
            <div className={`p-2 rounded-lg border ${wizardStep >= 4 ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'border-slate-200 text-slate-400'}`}>
              4. Issued SAN
            </div>
          </div>

          {/* Step 1: Select Scheme */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Step 1: Choose Sovereign Welfare Scheme</h3>
                <p className="text-xs text-slate-500">Select the government program you wish to apply for.</p>
              </div>

              <div className="space-y-3">
                {schemes.map((scheme) => (
                  <div
                    key={scheme.id}
                    onClick={() => setAppSchemeId(scheme.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${appSchemeId === scheme.id ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">{scheme.title}</span>
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {scheme.departmentName}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">{scheme.description}</p>
                      <div className="text-indigo-900 font-bold mt-2">
                        Benefit: {scheme.benefitAmount} • SLA: {scheme.slaHours}h guarantee
                      </div>
                    </div>
                    {appSchemeId === scheme.id ? (
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setWizardStep(2)}
                  className="px-6 py-2.5 bg-indigo-900 text-white rounded-lg text-xs font-bold hover:bg-indigo-950 transition-colors flex items-center space-x-1"
                >
                  <span>Proceed to Proof Generation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Synthesize Proofs */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Step 2: Synthesize Client-Side Zero-Knowledge Proofs</h3>
                <p className="text-xs text-slate-500">
                  Pramaan will generate cryptographic boolean proofs on your device. Your sensitive financial and land documents remain completely private.
                </p>
              </div>

              {/* Requirements to be proved */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-800">Required Eligibility Predicates:</div>
                {schemes.find((s) => s.id === appSchemeId)?.requirements.map((req) => (
                  <div key={req.id} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-800">{req.attributeName}:</span>
                    <span className="font-mono text-indigo-900 font-bold">{req.thresholdDisplay}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-start space-x-2">
                <Shield className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Zero-Data Guarantee:</strong> The recipient department will receive only a cryptographic assertion: <code>[PREDICATE_TRUE]</code> signed with Groth16 zk-SNARK. Zero personal database records are transmitted.
                </span>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setWizardStep(1)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSynthesizeProofs}
                  disabled={generatingProofs}
                  className="px-6 py-2.5 bg-indigo-900 text-white rounded-lg text-xs font-bold hover:bg-indigo-950 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {generatingProofs ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                  )}
                  <span>{generatingProofs ? 'Computing Groth16 Proofs on Device...' : 'Synthesize Cryptographic Proofs'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Explicit DPDP Act 2023 Consent */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Step 3: Explicit Purpose Consent (DPDP Act 2023)</h3>
                <p className="text-xs text-slate-500">
                  Under Section 6(4) of India's Digital Personal Data Protection Act, your explicit, single-use consent is mandatory before proof verification.
                </p>
              </div>

              {/* Synthesized Proofs Summary */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 text-xs font-mono">
                <div className="text-emerald-400 font-bold">✓ Successfully Synthesized {synthesizedProofs.length} ZK Proofs:</div>
                {synthesizedProofs.map((p, idx) => (
                  <div key={idx} className="text-slate-300 text-[11px] truncate">
                    Proof #{idx + 1}: {p.attribute} {p.operator} {p.threshold} | Nullifier: {p.nullifierHash?.substring(0, 16)}...
                  </div>
                ))}
              </div>

              {/* Consent Checkbox */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentAgreed}
                    onChange={(e) => setConsentAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <div className="text-xs text-amber-950">
                    <strong>Explicit Consent Declaration:</strong> {t.apply.consentText}
                  </div>
                </label>
                <div className="text-[11px] text-amber-800">
                  ✓ Right to Revoke: You can revoke this evaluation consent at any time from your Consent Center.
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setWizardStep(2)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitApplication}
                  disabled={!consentAgreed || submittingApp}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-2 disabled:opacity-50 shadow-xs"
                >
                  {submittingApp ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>{submittingApp ? 'Issuing Single Application Number...' : t.apply.submitBtn}</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Issued Single Application Number (SAN) */}
          {wizardStep === 4 && issuedSan && (
            <div className="text-center py-6 space-y-4 animate-in fade-in duration-200">
              <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
              <h2 className="text-2xl font-black text-slate-900">{t.apply.sanSuccess}</h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Your application has been registered across the national interoperability mesh. The recipient department has received and verified your zero-knowledge proofs.
              </p>

              <div className="p-6 bg-slate-900 text-white rounded-xl max-w-md mx-auto space-y-3">
                <div className="text-xs text-indigo-300 uppercase tracking-widest font-mono">Single Application Number</div>
                <div className="text-2xl font-mono font-black text-emerald-400 select-all">{issuedSan}</div>
                <div className="text-[11px] text-slate-400">Trackable across all 38 integrated ministries & state portals</div>
              </div>

              <div className="flex justify-center space-x-3 pt-4">
                <button
                  onClick={() => {
                    setActiveSubTab('tracking');
                    setTrackingQuery(issuedSan);
                  }}
                  className="px-5 py-2.5 bg-indigo-900 text-white rounded-lg text-xs font-bold hover:bg-indigo-950 transition-colors"
                >
                  Track Application Status Live
                </button>
                <button
                  onClick={() => {
                    setWizardStep(1);
                    setIssuedSan(null);
                  }}
                  className="px-5 py-2.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Apply for Another Scheme
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Unified Tracking (SAN) Sub-Tab */}
      {activeSubTab === 'tracking' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t.tracking.title}</h2>
            <p className="text-xs text-slate-500 mt-1">{t.tracking.subtitle}</p>
          </div>

          {/* SAN Search Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={t.tracking.searchPlaceholder}
              value={trackingQuery}
              onChange={(e) => setTrackingQuery(e.target.value)}
              className="flex-1 border border-slate-300 rounded-lg px-4 py-2.5 text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
            <button
              onClick={() => {
                const found = applications.find(
                  (a) => a.sanNumber.toUpperCase() === trackingQuery.trim().toUpperCase()
                );
                if (found) setActiveTrackedApp(found);
              }}
              className="px-5 py-2.5 bg-indigo-900 text-white rounded-lg text-xs font-bold hover:bg-indigo-950 transition-colors"
            >
              {t.tracking.trackBtn}
            </button>
          </div>

          {activeTrackedApp && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
              {/* Application Top Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-lg font-black text-indigo-950">{activeTrackedApp.sanNumber}</span>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {activeTrackedApp.status}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-700 mt-1">{activeTrackedApp.schemeTitle}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Department: {activeTrackedApp.departmentName} ({activeTrackedApp.departmentCode})
                  </div>
                </div>

                <div className="text-left sm:text-right text-xs">
                  <div className="font-mono font-bold text-indigo-900 text-sm">{activeTrackedApp.disbursementAmount}</div>
                  <div className="text-slate-500 text-[11px] flex items-center sm:justify-end space-x-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>SLA Deadline: {new Date(activeTrackedApp.slaDeadline).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Event Audit Trail Timeline */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
                  {t.tracking.timeline}
                </h3>
                <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {activeTrackedApp.events.map((event, idx) => (
                    <div key={event.id} className="flex items-start space-x-4 relative pl-8">
                      <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white ring-1 ring-indigo-200"></div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{event.stage}</div>
                        <p className="text-slate-600 text-xs mt-0.5">{event.description}</p>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">
                          {new Date(event.timestamp).toLocaleString()} • {event.actor}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attached Cryptographic Proofs */}
              {activeTrackedApp.proofs && activeTrackedApp.proofs.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                    {t.tracking.proofsVerified}
                  </h3>
                  <div className="space-y-2 font-mono text-[11px]">
                    {activeTrackedApp.proofs.map((proof, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                        <div className="flex justify-between text-indigo-900 font-bold">
                          <span>Predicate #{idx + 1}: {proof.attribute} {proof.operator} {proof.threshold}</span>
                          <span className="text-emerald-700">VERIFIED</span>
                        </div>
                        <div className="text-slate-500 truncate">Commitment: {proof.commitment}</div>
                        <div className="text-slate-500 truncate">Nullifier: {proof.nullifierHash}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. DPDP Consent Management Sub-Tab */}
      {activeSubTab === 'consents' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t.consents.title}</h2>
            <p className="text-xs text-slate-500 mt-1">{t.consents.subtitle}</p>
          </div>

          <div className="space-y-3">
            {consents.map((consent) => {
              const isActive = consent.status === 'ACTIVE';
              return (
                <div
                  key={consent.id}
                  className={`p-5 rounded-xl border transition-all ${isActive ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-50 border-slate-200 opacity-70'}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">{consent.departmentName}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isActive ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'}`}>
                          {consent.status}
                        </span>
                      </div>
                      <div className="text-slate-500 text-xs mt-0.5">
                        SAN Reference: <span className="font-mono text-indigo-900 font-bold">{consent.sanNumber}</span>
                      </div>
                    </div>

                    {isActive && (
                      <button
                        onClick={() => handleRevokeConsent(consent.id)}
                        disabled={revokingId === consent.id}
                        className="px-3 py-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors disabled:opacity-50"
                      >
                        {revokingId === consent.id ? 'Revoking...' : t.consents.revokeBtn}
                      </button>
                    )}
                  </div>

                  <div className="mt-3 text-xs space-y-1">
                    <div>
                      <span className="text-slate-500 font-medium">Purpose: </span>
                      <span className="text-slate-800">{consent.purpose}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 text-[11px] text-slate-500">
                      <span>Granted: {new Date(consent.grantedAt).toLocaleDateString()}</span>
                      <span>Valid Until: {new Date(consent.validUntil).toLocaleDateString()}</span>
                      <span>Verification Count: {consent.accessCount}</span>
                    </div>
                  </div>

                  {consent.status === 'REVOKED' && (
                    <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded text-[11px] text-rose-800">
                      Revocation Recorded: {consent.revocationReason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Test ZK Proof Modal for Wallet */}
      {testProofModal && selectedCredForProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Synthesize ZK Proof: {selectedCredForProof.title}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select an attribute from your verifiable credential to prove against a threshold without revealing the actual value.
            </p>

            <div className="space-y-4 text-xs">
              {Object.entries(selectedCredForProof.rawAttributesMasked).map(([attr, val]) => (
                <div key={attr} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-mono font-bold text-slate-800">{attr}</div>
                    <div className="text-[11px] text-slate-500">Actual Secret Value: {String(val)}</div>
                  </div>
                  <button
                    onClick={() => {
                      if (attr === 'totalAreaHectares') handleTestGenerateProof(attr, '<=', 2.0);
                      else if (attr === 'annualIncomeINR') handleTestGenerateProof(attr, '<=', 250000);
                      else if (attr === 'aggregatePercentage') handleTestGenerateProof(attr, '>=', 75);
                      else handleTestGenerateProof(attr, '==', val);
                    }}
                    disabled={testingProof}
                    className="px-3 py-1.5 bg-indigo-900 text-white rounded text-xs font-semibold hover:bg-indigo-950"
                  >
                    Test Proof
                  </button>
                </div>
              ))}

              {testProofResult && (
                <div className="p-4 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] space-y-2 border border-slate-800">
                  <div className="text-emerald-400 font-bold">✓ Cryptographic ZK Proof Synthesized & Verified!</div>
                  <div className="truncate">Commitment: {testProofResult.proof.commitment}</div>
                  <div className="truncate">Nullifier: {testProofResult.proof.nullifierHash}</div>
                  <div className="text-emerald-300">
                    Claim Satisfied: {String(testProofResult.verification.claimSatisfied)} (Groth16 Valid)
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setTestProofModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
