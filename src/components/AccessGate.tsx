/**
 * Pramaan - Institutional Access Gate Component
 * Real Protected Route boundary enforcing DPDP Act 2023 & GIGW Zero-Trust Access Control
 */

import React from 'react';
import { ShieldAlert, Lock, UserCheck, ArrowRight, Building2, User } from 'lucide-react';
import { User as UserType } from '../types';

interface AccessGateProps {
  reason: 'UNAUTHENTICATED' | 'CITIZEN_ONLY' | 'OFFICIAL_ONLY' | 'ADMIN_ONLY';
  currentUser?: UserType | null;
  onOpenLogin: () => void;
  onSwitchRole?: (role: 'CITIZEN' | 'OFFICIAL' | 'SUPER_ADMIN') => void;
}

export const AccessGate: React.FC<AccessGateProps> = ({
  reason,
  currentUser,
  onOpenLogin,
  onSwitchRole,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-8 md:p-12 relative overflow-hidden">
        {/* Institutional Header Banner */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 mb-6 shadow-xs">
          {reason === 'UNAUTHENTICATED' ? (
            <Lock className="w-8 h-8" />
          ) : (
            <ShieldAlert className="w-8 h-8 text-amber-700" />
          )}
        </div>

        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold mb-3">
          <span className="w-2 h-2 rounded-full bg-amber-600"></span>
          <span>DPDP Act 2023 § Section 4 Protected Perimeter</span>
        </div>

        {reason === 'UNAUTHENTICATED' && (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Institutional Authentication Required
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto mb-8 leading-relaxed">
              Access to this sovereign terminal requires an authenticated session. Please sign in using your
              verified Citizen Phone/OTP, Department Email credentials, or select a pre-configured sovereign persona.
            </p>
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center space-x-2 bg-indigo-900 hover:bg-indigo-800 text-white font-semibold text-sm px-6 py-3 rounded-lg shadow-xs transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              <span>Open Sovereign Identity Gateway</span>
            </button>
          </>
        )}

        {reason === 'CITIZEN_ONLY' && (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Citizen Sovereign Vault Restricted
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto mb-6 leading-relaxed">
              Your active session is logged in as{' '}
              <strong className="text-slate-900">
                {currentUser?.name} ({currentUser?.role})
              </strong>
              . Personal identity wallets, cryptographic credential vaults, and DPDP consent centers are
              strictly reserved for Citizen identities.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onSwitchRole?.('CITIZEN')}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-xs transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Switch to Citizen Persona (Ramesh Kumar)</span>
              </button>
              <button
                onClick={onOpenLogin}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm px-5 py-2.5 rounded-lg border border-slate-300 transition-colors"
              >
                <span>Other Sign-In Options</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </>
        )}

        {reason === 'OFFICIAL_ONLY' && (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Department Verification Terminal Restricted
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto mb-6 leading-relaxed">
              Your active session is logged in as{' '}
              <strong className="text-slate-900">
                {currentUser?.name} ({currentUser?.role})
              </strong>
              . Scheme verification queues, SLA escalation consoles, and AI Schema Mapping tools are
              restricted to authorized Department Officials and Administrators.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onSwitchRole?.('OFFICIAL')}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-xs transition-colors"
              >
                <Building2 className="w-4 h-4" />
                <span>Switch to Official Persona (Rajesh Verma)</span>
              </button>
              <button
                onClick={onOpenLogin}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm px-5 py-2.5 rounded-lg border border-slate-300 transition-colors"
              >
                <span>Other Sign-In Options</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </>
        )}

        {reason === 'ADMIN_ONLY' && (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Super Administrator Console Restricted
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto mb-6 leading-relaxed">
              Your active session is logged in as{' '}
              <strong className="text-slate-900">
                {currentUser?.name} ({currentUser?.role})
              </strong>
              . The National Sovereign Interoperability Mesh, SHA-256 Ledger verifier, and Prometheus
              observability grid require SUPER_ADMIN authority.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onSwitchRole?.('SUPER_ADMIN')}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-xs transition-colors"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Switch to Super Admin (Dr. Arvind Narayanan)</span>
              </button>
              <button
                onClick={onOpenLogin}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm px-5 py-2.5 rounded-lg border border-slate-300 transition-colors"
              >
                <span>Other Sign-In Options</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
