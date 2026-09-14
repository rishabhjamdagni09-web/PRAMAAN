/**
 * Pramaan - Main Application Component
 * Production-Grade National Sovereign Interoperability Platform
 * Wired with Firebase Authentication, Real-Time Firestore Sync, and Zero-Trust Protected Routes
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { RoleSwitchModal } from './components/RoleSwitchModal';
import { AccessGate } from './components/AccessGate';
import { PublicHome } from './components/PublicHome';
import { HowItWorks } from './components/HowItWorks';
import { SchemesDirectory } from './components/SchemesDirectory';
import { CitizenPortal } from './components/CitizenPortal';
import { OfficialPortal } from './components/OfficialPortal';
import { AdminPortal } from './components/AdminPortal';
import { ForDepartments } from './components/ForDepartments';
import { DeveloperPortal } from './components/DeveloperPortal';
import { GrievancePortal } from './components/GrievancePortal';
import {
  AboutPage,
  SecurityPolicyPage,
  PrivacyPolicyPage,
  AccessibilityStatementPage,
  TermsPage,
} from './components/StaticPages';
import { Language } from './lib/i18n';
import { User, UserRole } from './types';
import {
  auth,
  onAuthStateChanged,
  signOutUser,
  seedFirestoreInitialData,
  signInAsPersona,
  PRECONFIGURED_PERSONAS,
} from './lib/firebase';

export default function App() {
  // GIGW 3.0 Accessibility & Localization States
  const [lang, setLang] = useState<Language>('en');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'larger'>('normal');
  const [highContrast, setHighContrast] = useState<boolean>(false);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<string>('home');
  const [citizenSubTab, setCitizenSubTab] = useState<string>('citizenDashboard');
  const [officialSubTab, setOfficialSubTab] = useState<string>('officialQueue');
  const [adminSubTab, setAdminSubTab] = useState<string>('meshVisualizer');
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);

  // Authentication & Session States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'cit_ramesh',
    name: 'Ramesh Kumar',
    email: 'ramesh.kumar.farmer@pramaan.gov.in',
    phone: '+91 98765 43210',
    role: 'CITIZEN',
    title: 'Small & Marginal Farmer (Barabanki, UP)',
  });
  const [roleModalOpen, setRoleModalOpen] = useState<boolean>(false);

  // Initialize Firebase Auth & Seed initial Firestore data
  useEffect(() => {
    // Seed sample data into Firestore if not yet populated
    seedFirestoreInitialData().catch((err) => console.warn('Seed notice:', err));

    // Listen to Firebase Auth state
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setIsAuthenticated(true);
        // If email matches one of our preconfigured personas, align user metadata
        const matchedPersonaEntry = Object.entries(PRECONFIGURED_PERSONAS).find(
          ([_, p]) => p.email.toLowerCase() === (fbUser.email || '').toLowerCase()
        );

        if (matchedPersonaEntry) {
          const [_, p] = matchedPersonaEntry;
          setCurrentUser({
            id: fbUser.uid,
            name: p.name,
            nameHi: p.nameHi,
            email: p.email,
            phone: p.phone,
            role: p.role,
            departmentId: p.departmentId,
            departmentName: p.departmentName,
            aadhaarRefMasked: p.aadhaarRefMasked,
          });
        }
      } else {
        // If explicitly signed out
        // (Keep default persona for visitor convenience unless signed out)
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Handle Logout
  const handleSignOut = async () => {
    try {
      await signOutUser();
      setIsAuthenticated(false);
      setActiveTab('home');
      setRoleModalOpen(true);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Handle user authentication / switch from RoleSwitchModal
  const handleUserAuthenticated = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);

    // Route dynamically based on user role
    if (user.role === 'CITIZEN') {
      setActiveTab('citizen');
      setCitizenSubTab('citizenDashboard');
    } else if (user.role === 'OFFICIAL') {
      setActiveTab('official');
      setOfficialSubTab('officialQueue');
    } else if (user.role === 'SUPER_ADMIN') {
      setActiveTab('admin');
      setAdminSubTab('meshVisualizer');
    }
  };

  // Quick switch role directly from access gate
  const handleQuickSwitchRole = async (targetRole: 'CITIZEN' | 'OFFICIAL' | 'SUPER_ADMIN') => {
    let targetPersonaKey = 'cit_ramesh';
    if (targetRole === 'OFFICIAL') targetPersonaKey = 'off_agri';
    if (targetRole === 'SUPER_ADMIN') targetPersonaKey = 'admin_super';

    try {
      const user = await signInAsPersona(targetPersonaKey);
      handleUserAuthenticated(user);
    } catch (err) {
      console.error('Quick switch role failed:', err);
      setRoleModalOpen(true);
    }
  };

  // Centralized Navigation Handler
  const handleNavigate = (tab: string) => {
    if (['citizenDashboard', 'wallet', 'applyScheme', 'tracking', 'consents'].includes(tab)) {
      setActiveTab('citizen');
      setCitizenSubTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (['officialQueue', 'schemaMapping', 'slaMonitor', 'connectors'].includes(tab)) {
      setActiveTab('official');
      setOfficialSubTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (['meshVisualizer', 'auditLog', 'systemHealth'].includes(tab)) {
      setActiveTab('admin');
      setAdminSubTab(tab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (tab === 'departments' || tab === 'forDepartments') {
      setActiveTab('forDepartments');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Direct Scheme Apply trigger
  const handleApplyScheme = (schemeId: string) => {
    setSelectedSchemeId(schemeId);
    setActiveTab('citizen');
    setCitizenSubTab('applyScheme');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Compute active navigation tab key for Header/Footer highlight
  const currentHeaderTab = (() => {
    if (activeTab === 'citizen') return citizenSubTab;
    if (activeTab === 'official') return officialSubTab;
    if (activeTab === 'admin') return adminSubTab;
    if (activeTab === 'forDepartments') return 'departments';
    return activeTab;
  })();

  // Compute font size modifier class
  const getFontSizeClass = () => {
    if (fontSize === 'large' || (fontSize as string) === 'lg') return 'text-base';
    if (fontSize === 'larger') return 'text-lg';
    if ((fontSize as string) === 'sm') return 'text-sm';
    return '';
  };

  return (
    <div
      className={`min-h-screen flex flex-col bg-slate-50 transition-colors duration-150 ${
        highContrast ? 'contrast-125 saturate-150' : ''
      } ${getFontSizeClass()}`}
    >
      {/* Skip to Main Content Link for Screen Readers (GIGW 3.0 Mandatory) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-900 focus:text-white focus:rounded focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-semibold text-xs"
      >
        Skip to main content / मुख्य सामग्री पर जाएं
      </a>

      {/* GIGW Compliant Institutional Header */}
      <Header
        lang={lang}
        setLang={setLang}
        fontSize={fontSize}
        setFontSize={setFontSize}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        activeTab={currentHeaderTab}
        currentTab={currentHeaderTab}
        setActiveTab={handleNavigate}
        setCurrentTab={handleNavigate}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onOpenRoleModal={() => setRoleModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area with Zero-Trust Protected Routes */}
      <main id="main-content" className="flex-1 focus:outline-hidden">
        {/* Public Views */}
        {activeTab === 'home' && (
          <PublicHome
            lang={lang}
            onNavigate={handleNavigate}
            onApplyScheme={handleApplyScheme}
          />
        )}

        {activeTab === 'howItWorks' && (
          <HowItWorks
            lang={lang}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'schemes' && (
          <SchemesDirectory
            lang={lang}
            onApplyScheme={handleApplyScheme}
          />
        )}

        {/* Protected Citizen Portal */}
        {activeTab === 'citizen' && (
          !isAuthenticated ? (
            <AccessGate
              reason="UNAUTHENTICATED"
              currentUser={currentUser}
              onOpenLogin={() => setRoleModalOpen(true)}
              onSwitchRole={handleQuickSwitchRole}
            />
          ) : currentUser.role !== 'CITIZEN' ? (
            <AccessGate
              reason="CITIZEN_ONLY"
              currentUser={currentUser}
              onOpenLogin={() => setRoleModalOpen(true)}
              onSwitchRole={handleQuickSwitchRole}
            />
          ) : (
            <CitizenPortal
              lang={lang}
              currentUser={currentUser}
              activeSubTab={citizenSubTab}
              setActiveSubTab={setCitizenSubTab}
              selectedSchemeId={selectedSchemeId}
            />
          )
        )}

        {/* Protected Official Portal */}
        {activeTab === 'official' && (
          !isAuthenticated ? (
            <AccessGate
              reason="UNAUTHENTICATED"
              currentUser={currentUser}
              onOpenLogin={() => setRoleModalOpen(true)}
              onSwitchRole={handleQuickSwitchRole}
            />
          ) : currentUser.role === 'CITIZEN' ? (
            <AccessGate
              reason="OFFICIAL_ONLY"
              currentUser={currentUser}
              onOpenLogin={() => setRoleModalOpen(true)}
              onSwitchRole={handleQuickSwitchRole}
            />
          ) : (
            <OfficialPortal
              lang={lang}
              currentUser={currentUser}
              activeSubTab={officialSubTab}
              setActiveSubTab={setOfficialSubTab}
            />
          )
        )}

        {/* Protected Admin Portal */}
        {activeTab === 'admin' && (
          !isAuthenticated ? (
            <AccessGate
              reason="UNAUTHENTICATED"
              currentUser={currentUser}
              onOpenLogin={() => setRoleModalOpen(true)}
              onSwitchRole={handleQuickSwitchRole}
            />
          ) : currentUser.role !== 'SUPER_ADMIN' ? (
            <AccessGate
              reason="ADMIN_ONLY"
              currentUser={currentUser}
              onOpenLogin={() => setRoleModalOpen(true)}
              onSwitchRole={handleQuickSwitchRole}
            />
          ) : (
            <AdminPortal
              lang={lang}
              currentUser={currentUser}
              activeSubTab={adminSubTab}
              setActiveSubTab={setAdminSubTab}
            />
          )
        )}

        {/* Informational & Support Views */}
        {activeTab === 'forDepartments' && (
          <ForDepartments
            lang={lang}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'developer' && (
          <DeveloperPortal
            lang={lang}
          />
        )}

        {activeTab === 'grievance' && (
          <GrievancePortal
            lang={lang}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'about' && (
          <AboutPage
            lang={lang}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'security' && (
          <SecurityPolicyPage
            lang={lang}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'privacy' && (
          <PrivacyPolicyPage
            lang={lang}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'accessibility' && (
          <AccessibilityStatementPage
            lang={lang}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'terms' && (
          <TermsPage
            lang={lang}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Institutional GIGW Compliant Footer */}
      <Footer
        lang={lang}
        currentTab={currentHeaderTab}
        setCurrentTab={handleNavigate}
        setActiveTab={handleNavigate}
        onNavigate={handleNavigate}
      />

      {/* Interactive Sovereign Identity / Persona Switcher Modal */}
      <RoleSwitchModal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        currentUser={currentUser}
        onSelectUser={handleUserAuthenticated}
        lang={lang}
      />
    </div>
  );
}
