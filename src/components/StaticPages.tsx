/**
 * Pramaan - Static Statutory, Security & Compliance Documentation
 * GIGW 3.0, DPDP Act 2023, WCAG 2.1 AA Compliance Statements
 */

import React from 'react';
import { Shield, Lock, FileText, CheckCircle2, Eye, Award, Building2 } from 'lucide-react';
import { Language, translations } from '../lib/i18n';

interface StaticPageProps {
  lang: Language;
  onNavigate: (tab: string) => void;
}

export const AboutPage: React.FC<StaticPageProps> = ({ lang, onNavigate }) => {
  const t = translations[lang];
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-2">
          <Building2 className="w-3.5 h-3.5" />
          <span>About Pramaan National Grid</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Sovereign Digital Public Infrastructure for Zero-Knowledge Interoperability
        </h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Pramaan ("प्रमाण") is India's sovereign interoperability platform designed by the Ministry of Electronics and Information Technology (MeitY) and the National Informatics Centre (NIC).
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs leading-relaxed text-slate-700">
        <h2 className="text-base font-bold text-slate-900">The Problem Pramaan Solves</h2>
        <p>
          Prior to Pramaan, when an Indian citizen applied for welfare schemes (such as PM-KISAN, scholarship subsidies, or healthcare benefits), each department demanded physical certificates or scanned PDFs (Khatauni land records, income certificates, caste certificates). This resulted in massive administrative friction, rampant forgery of paper documents, and dangerous duplication of citizen personal identifiable information (PII) across hundreds of state and central databases.
        </p>
        <p>
          Under the Digital Personal Data Protection (DPDP) Act 2023, government ministries face strict purpose limitation requirements and steep liabilities for data breaches. Centralizing sensitive financial or health data across multiple departmental silos creates unacceptable vulnerability.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs leading-relaxed text-slate-700">
        <h2 className="text-base font-bold text-slate-900">The Sovereign Architectural Guarantee</h2>
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-950 font-serif italic text-sm font-bold text-center">
          "Proof travels. Your data doesn't."
        </div>
        <p>
          By implementing zero-knowledge succinct non-interactive arguments of knowledge (zk-SNARKs) based on Groth16 and SHA-256 state tree commitments, Pramaan shifts the paradigm from <strong>data exchange</strong> to <strong>mathematical verification</strong>.
        </p>
        <p>
          When the Department of Agriculture verifies an applicant for PM-KISAN, it does not receive the citizen's income tax return or land deed. Instead, the citizen's client device proves the mathematical predicate: <code>LandArea &lt;= 2.0 Hectares = TRUE</code>. The proof is verified in sub-200ms, and an instant Single Application Number (SAN) is issued.
        </p>
      </div>
    </div>
  );
};

