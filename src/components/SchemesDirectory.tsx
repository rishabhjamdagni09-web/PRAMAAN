/**
 * Pramaan - Schemes & Public Services Directory
 * Real-time eligibility evaluation with zero-knowledge predicate satisfaction
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  ArrowRight,
  Shield,
  Filter,
  Check,
  Building2,
  Sparkles,
} from 'lucide-react';
import { Language, translations } from '../lib/i18n';
import { Scheme, User } from '../types';

interface SchemesDirectoryProps {
  lang: Language;
  currentUser: User;
  onApplyForScheme: (schemeId: string) => void;
}

export const SchemesDirectory: React.FC<SchemesDirectoryProps> = ({
  lang,
  currentUser,
  onApplyForScheme,
}) => {
  const t = translations[lang];
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [eligibilityMap, setEligibilityMap] = useState<
    Record<
      string,
      {
        isFullyEligible: boolean;
        predicateResults: Array<{
          requirementId: string;
          attribute: string;
          attributeName: string;
          thresholdDisplay: string;
          satisfied: boolean;
          matchingCredTitle: string;
        }>;
      }
    >
  >({});
  const [checkingId, setCheckingId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/schemes')
      .then((res) => res.json())
      .then((data) => {
        if (data.schemes) {
          setSchemes(data.schemes);
        }
      })
      .catch((err) => console.error('Error fetching schemes:', err));
  }, []);

  const checkEligibility = async (schemeId: string) => {
    setCheckingId(schemeId);
    try {
      const res = await fetch(`/api/schemes/${schemeId}/check-eligibility`);
      const data = await res.json();
      setEligibilityMap((prev) => ({
        ...prev,
        [schemeId]: data,
      }));
    } catch (err) {
      console.error('Error checking eligibility:', err);
    } finally {
      setCheckingId(null);
    }
  };

  const filteredSchemes = schemes.filter((s) => {
    const matchesCategory = selectedCategory === 'ALL' || s.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      s.title.toLowerCase().includes(query) ||
      s.titleHi.includes(query) ||
      s.departmentName.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'FARMERS', label: 'Farmers & Agriculture' },
    { id: 'STUDENTS', label: 'Students & Education' },
    { id: 'HEALTHCARE', label: 'Healthcare & Wellness' },
    { id: 'HOUSING', label: 'Housing & Rural' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-2">
          <Building2 className="w-3.5 h-3.5" />
          <span>National Welfare & Direct Benefit Directory</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          {t.schemes.title}
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-2xl">
          {t.schemes.subtitle}
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.schemes.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${selectedCategory === cat.id ? 'bg-indigo-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSchemes.map((scheme) => {
          const elig = eligibilityMap[scheme.id];
          const isChecking = checkingId === scheme.id;

          return (
            <div
              key={scheme.id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top badges */}
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="px-2.5 py-1 rounded-md font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                    {scheme.departmentName}
                  </span>
                  <div className="flex items-center space-x-1 text-slate-500 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>SLA: {scheme.slaHours}h guarantee</span>
                  </div>
                </div>

                {/* Scheme Title */}
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {lang === 'hi' && scheme.titleHi ? scheme.titleHi : scheme.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {lang === 'hi' && scheme.descriptionHi ? scheme.descriptionHi : scheme.description}
                </p>

                {/* Direct Benefit Amount */}
                <div className="mt-4 p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-indigo-900 uppercase tracking-wider block">
                      {t.schemes.benefit}
                    </span>
                    <span className="text-sm font-black text-indigo-950 font-mono">
                      {scheme.benefitAmount}
                    </span>
                  </div>
                  <span className="text-[10px] text-indigo-700 font-medium bg-white px-2 py-0.5 rounded border border-indigo-200">
                    Direct Benefit Transfer (DBT)
                  </span>
                </div>

                {/* Requirements / Predicates List */}
                <div className="mt-4">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    {t.schemes.requirements}
                  </div>
                  <div className="space-y-1.5">
                    {scheme.requirements.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between text-xs p-2 rounded-md bg-slate-50 border border-slate-100"
                      >
                        <div className="flex items-center space-x-2">
                          <Shield className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="text-slate-700 font-medium">
                            {lang === 'hi' && req.attributeNameHi ? req.attributeNameHi : req.attributeName}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-slate-900 text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200">
                          {req.thresholdDisplay}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Real-Time Eligibility Result if evaluated */}
                {elig && (
                  <div className="mt-4 p-3 rounded-lg border text-xs animate-in fade-in duration-150">
                    <div className="flex items-center space-x-2 mb-2">
                      {elig.isFullyEligible ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold text-emerald-800">
                            {t.schemes.eligibleBadge} ({currentUser.name})
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span className="font-bold text-rose-800">
                            {t.schemes.notEligibleBadge} ({currentUser.name})
                          </span>
                        </>
                      )}
                    </div>
                    <div className="space-y-1 text-[11px]">
                      {elig.predicateResults.map((pr) => (
                        <div key={pr.requirementId} className="flex items-center justify-between text-slate-600">
                          <span>{pr.attributeName}:</span>
                          <span className={pr.satisfied ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                            {pr.satisfied ? '✓ Satisfied' : '✕ Not Met / Missing'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => checkEligibility(scheme.id)}
                  disabled={isChecking}
                  className="flex-1 py-2 px-3 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isChecking ? 'Evaluating...' : t.schemes.checkEligibility}</span>
                </button>

                <button
                  onClick={() => onApplyForScheme(scheme.id)}
                  className="flex-1 py-2 px-3 bg-indigo-900 hover:bg-indigo-950 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 shadow-2xs"
                >
                  <span>{t.schemes.applyNow}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
