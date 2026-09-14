/**
 * Pramaan - Government Standard Header (GIGW 3.0 & WCAG 2.1 AA Compliant)
 */

import React from 'react';
import {
  Shield,
  Globe,
  User as UserIcon,
  ChevronDown,
  Layers,
  FileCheck,
  Building2,
  Code2,
  HelpCircle,
  Eye,
  SlidersHorizontal,
  LogOut,
} from 'lucide-react';
import { Language, translations } from '../lib/i18n';
import { User, UserRole } from '../types';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
  fontSize: string;
  setFontSize: (size: any) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  currentUser: User;
  onOpenRoleModal: () => void;
  currentTab?: string;
  activeTab?: string;
  setCurrentTab?: (tab: string) => void;
  setActiveTab?: (tab: string) => void;
  onNavigate?: (tab: string) => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  setLang,
  fontSize,
  setFontSize,
  highContrast,
  setHighContrast,
  currentUser,
  onOpenRoleModal,
  currentTab,
  activeTab,
  setCurrentTab,
  setActiveTab,
  onNavigate,
  onSignOut,
}) => {
  const t = translations[lang];
  const activeKey = currentTab || activeTab || 'home';

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
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* 1. Indian Government Sovereign Top Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
         
          <span className="font-medium tracking-wide text-slate-300">
            {t.govHeader}
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-400 font-mono text-[11px]">
          </span>
        </div>

        {/* Accessibility & Language Controls */}
        <div className="flex items-center space-x-3 mt-1 sm:mt-0">
          {/* Skip link for screen readers */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:bg-indigo-600 focus:text-white focus:px-2 focus:py-1 focus:rounded text-xs"
          >
            {t.skipToContent}
          </a>

          {/* Font Size Adjusters */}
          <div className="flex items-center space-x-1 border border-slate-700 rounded-sm px-1 py-0.5 bg-slate-800/50">
            <button
              onClick={() => setFontSize('sm')}
              title="Decrease Font Size"
              aria-label="Decrease Font Size"
              className={`px-1.5 py-0.5 text-[11px] rounded ${fontSize === 'sm' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('base')}
              title="Reset Font Size"
              aria-label="Reset Font Size"
              className={`px-1.5 py-0.5 text-[11px] rounded ${fontSize === 'base' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              title="Increase Font Size"
              aria-label="Increase Font Size"
              className={`px-1.5 py-0.5 text-[11px] rounded ${fontSize === 'lg' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
            >
              A+
            </button>
          </div>

          {/* High Contrast Toggle */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            title="Toggle High Contrast Mode"
            aria-label="Toggle High Contrast Mode"
            className={`flex items-center space-x-1 px-2 py-0.5 text-[11px] rounded border ${highContrast ? 'bg-amber-400 text-black border-amber-300 font-bold' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'}`}
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">{highContrast ? t.lightMode : t.highContrast}</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center border border-slate-700 rounded-sm overflow-hidden text-[11px]">
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-0.5 ${lang === 'en' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:text-white'}`}
            >
              English
            </button>
            <button
              onClick={() => setLang('hi')}
              className={`px-2 py-0.5 font-devanagari ${lang === 'hi' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:text-white'}`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Branding & Role Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Brand & Emblem */}
        <div
          onClick={() => handleNavigate('home')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-900 to-blue-950 flex items-center justify-center text-white shadow-sm ring-2 ring-indigo-500/20 group-hover:ring-indigo-500/40 transition-all">
            <Shield className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-indigo-900 transition-colors">
                {t.brandName}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Action Controls & Active Role Switcher */}
        <div className="flex items-center space-x-2.5">
          {/* Persona / Role Selector Badge */}
          <button
            onClick={onOpenRoleModal}
            className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-md text-xs font-medium border border-slate-300 transition-colors"
            title="Switch Persona: Citizen, Official, or Admin"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <UserIcon className="w-3.5 h-3.5 text-slate-600" />
            <div className="text-left hidden sm:block">
              <div className="text-[10px] text-slate-500 leading-none">Active Persona</div>
              <div className="font-semibold text-slate-900">{currentUser.name} ({currentUser.role})</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {onSignOut && (
            <button
              onClick={onSignOut}
              className="flex items-center space-x-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-slate-700 px-2.5 py-1.5 rounded-md text-xs font-medium border border-slate-300 transition-colors"
              title="Sign Out of Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Navigation Links Row */}
      <nav className="bg-slate-100/90 border-t border-slate-200 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-1 py-1 text-xs">
          {/* Public Views */}
          <button
            onClick={() => handleNavigate('home')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${activeKey === 'home' ? 'bg-indigo-900 text-white' : 'text-slate-700 hover:bg-slate-200'}`}
          >
            {t.nav.home}
          </button>
          <button
            onClick={() => handleNavigate('howItWorks')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${activeKey === 'howItWorks' ? 'bg-indigo-900 text-white' : 'text-slate-700 hover:bg-slate-200'}`}
          >
            {t.nav.howItWorks}
          </button>
          <button
            onClick={() => handleNavigate('schemes')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${activeKey === 'schemes' ? 'bg-indigo-900 text-white' : 'text-slate-700 hover:bg-slate-200'}`}
          >
            {t.nav.schemes}
          </button>
          <button
            onClick={() => handleNavigate('departments')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${activeKey === 'departments' || activeKey === 'forDepartments' ? 'bg-indigo-900 text-white' : 'text-slate-700 hover:bg-slate-200'}`}
          >
            {t.nav.forDepartments}
          </button>
          <button
            onClick={() => handleNavigate('developer')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${activeKey === 'developer' ? 'bg-indigo-900 text-white' : 'text-slate-700 hover:bg-slate-200'}`}
          >
            {t.nav.developerPortal}
          </button>
          <button
            onClick={() => handleNavigate('grievance')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${activeKey === 'grievance' ? 'bg-indigo-900 text-white' : 'text-slate-700 hover:bg-slate-200'}`}
          >
            {t.nav.grievance}
          </button>

          <span className="text-slate-300 px-1">|</span>

          {/* Portal Tabs depending on role */}
          {currentUser.role === 'CITIZEN' && (
            <>
              <button
                onClick={() => handleNavigate('citizenDashboard')}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${activeKey === 'citizenDashboard' || activeKey === 'citizen' ? 'bg-blue-700 text-white' : 'text-blue-900 hover:bg-blue-50 font-semibold'}`}
              >
                {t.nav.citizenDashboard}
              </button>
              <button
                onClick={() => handleNavigate('wallet')}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${activeKey === 'wallet' ? 'bg-blue-700 text-white' : 'text-blue-900 hover:bg-blue-50'}`}
              >
                {t.nav.wallet}
              </button>
              <button
                onClick={() => handleNavigate('applyScheme')}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${activeKey === 'applyScheme' ? 'bg-emerald-700 text-white' : 'text-emerald-800 hover:bg-emerald-50 font-semibold'}`}
              >
                {t.nav.applyScheme}
              </button>
              <button
                onClick={() => handleNavigate('tracking')}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${activeKey === 'tracking' ? 'bg-blue-700 text-white' : 'text-blue-900 hover:bg-blue-50'}`}
              >
                {t.nav.tracking}
              </button>
              <button
                onClick={() => handleNavigate('consents')}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${activeKey === 'consents' ? 'bg-blue-700 text-white' : 'text-blue-900 hover:bg-blue-50'}`}
              >
                {t.nav.consents}
              </button>
            </>
          )}

          {currentUser.role === 'OFFICIAL' && (
            <>
              <button
                onClick={() => handleNavigate('officialQueue')}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${activeKey === 'officialQueue' || activeKey === 'official' ? 'bg-amber-800 text-white' : 'text-amber-900 hover:bg-amber-50 font-semibold'}`}
              >
                {t.nav.officialQueue}
              </button>
              <button
                onClick={() => handleNavigate('schemaMapping')}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${activeKey === 'schemaMapping' ? 'bg-indigo-700 text-white' : 'text-indigo-900 hover:bg-indigo-50 font-semibold'}`}
              >
                {t.nav.schemaMapping} (Gemini AI)
              </button>
              <button
                onClick={() => handleNavigate('slaMonitor')}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${activeKey === 'slaMonitor' ? 'bg-amber-800 text-white' : 'text-amber-900 hover:bg-amber-50'}`}
              >
                {t.nav.slaMonitor}
              </button>
              <button
                onClick={() => handleNavigate('connectors')}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${activeKey === 'connectors' ? 'bg-amber-800 text-white' : 'text-amber-900 hover:bg-amber-50'}`}
              >
                {t.nav.connectors}
              </button>
            </>
          )}

          {currentUser.role === 'SUPER_ADMIN' && (
            <>
              <button
                onClick={() => handleNavigate('meshVisualizer')}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${activeKey === 'meshVisualizer' || activeKey === 'admin' ? 'bg-purple-800 text-white' : 'text-purple-900 hover:bg-purple-50 font-semibold'}`}
              >
                {t.nav.meshVisualizer}
              </button>
              <button
                onClick={() => handleNavigate('auditLog')}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${activeKey === 'auditLog' ? 'bg-purple-800 text-white' : 'text-purple-900 hover:bg-purple-50 font-semibold'}`}
              >
                {t.nav.auditLog}
              </button>
              <button
                onClick={() => handleNavigate('systemHealth')}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${activeKey === 'systemHealth' ? 'bg-purple-800 text-white' : 'text-purple-900 hover:bg-purple-50'}`}
              >
                {t.nav.systemHealth}
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
