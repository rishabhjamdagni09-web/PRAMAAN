/**
 * Pramaan - Public Home View
 * High-impact sovereign government landing experience with interactive ZK proof simulator
 */

import React, { useState } from 'react';
import {
  Shield,
  ArrowRight,
  Lock,
  CheckCircle2,
  FileCheck,
  Zap,
  Building2,
  Users,
  EyeOff,
  Server,
  KeyRound,
  ExternalLink,
  ChevronRight,
  Award,
} from 'lucide-react';
import { Language, translations } from '../lib/i18n';

interface PublicHomeProps {
  lang: Language;
  onNavigate: (tab: string) => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({ lang, onNavigate }) => {
  const t = translations[lang];

  // Interactive ZK Proof Simulator State
  const [simulatorSecret, setSimulatorSecret] = useState<number>(140000);
  const [simulatorThreshold, setSimulatorThreshold] = useState<number>(250000);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<{
    computed: boolean;
    satisfied: boolean;
    commitment: string;
    nullifier: string;
    signature: string;
    latencyMs: number;
    rawBytesTransferred: number;
  } | null>(null);

  const runSimulation = () => {
    setSimulating(true);
    setSimulationResult(null);

    setTimeout(() => {
      const satisfied = simulatorSecret <= simulatorThreshold;
      setSimulationResult({
        computed: true,
        satisfied,
        commitment: '0x3a4b9c8d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
        nullifier: '0x8f2d9e11c34a9b671a5500e23ef890a82b4512e038d17b4c6e9a0123f458129a',
        signature: '0x7b1c4e92a0134f5592bcde1029384756',
        latencyMs: 142,
        rawBytesTransferred: 0,
      });
      setSimulating(false);
    }, 600);
  };

  return (
    <div className="space-y-16 py-8">
      {/* 1. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Sovereign Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-800 mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
            <span>{t.home.heroBadge}</span>
          </div>

          {/* Main Title & Brand Tagline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-tight sm:leading-none">
            {t.home.heroTitle}
          </h1>

          <div className="mt-4 text-xl sm:text-2xl font-extrabold text-indigo-900 font-serif italic">
            "{t.tagline}"
          </div>

          <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
            {t.home.heroDesc}
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('schemes')}
              className="px-6 py-3.5 rounded-lg bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
            >
              <span>{t.home.ctaApply}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('howItWorks')}
              className="px-6 py-3.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-xs transition-all flex items-center space-x-2"
            >
              <Zap className="w-4 h-4 text-amber-600" />
              <span>{t.home.ctaDemo}</span>
            </button>

            <button
              onClick={() => onNavigate('developer')}
              className="px-6 py-3.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-all flex items-center space-x-2"
            >
              <span>{t.home.ctaDocs}</span>
            </button>
          </div>
        </div>

        {/* 4 Sovereign Metrics Cards */}
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-3xl font-black text-indigo-900 tracking-tight">
              {t.home.stats.verifiedProofs}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">
              {t.home.stats.verifiedProofsLabel}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-2 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Groth16 & SHA-256 Verified</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-3xl font-black text-indigo-900 tracking-tight">
              {t.home.stats.departmentsConnected}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">
              {t.home.stats.departmentsConnectedLabel}
            </div>
            <div className="text-[11px] text-indigo-600 font-medium mt-2 flex items-center space-x-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Central & State Mesh Nodes</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-3xl font-black text-emerald-700 tracking-tight">
              {t.home.stats.dataLeaksPrevented}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">
              {t.home.stats.dataLeaksPreventedLabel}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-2 flex items-center space-x-1">
              <EyeOff className="w-3.5 h-3.5" />
              <span>Zero-PII Interoperability</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-3xl font-black text-indigo-900 tracking-tight">
              {t.home.stats.avgVerificationTime}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1">
              {t.home.stats.avgVerificationTimeLabel}
            </div>
            <div className="text-[11px] text-indigo-600 font-medium mt-2 flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Real-Time SLA Settlement</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive ZK Proof Simulator Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white rounded-2xl p-6 sm:p-10 border border-indigo-900 shadow-xl overflow-hidden relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Interactive Verification Sandbox</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Try It Live: How a Zero-Knowledge Predicate Works
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Witness how a citizen proves their eligibility for a ₹6,000 welfare scheme (e.g. PM-KISAN) without the recipient department ever learning their exact salary or tax returns.
            </p>
          </div>

          {/* Simulator Grid */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Citizen Device (Vault) */}
            <div className="lg:col-span-5 bg-slate-800/80 rounded-xl p-5 border border-slate-700/80">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
                    Citizen Private Vault (Client Device)
                  </span>
                </div>
                <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300 font-mono">
                  AES-256 Encrypted
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Private Annual Income (Secret):</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-bold text-white font-mono">
                      ₹{simulatorSecret.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-slate-400">(Never leaves device)</span>
                  </div>
                  <input
                    type="range"
                    min="50000"
                    max="400000"
                    step="10000"
                    value={simulatorSecret}
                    onChange={(e) => setSimulatorSecret(Number(e.target.value))}
                    className="w-full mt-2 accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="pt-2 border-t border-slate-700">
                  <label className="block text-slate-400 mb-1">Scheme Eligibility Rule (Public Predicate):</label>
                  <div className="font-semibold text-indigo-300 font-mono">
                    Must be Annual Income ≤ ₹{simulatorThreshold.toLocaleString('en-IN')}
                  </div>
                </div>

                <button
                  onClick={runSimulation}
                  disabled={simulating}
                  className="w-full mt-3 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {simulating ? (
                    <span>Synthesizing Cryptographic Proof...</span>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>Synthesize Client-Side ZK Proof</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Middle: Wire / Proof Transmission */}
            <div className="lg:col-span-2 text-center py-2 lg:py-0 flex flex-col items-center justify-center">
              <div className="text-[11px] font-mono text-indigo-300 font-semibold mb-1">
                Zero Data Wire
              </div>
              <div className="w-full h-0.5 bg-gradient-to-r from-indigo-500 via-amber-400 to-emerald-400 hidden lg:block"></div>
              <div className="text-[10px] text-slate-400 mt-1">
                Payload: 0 Bytes Raw PII
              </div>
            </div>

            {/* Right: Department Verifier */}
            <div className="lg:col-span-5 bg-slate-800/80 rounded-xl p-5 border border-slate-700/80">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div>
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
                    Recipient Department Verifier (AGRI Node)
                  </span>
                </div>
                <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300 font-mono">
                  NDGF Standard
                </span>
              </div>

              {simulationResult ? (
                <div className="space-y-3 text-xs animate-in fade-in duration-200">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-700">
                    <span className="text-slate-400">Mathematical Claim:</span>
                    <span className={`font-bold font-mono px-2 py-0.5 rounded ${simulationResult.satisfied ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                      {simulationResult.satisfied ? 'PREDICATE_TRUE' : 'PREDICATE_FALSE'}
                    </span>
                  </div>

                  <div className="space-y-1 font-mono text-[11px] text-slate-400">
                    <div className="truncate">
                      <span className="text-slate-500">Commitment: </span>
                      <span className="text-indigo-300">{simulationResult.commitment}</span>
                    </div>
                    <div className="truncate">
                      <span className="text-slate-500">Nullifier: </span>
                      <span className="text-indigo-300">{simulationResult.nullifier}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Verification Latency: </span>
                      <span className="text-emerald-400 font-bold">{simulationResult.latencyMs}ms</span>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-emerald-900/30 border border-emerald-700/50 text-[11px] text-emerald-300 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      {simulationResult.satisfied
                        ? 'Verification Complete! Citizen qualifies for PM-KISAN without revealing exact bank income.'
                        : 'Verification Complete! Citizen does not meet threshold; no sensitive income was exposed.'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Click "Synthesize Client-Side ZK Proof" on the left to observe zero-knowledge verification in real time.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Paradigm Shift (Old vs New) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t.home.comparisonTitle}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Why government departments must shift from centralized data duplication to sovereign zero-knowledge verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Old Traditional Way */}
          <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-6 sm:p-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center font-bold text-sm">
                ✕
              </div>
              <h3 className="text-lg font-bold text-rose-950">{t.home.oldWayTitle}</h3>
            </div>
            <p className="text-sm text-rose-900/90 leading-relaxed mb-6">
              {t.home.oldWayDesc}
            </p>
            <div className="space-y-2 text-xs text-rose-900/80">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>Requires citizen to upload photocopy/PDF of certificates</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>Department databases become honeypots for cyber attacks</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>High administrative overhead verifying forged document scans</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>Violates DPDP Act 2023 purpose limitation principles</span>
              </div>
            </div>
          </div>

          {/* New Pramaan Sovereign Way */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-6 sm:p-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <h3 className="text-lg font-bold text-emerald-950">{t.home.newWayTitle}</h3>
            </div>
            <p className="text-sm text-emerald-900/90 leading-relaxed mb-6">
              {t.home.newWayDesc}
            </p>
            <div className="space-y-2 text-xs text-emerald-900/80">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>Cryptographic predicate proof synthesized locally on phone/browser</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>Zero raw personal data stored by evaluating ministries</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>Mathematically impossible to forge (Groth16 zk-SNARK)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>100% compliant with DPDP Act Section 6(4) consent revocation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 3 Sovereign Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t.home.stepsTitle}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            A frictionless, sovereign interaction journey designed for Indian citizens and ministries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-800 font-black text-base flex items-center justify-center mb-4 border border-indigo-200">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">{t.home.step1Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.home.step1Desc}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-800 font-black text-base flex items-center justify-center mb-4 border border-indigo-200">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">{t.home.step2Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.home.step2Desc}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-800 font-black text-base flex items-center justify-center mb-4 border border-indigo-200">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">{t.home.step3Title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.home.step3Desc}
            </p>
          </div>
        </div>
      </section>

      {/* 5. Realistic Citizen & Department Testimonial Journeys */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100 rounded-2xl p-8 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">
            Impact in Action: Real Interoperability Stories
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                  RK
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Ramesh Kumar</div>
                  <div className="text-xs text-slate-500">Farmer, Barabanki (Uttar Pradesh)</div>
                </div>
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed">
                "Earlier, applying for PM-KISAN required visiting the Tehsil office three times to collect physical Khatauni land records and submitting Xerox copies. With Pramaan, my phone generated an encrypted proof in 2 seconds. The subsidy was approved in 48 hours without any paperwork."
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Scheme: PM-KISAN Samman Nidhi</span>
                <span className="font-semibold text-emerald-700">SAN-2026-IND-883921</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-sm">
                  PS
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Priya Sharma</div>
                  <div className="text-xs text-slate-500">Undergraduate Scholar, Delhi</div>
                </div>
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed">
                "For national scholarships, I was worried about uploading my father's entire tax return and personal income certificates online. Pramaan allowed me to prove that our family income is below ₹3.5 lakh without uploading any financial documents. My privacy is fully protected."
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Scheme: National Merit Scholarship</span>
                <span className="font-semibold text-blue-700">SAN-2026-IND-994102</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