export const SecurityPolicyPage: React.FC<StaticPageProps> = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2">
          <Shield className="w-3.5 h-3.5" />
          <span>National Cyber Security Architecture</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Pramaan Security Posture & Threat Model
        </h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Comprehensive defense-in-depth architecture adhering to Indian CERT-In guidelines, ISO 27001 standards, and OWASP Top 10 mitigation strategies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <Lock className="w-4 h-4 text-indigo-700" />
            <span>Zero-Knowledge Cryptography</span>
          </div>
          <p className="text-slate-600">
            Groth16 zk-SNARK circuits evaluate predicates on BN254 / Alt_bn128 curves. Mathematical soundness ensures no false proofs can be accepted (1 in 2^128 security margin).
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <FileText className="w-4 h-4 text-indigo-700" />
            <span>Cryptographic Nullifiers</span>
          </div>
          <p className="text-slate-600">
            Every proof generates a unique nullifier hash: <code>HMAC-SHA256(SecretKey, SchemeID)</code>. This prevents double-claiming quotas while maintaining pseudonymity.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <Shield className="w-4 h-4 text-indigo-700" />
            <span>SHA-256 Tamper-Evident Ledger</span>
          </div>
          <p className="text-slate-600">
            Every transaction, consent grant, and status change is hash-chained to the previous block. Any retroactive database modification breaks the chain and alerts administrators.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="font-bold text-slate-900 text-sm flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-700" />
            <span>Data-at-Rest & Wire Security</span>
          </div>
          <p className="text-slate-600">
            Citizen credentials stored in browser enclaves are sealed with AES-256-GCM. Inter-department mesh links strictly enforce TLS 1.3 with mutual authentication (mTLS).
          </p>
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicyPage: React.FC<StaticPageProps> = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-2">
          <Lock className="w-3.5 h-3.5" />
          <span>Statutory Data Protection</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Privacy Policy & DPDP Act 2023 Compliance
        </h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          How Pramaan enforces Section 6(4) citizen rights, purpose limitation, and data minimization across all public sector applications.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs leading-relaxed text-slate-700">
        <h2 className="text-base font-bold text-slate-900">1. Data Minimization by Design</h2>
        <p>
          Pramaan does not maintain a central citizen database. When you apply for a scheme, no copies of your income tax returns, land deeds, or marks sheets are created. Only cryptographic boolean proofs (Groth16) are evaluated by evaluating ministries.
        </p>

        <h2 className="text-base font-bold text-slate-900 pt-3 border-t border-slate-100">2. Right to Withdraw Consent (Section 6(4))</h2>
        <p>
          Under India's Digital Personal Data Protection Act 2023, every citizen holds the unconditional right to withdraw consent at any time. When you click "Revoke Consent" in the Pramaan Consent Center, the evaluating department's token is immediately invalidated, and a permanent cryptographic revocation block is written to the audit log.
        </p>

        <h2 className="text-base font-bold text-slate-900 pt-3 border-t border-slate-100">3. Purpose Limitation</h2>
        <p>
          Every consent declaration specifies the precise scheme and duration. Evaluating departments are mathematically and contractually prevented from utilizing proofs for any secondary or unintended administrative purposes.
        </p>
      </div>
    </div>
  );
};

export const AccessibilityStatementPage: React.FC<StaticPageProps> = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-800 uppercase tracking-wider mb-2">
          <Eye className="w-3.5 h-3.5" />
          <span>GIGW 3.0 & Digital Inclusivity</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Accessibility Statement
        </h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Pramaan is built in full compliance with the Guidelines for Indian Government Websites (GIGW 3.0) and the World Wide Web Consortium (W3C) Web Content Accessibility Guidelines (WCAG 2.1 Level AA).
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs leading-relaxed text-slate-700">
        <h2 className="text-base font-bold text-slate-900">Accessibility Features Implemented:</h2>
        <ul className="space-y-2 list-disc pl-5">
          <li><strong>Text Resizing:</strong> A-, A, and A+ buttons allow citizens to adjust visual font scaling without distorting layout flow.</li>
          <li><strong>High Contrast Mode:</strong> High-contrast color themes for visually impaired users.</li>
          <li><strong>Bilingual Availability:</strong> Full interface localization in English and Hindi (हिन्दी) in compliance with the Official Languages Act.</li>
          <li><strong>Skip to Main Content:</strong> Screen-reader accessible skip-links at the top of every document page.</li>
          <li><strong>Keyboard Navigation:</strong> All forms, proof simulators, and interactive modals can be operated via standard Tab, Shift+Tab, and Enter keys.</li>
          <li><strong>ARIA Landmark Roles:</strong> Proper semantic headings, banners, navigation, and live notification regions.</li>
        </ul>
      </div>
    </div>
  );
};

export const TermsPage: React.FC<StaticPageProps> = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
          <FileText className="w-3.5 h-3.5" />
          <span>Statutory Terms</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Terms of Use & Citizen Charter
        </h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Operational terms governing access to the Pramaan Sovereign Interoperability Gateway for citizens, state departments, and third-party verifiers.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs leading-relaxed text-slate-700">
        <h2 className="text-base font-bold text-slate-900">1. Authenticity of Proof Generation</h2>
        <p>
          Citizens using the Pramaan client-side cryptographic prover must generate proofs from genuine verifiable credentials issued by authorized sovereign registries. Any attempt to introduce counterfeit parameters or modify circuit constraints is detected by the verifier node and recorded in the audit log.
        </p>

        <h2 className="text-base font-bold text-slate-900 pt-3 border-t border-slate-100">2. Service Level Agreement (SLA) Commitments</h2>
        <p>
          Under the National Citizen Charter, participating ministries commit to adjudicating scheme applications within published SLA deadlines (e.g. 48 hours for PM-KISAN). The platform provides automated escalation to Nodal Directors in the event of SLA breach.
        </p>
      </div>
    </div>
  );
};
