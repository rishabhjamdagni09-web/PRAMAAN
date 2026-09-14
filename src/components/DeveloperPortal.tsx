/**
 * Pramaan - Developer & API Portal
 * OpenAPI 3.0 Explorer, API Key Management, and Live Interactive Sandbox Tester
 */

import React, { useState, useEffect } from 'react';
import {
  Code2,
  Key,
  Play,
  Copy,
  CheckCircle2,
  Terminal,
  FileText,
  Shield,
  Zap,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Language, translations } from '../lib/i18n';
import { ApiKey } from '../types';

interface DeveloperPortalProps {
  lang: Language;
}

export const DeveloperPortal: React.FC<DeveloperPortalProps> = ({ lang }) => {
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'sandbox' | 'docs' | 'keys' | 'sdks'>('sandbox');
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyModal, setNewKeyModal] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [keyTier, setKeyTier] = useState<'SANDBOX' | 'PRODUCTION_STAGING'>('SANDBOX');
  const [generatedKeySecret, setGeneratedKeySecret] = useState<string | null>(null);

  // Live Sandbox Tester State
  const [sandboxEndpoint, setSandboxEndpoint] = useState('/api/proofs/verify');
  const [requestMethod, setRequestMethod] = useState('POST');
  const [requestBody, setRequestBody] = useState(
    JSON.stringify(
      {
        proof: {
          id: 'prf_demo_01',
          schemeId: 'scheme_pmkisan',
          attribute: 'totalAreaHectares',
          operator: '<=',
          threshold: 2.0,
          commitment: '0x3a4b9c8d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
          nullifierHash: '0x8f2d9e11c34a9b671a5500e23ef890a82b4512e038d17b4c6e9a0123f458129a',
          signature: '0x7b1c4e92a0134f5592bcde1029384756',
          protocol: 'Groth16',
          createdAt: new Date().toISOString(),
        },
      },
      null,
      2
    )
  );

  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseData, setResponseData] = useState<any | null>(null);
  const [responseLatency, setResponseLatency] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/developer/keys')
      .then((res) => res.json())
      .then((data) => {
        if (data.keys) setKeys(data.keys);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleCreateKey = async () => {
    try {
      const res = await fetch('/api/developer/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: keyName || 'Department Gateway Sandbox Key',
          departmentCode: 'AGRI',
          tier: keyTier,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setKeys((prev) => [...prev, data.key]);
        setGeneratedKeySecret(data.generatedFullKey);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const executeSandboxCall = async () => {
    setIsExecuting(true);
    const start = performance.now();
    try {
      let bodyData = undefined;
      if (requestMethod === 'POST') {
        bodyData = JSON.parse(requestBody);
      }

      const res = await fetch(sandboxEndpoint, {
        method: requestMethod,
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer prm_sbx_live_test_token',
        },
        body: bodyData ? JSON.stringify(bodyData) : undefined,
      });

      const end = performance.now();
      setResponseLatency(Math.round(end - start));
      setResponseStatus(res.status);
      const data = await res.json();
      setResponseData(data);
    } catch (err: any) {
      setResponseStatus(500);
      setResponseData({ error: err.message || 'Request failed' });
    } finally {
      setIsExecuting(false);
    }
  };

  const copyCurl = () => {
    const curl = `curl -X ${requestMethod} https://pramaan.gov.in${sandboxEndpoint} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer prm_sbx_your_key_here" \\
  -d '${requestBody.replace(/\n/g, '')}'`;

    navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-2">
            <Code2 className="w-3.5 h-3.5" />
            <span>Open Interoperability API Gateway</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Developer Portal & API Sandbox
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Build zero-knowledge predicate verifiers and credential issuance pipelines into your departmental services.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setNewKeyModal(true)}
            className="px-4 py-2 bg-indigo-900 hover:bg-indigo-950 text-white rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate Sandbox API Key</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold space-x-6">
        <button
          onClick={() => setActiveTab('sandbox')}
          className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${activeTab === 'sandbox' ? 'border-indigo-600 text-indigo-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Interactive Sandbox</span>
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${activeTab === 'docs' ? 'border-indigo-600 text-indigo-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>OpenAPI 3.0 Specs</span>
        </button>
        <button
          onClick={() => setActiveTab('keys')}
          className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${activeTab === 'keys' ? 'border-indigo-600 text-indigo-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Department API Keys ({keys.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('sdks')}
          className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${activeTab === 'sdks' ? 'border-indigo-600 text-indigo-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>SDK Code Snippets</span>
        </button>
      </div>

      {/* Tab 1: Interactive Sandbox */}
      {activeTab === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Request Config */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                API Request Builder
              </span>
              <button
                onClick={copyCurl}
                className="text-[11px] text-indigo-700 hover:text-indigo-900 font-medium flex items-center space-x-1"
              >
                {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy cURL'}</span>
              </button>
            </div>

            {/* Endpoint Selector */}
            <div className="flex space-x-2">
              <select
                value={requestMethod}
                onChange={(e) => setRequestMethod(e.target.value)}
                className="bg-slate-100 border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-800 focus:outline-hidden"
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
              </select>

              <select
                value={sandboxEndpoint}
                onChange={(e) => {
                  setSandboxEndpoint(e.target.value);
                  if (e.target.value === '/api/schemes' || e.target.value === '/api/audit/verify') {
                    setRequestMethod('GET');
                  } else {
                    setRequestMethod('POST');
                  }
                }}
                className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-800 focus:outline-hidden"
              >
                <option value="/api/proofs/verify">/api/proofs/verify (Verify ZK Predicate)</option>
                <option value="/api/schemes">/api/schemes (List Welfare Schemes)</option>
                <option value="/api/audit/verify">/api/audit/verify (Verify Ledger Chain)</option>
                <option value="/api/connectors">/api/connectors (CDC Health)</option>
              </select>
            </div>

            {/* Request Body Editor */}
            {requestMethod === 'POST' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  JSON Request Payload
                </label>
                <textarea
                  rows={12}
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="w-full font-mono text-[11px] p-3 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            <button
              onClick={executeSandboxCall}
              disabled={isExecuting}
              className="w-full py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isExecuting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{isExecuting ? 'Transmitting to Verifier Node...' : 'Send Live Request'}</span>
            </button>
          </div>

          {/* Right: Response Inspector */}
          <div className="lg:col-span-6 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <span className="text-xs font-mono font-bold text-slate-400">RESPONSE VIEWER</span>
                {responseStatus !== null && (
                  <div className="flex items-center space-x-2 text-xs font-mono">
                    <span className={`px-2 py-0.5 rounded font-bold ${responseStatus === 200 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                      {responseStatus} OK
                    </span>
                    <span className="text-slate-400">{responseLatency}ms</span>
                  </div>
                )}
              </div>

              {responseData ? (
                <pre className="font-mono text-[11px] text-emerald-300 bg-slate-950 p-4 rounded-lg overflow-x-auto max-h-[400px] border border-slate-800">
                  {JSON.stringify(responseData, null, 2)}
                </pre>
              ) : (
                <div className="py-20 text-center text-slate-500 text-xs">
                  Click "Send Live Request" to dispatch a cryptographic payload through the gateway.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Security: TLS 1.3 + Ed25519 Signature</span>
              <span>Node: Sovereign-NIC-Edge-01</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: OpenAPI 3.0 Specs */}
      {activeTab === 'docs' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Pramaan Core API Specifications (OpenAPI 3.0)</h2>
              <p className="text-xs text-slate-500">Standardized REST endpoints for department interoperability</p>
            </div>
            <a
              href="/api/developer/openapi.json"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-900"
            >
              View Raw JSON
            </a>
          </div>

          <div className="space-y-4 text-xs">
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px] font-mono">
                  POST
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm">/api/proofs/verify</span>
              </div>
              <p className="text-slate-600 mb-2">
                Verifies a Groth16 zero-knowledge predicate proof submitted by a citizen device. Checks nullifier against double-claim registry and returns boolean validity.
              </p>
              <div className="text-[11px] text-slate-500 font-mono">Response: 200 OK {'{ isValid: boolean, claimSatisfied: boolean, verifierNode: string }'}</div>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px] font-mono">
                  POST
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm">/api/applications/apply</span>
              </div>
              <p className="text-slate-600 mb-2">
                Registers a citizen scheme application with cryptographic proof commitments and explicit DPDP consent. Generates a Single Application Number (SAN).
              </p>
              <div className="text-[11px] text-slate-500 font-mono">Response: 200 OK {'{ success: true, sanNumber: "SAN-2026-IND-XXXXXX" }'}</div>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[11px] font-mono">
                  GET
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm">/api/schemes</span>
              </div>
              <p className="text-slate-600 mb-2">
                Returns the directory of all published central and state government welfare schemes and their predicate rules.
              </p>
              <div className="text-[11px] text-slate-500 font-mono">Response: 200 OK {'{ schemes: Scheme[] }'}</div>
            </div>

            <div className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[11px] font-mono">
                  GET
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm">/api/audit/verify</span>
              </div>
              <p className="text-slate-600 mb-2">
                Performs a complete mathematical verification of the SHA-256 hash-chain across all recorded transactions.
              </p>
              <div className="text-[11px] text-slate-500 font-mono">Response: 200 OK {'{ chainValid: true, totalBlocksVerified: number }'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Department API Keys */}
      {activeTab === 'keys' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Provisioned Gateway Keys</h2>
              <p className="text-xs text-slate-500">Authorized keys for department integration testing</p>
            </div>
            <button
              onClick={() => setNewKeyModal(true)}
              className="px-3 py-1.5 bg-indigo-900 text-white rounded-lg text-xs font-semibold"
            >
              + Create New Key
            </button>
          </div>

          <div className="space-y-3">
            {keys.map((key) => (
              <div key={key.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{key.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800">
                      {key.tier}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">
                      Dept: {key.departmentCode}
                    </span>
                  </div>
                  <div className="font-mono text-slate-600 text-[11px] mt-1">
                    {key.secretMasked}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Created: {new Date(key.createdAt).toLocaleDateString()} • Rate limit: {key.rateLimitPerMin} req/min
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-700">ACTIVE</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: SDK Snippets */}
      {activeTab === 'sdks' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Quick Integration Libraries</h2>
          <p className="text-xs text-slate-500">Zero-knowledge proof verification client implementations</p>

          <div className="space-y-4">
            <div>
              <div className="text-xs font-bold text-slate-800 mb-1">TypeScript / Node.js</div>
              <pre className="bg-slate-950 text-emerald-400 p-4 rounded-lg text-xs font-mono overflow-x-auto">
{`import { PramaanClient } from '@pramaan/gov-sdk';

const client = new PramaanClient({
  apiKey: process.env.PRAMAAN_API_KEY,
  environment: 'sandbox'
});

// Verify citizen's land ownership proof without seeing their deed
const verification = await client.proofs.verify({
  proof: citizenProofPacket
});

if (verification.isValid && verification.claimSatisfied) {
  console.log('Applicant meets scheme threshold!');
}`}
              </pre>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-800 mb-1">Python (FastAPI / Django)</div>
              <pre className="bg-slate-950 text-indigo-300 p-4 rounded-lg text-xs font-mono overflow-x-auto">
{`from pramaan import PramaanGateway

gateway = PramaanGateway(api_key="prm_sbx_...")

# Instant ZK predicate check
result = gateway.verify_predicate_proof(proof_payload)
assert result.is_valid is True`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* New Key Modal */}
      {newKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-2">Create Gateway API Key</h3>
            <p className="text-xs text-slate-500 mb-4">Generate credentials for your department's staging environment.</p>

            {generatedKeySecret ? (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-950">
                  <div className="font-bold mb-1">API Key Generated! Copy it now:</div>
                  <div className="font-mono bg-white p-2 rounded border border-emerald-300 break-all text-[11px] select-all">
                    {generatedKeySecret}
                  </div>
                  <div className="text-[10px] text-emerald-700 mt-1">This key will not be shown again.</div>
                </div>
                <button
                  onClick={() => {
                    setGeneratedKeySecret(null);
                    setNewKeyModal(false);
                  }}
                  className="w-full py-2 bg-indigo-900 text-white rounded-lg text-xs font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Key Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Agri-Portal Verification Service"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Environment Tier</label>
                  <select
                    value={keyTier}
                    onChange={(e: any) => setKeyTier(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
                  >
                    <option value="SANDBOX">Sandbox (120 req/min)</option>
                    <option value="PRODUCTION_STAGING">Production Staging (600 req/min)</option>
                  </select>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => setNewKeyModal(false)}
                    className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateKey}
                    className="flex-1 py-2 bg-indigo-900 text-white rounded-lg font-bold"
                  >
                    Generate Key
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
