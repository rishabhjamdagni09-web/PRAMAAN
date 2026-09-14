/**
 * Pramaan - Government Standard Footer
 * Institutional trust signals, GIGW 3.0 & DPDP Act 2023 compliance
 */

import React from 'react';
import { Shield, Lock, FileCheck, CheckCircle2, ExternalLink } from 'lucide-react';
import { Language, translations } from '../lib/i18n';

interface FooterProps {
  lang: Language;
  currentTab?: string;
  setCurrentTab?: (tab: string) => void;
  setActiveTab?: (tab: string) => void;
  onNavigate?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  setCurrentTab,
  setActiveTab,
  onNavigate,
}) => {
  const t = translations[lang];

  const handleNavigate = (tab: string) => {
    if (typeof setCurrentTab === 'function') {
      setCurrentTab(tab);
    } else if (typeof setActiveTab === 'function') {
      setActiveTab(tab);
    } else if (typeof onNavigate === 'function') {
      onNavigate(tab);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t-4 border-indigo-900 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-8 mb-8 border-b border-slate-800 text-slate-400">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-white text-sm">Zero Raw PII Storage</div>
              <p className="text-[11px] mt-0.5">Recipient departments receive mathematically unforgeable boolean proofs, never citizen database records.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-white text-sm">DPDP Act 2023 Section 6(4)</div>
              <p className="text-[11px] mt-0.5">Absolute citizen right to review, audit, and revoke data verification consent grants at any moment.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800 shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-white text-sm">SHA-256 Hash Chained</div>
              <p className="text-[11px] mt-0.5">Immutable sovereign audit log mathematically anchored to prevent retroactive administrative tampering.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-white text-sm">GIGW 3.0 & WCAG 2.1 AA</div>
              <p className="text-[11px] mt-0.5">Certified accessible for screen readers, bilingual typography (English & हिन्दी), and keyboard navigability.</p>
            </div>
          </div>
        </div>

        {/* Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="text-white font-semibold mb-3 tracking-wide uppercase text-[11px]">
              Platform Services
            </div>
            <ul className="space-y-2">
              <li>
                <button onClick={() => handleNavigate('schemes')} className="hover:text-white transition-colors cursor-pointer">
                  Schemes & Services Directory
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('howItWorks')} className="hover:text-white transition-colors cursor-pointer">
                  How ZK Proofs Work
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('departments')} className="hover:text-white transition-colors cursor-pointer">
                  Department Onboarding & CDC
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('tracking')} className="hover:text-white transition-colors cursor-pointer">
                  Unified SAN Tracking
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-white font-semibold mb-3 tracking-wide uppercase text-[11px]">
              Developers & Integration
            </div>
            <ul className="space-y-2">
              <li>
                <button onClick={() => handleNavigate('developer')} className="hover:text-white transition-colors cursor-pointer">
                  OpenAPI 3.0 Gateway Docs
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('developer')} className="hover:text-white transition-colors cursor-pointer">
                  Sandbox Key Generator
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('developer')} className="hover:text-white transition-colors cursor-pointer">
                  ZK Verification SDK Specs
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('meshVisualizer')} className="hover:text-white transition-colors cursor-pointer">
                  Mesh Topology Visualizer
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-white font-semibold mb-3 tracking-wide uppercase text-[11px]">
              Governance & Citizens
            </div>
            <ul className="space-y-2">
              <li>
                <button onClick={() => handleNavigate('grievance')} className="hover:text-white transition-colors cursor-pointer">
                  Public Grievance Redressal
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('consents')} className="hover:text-white transition-colors cursor-pointer">
                  DPDP Consent Center
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('auditLog')} className="hover:text-white transition-colors cursor-pointer">
                  Tamper-Evident Audit Ledger
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('systemHealth')} className="hover:text-white transition-colors cursor-pointer">
                  System Health & SLA Telemetry
                </button>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-white font-semibold mb-3 tracking-wide uppercase text-[11px]">
              Statutory & Compliance
            </div>
            <ul className="space-y-2">
              <li>
                <button onClick={() => handleNavigate('privacy')} className="hover:text-white transition-colors cursor-pointer">
                  Privacy Policy (DPDP Act)
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('terms')} className="hover:text-white transition-colors cursor-pointer">
                  Terms of Use & Fair Access
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('accessibility')} className="hover:text-white transition-colors cursor-pointer">
                  Accessibility Statement (GIGW)
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigate('security')} className="hover:text-white transition-colors cursor-pointer">
                  Security Posture & Threat Model
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Sovereign Disclaimer & Footer Bottom */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-slate-500 text-[11px] gap-4">
          <div className="flex items-center space-x-3">
            <div className="font-bold text-slate-400">प्रमाण • PRAMAAN</div>
            <span>|</span>
            <span>National Zero-Knowledge Interoperability Platform</span>
            <span>|</span>
            <span>Ministry of Electronics and Information Technology (MeitY)</span>
          </div>
          <div>
            © {new Date().getFullYear()} Government of India. Designed in compliance with GIGW 3.0 & Digital Personal Data Protection Act 2023.
          </div>
        </div>
      </div>
    </footer>
  );
};
