/**
 * Pramaan - How It Works (Deep Protocol & Architectural Explainer)
 * Explaining ZK Predicates, Commitments, Nullifiers, and Government Interoperability
 */

import React, { useState } from 'react';
import {
  Shield,
  Layers,
  KeyRound,
  CheckCircle2,
  Database,
  ArrowRight,
  EyeOff,
  Cpu,
  RefreshCw,
  Lock,
  Code2,
} from 'lucide-react';
import { Language, translations } from '../lib/i18n';

interface HowItWorksProps {
  lang: Language;
  onNavigate: (tab: string) => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ lang, onNavigate }) => {
  const t = translations[lang];
  const [activeStep, setActiveStep] = useState<number>(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-800 mb-4">
          <Shield className="w-3.5 h-3.5" />
          <span>Zero-Knowledge Sovereign Protocol</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          How Pramaan Enables Interoperability Without Centralization
        </h1>
        <p className="mt-3 text-base text-slate-600">
          A deep mathematical dive into how government departments communicate proof of eligibility across a federated mesh while preserving complete citizen privacy under the DPDP Act 2023.
        </p>
      </div>

      {/* 3-Actor Architectural Flow Visualizer */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center space-x-2">
          <Layers className="w-5 h-5 text-indigo-700" />
          <span>The Tripartite Sovereign Protocol Architecture</span>
        </h2>

        {/* Step Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setActiveStep(1)}
            className={`p-4 rounded-xl text-left border transition-all ${activeStep === 1 ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-slate-300'}`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeStep === 1 ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                1
              </span>
              <span className="font-bold text-sm text-slate-900">Issuer Authority</span>
            </div>
            <p className="text-xs text-slate-600">
              Dept of Revenue signs verifiable credential anchor & publishes Merkle root commitment.
            </p>
          </button>

          <button
            onClick={() => setActiveStep(2)}
            className={`p-4 rounded-xl text-left border transition-all ${activeStep === 2 ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-slate-300'}`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeStep === 2 ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                2
              </span>
              <span className="font-bold text-sm text-slate-900">Citizen Prover</span>
            </div>
            <p className="text-xs text-slate-600">
              Mobile Vault calculates client-side ZK proof & nullifier without revealing raw values.
            </p>
          </button>

          <button
            onClick={() => setActiveStep(3)}
            className={`p-4 rounded-xl text-left border transition-all ${activeStep === 3 ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-slate-300'}`}
          >
            <div className="flex items-center space-x-2 mb-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${activeStep === 3 ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                3
              </span>
              <span className="font-bold text-sm text-slate-900">Verifier Ministry</span>
            </div>
            <p className="text-xs text-slate-600">
              Dept of Agriculture checks cryptographic signature, logs single application number (SAN).
            </p>
          </button>
        </div>

        {/* Step Detail Display */}
        <div className="bg-slate-900 text-slate-100 rounded-xl p-6 border border-slate-800">
          {activeStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono text-indigo-400 font-bold">PHASE 1: CREDENTIAL ISSUANCE & ANCHORING</span>
                <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">Algorithm: Ed25519 + Pedersen Hash</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                When a citizen registers land with the State Department of Revenue, the department issues a Verifiable Credential directly into the citizen's secure enclave on their mobile phone. Concurrently, the department computes a cryptographic commitment hash of the record:
              </p>
              <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-emerald-400 border border-slate-800 space-y-1">
                <div>// Issuing Authority Commitment Calculation</div>
                <div>salt = SecureRandom.bytes(32);</div>
                <div>commitmentHash = SHA256(citizenId + landArea + salt);</div>
                <div>digitalSignature = Ed25519.sign(commitmentHash, deptPrivateKey);</div>
                <div>publishToStateTree(commitmentHash, digitalSignature);</div>
              </div>
              <div className="text-xs text-slate-400">
                Notice: The state public registry contains ONLY the cryptographic commitment. The raw land details remain strictly in the citizen's personal custody.
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono text-amber-400 font-bold">PHASE 2: CLIENT-SIDE PREDICATE SYNTHESIS</span>
                <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">Engine: snarkjs / Circom WASM</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                When the citizen applies for PM-KISAN, the scheme demands: <code className="text-amber-300">landArea &lt;= 2.0 Hectares</code>. The citizen's browser loads the sovereign arithmetic circuit in WebAssembly. The private input is the exact land area (e.g. 1.4 ha).
              </p>
              <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-amber-400 border border-slate-800 space-y-1">
                <div>// Zero-Knowledge Circuit Evaluation (Local Device)</div>
                <div>privateInput = {'{ landArea: 1.4, salt: 0x9f... }'};</div>
                <div>publicInput = {'{ threshold: 2.0, scheme: "PM-KISAN" }'};</div>
                <div>assert(landArea &lt;= threshold); // Constraint check</div>
                <div>nullifier = HMAC_SHA256(secretKey, schemeId); // Prevents replay attacks</div>
                <div>zkProof = Groth16.prove(circuit_proving_key, privateInput, publicInput);</div>
              </div>
              <div className="text-xs text-slate-400">
                Notice: The mathematical proof mathematically guarantees that <code className="text-slate-200">landArea &lt;= 2.0</code> evaluates to TRUE without revealing whether the citizen owns 0.1 ha, 1.4 ha, or 1.9 ha.
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono text-emerald-400 font-bold">PHASE 3: INSTANT VERIFICATION & SAN ISSUANCE</span>
                <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">Latency: &lt;180ms</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                The Department of Agriculture receives the proof, the public predicate statement, and the nullifier. It verifies the cryptographic pairing in sub-200ms. If valid and the nullifier has never been consumed for this fiscal year, it automatically approves the prerequisite and issues the Single Application Number (SAN).
              </p>
              <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-emerald-400 border border-slate-800 space-y-1">
                <div>// Department Verifier Node</div>
                <div>isValid = Groth16.verify(verificationKey, publicSignals, zkProof);</div>
                <div>isNotReplayed = checkAndMarkNullifier(zkProof.nullifier);</div>
                <div>if (isValid && isNotReplayed) {'{'}</div>
                <div>&nbsp;&nbsp;san = generateSAN("AGRI", "2026");</div>
                <div>&nbsp;&nbsp;appendAuditHashChain(san, zkProof.commitment, "VERIFIED");</div>
                <div>&nbsp;&nbsp;disburseDirectBenefit(san);</div>
                <div>{'}'}</div>
              </div>
              <div className="text-xs text-slate-400">
                Notice: The entire transaction is recorded in the SHA-256 tamper-evident ledger. The citizen's privacy was 100% preserved throughout the workflow.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Core Cryptographic Components */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-800 flex items-center justify-center mb-4">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">Cryptographic Commitments</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Commitments allow a department to lock in a citizen's data at issuance time using SHA-256 and Pedersen schemes. The data cannot be modified retroactively without changing the commitment hash.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-800 flex items-center justify-center mb-4">
            <RefreshCw className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">Nullifiers (Anti-Double Claim)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            A nullifier is a deterministic, pseudorandom hash generated during proof creation. It guarantees that an applicant cannot claim a single quota or subsidy twice under pseudonymity.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-800 flex items-center justify-center mb-4">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-2">SHA-256 Hash-Chained Audit</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every verification event, status transition, and consent revocation is cryptographically chained to the previous block hash, guaranteeing tamper-evidence across all 38 integrated departments.
          </p>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-indigo-900 text-white rounded-2xl p-8 text-center max-w-4xl mx-auto shadow-md">
        <h3 className="text-xl font-bold">Ready to Experience Pramaan as an Applicant?</h3>
        <p className="mt-2 text-xs sm:text-sm text-indigo-200 max-w-xl mx-auto">
          Explore public schemes, review eligibility predicates, and apply with mathematical zero-knowledge proof today.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => onNavigate('schemes')}
            className="bg-white text-indigo-950 font-bold px-5 py-2.5 rounded-lg text-xs hover:bg-indigo-50 transition-colors"
          >
            Explore Public Schemes Directory
          </button>
          <button
            onClick={() => onNavigate('developer')}
            className="bg-indigo-800 text-white font-semibold px-5 py-2.5 rounded-lg text-xs hover:bg-indigo-700 transition-colors border border-indigo-700"
          >
            Read OpenAPI Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
