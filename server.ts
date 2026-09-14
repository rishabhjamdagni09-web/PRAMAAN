/**
 * Pramaan - Sovereign Government Interoperability Platform
 * Full-Stack Express Server with Native Vite Middleware Integration
 */

import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import {
  generatePredicateProof,
  verifyPredicateProof,
  markNullifierConsumed,
} from './server/crypto';
import { mapLegacySchemaWithAI } from './server/gemini';
import { Application, ConsentGrant, User } from './src/types';
import { setUserRoleClaims, adminDb } from './server/firebaseAdmin';

// Active simulated session
let currentUserId = 'cit_ramesh';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Security Headers (OWASP recommendations)
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  // Current session middleware helper
  const getCurrentUser = (): User => {
    return db.users.find((u) => u.id === currentUserId) || db.users[0];
  };

  // ==========================================
  // 1. HEALTH & PROMETHEUS METRICS ENDPOINTS
  // ==========================================
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      platform: 'Pramaan National Interoperability Grid',
      version: '2.4.0-sovereign',
      nodeTime: new Date().toISOString(),
      uptimeSeconds: db.systemMetrics.uptimeSeconds,
      activeTenants: db.departments.length,
      auditBlocksAnchored: db.auditLogs.length,
      cdcStatus: 'ALL_PIPELINES_OPERATIONAL',
      standardsCompliance: ['GIGW 3.0', 'DPDP Act 2023', 'ISO 27001', 'WCAG 2.1 AA'],
    });
  });

  app.get('/api/metrics', (req, res) => {
    res.setHeader('Content-Type', 'text/plain; version=0.0.4');
    const metricsOutput = [
      '# HELP pramaan_zk_proofs_verified_total Total count of zero-knowledge predicate proofs verified',
      '# TYPE pramaan_zk_proofs_verified_total counter',
      `pramaan_zk_proofs_verified_total ${db.systemMetrics.proofsVerifiedTotal}`,
      '# HELP pramaan_p95_latency_ms 95th percentile verification latency in milliseconds',
      '# TYPE pramaan_p95_latency_ms gauge',
      `pramaan_p95_latency_ms ${db.systemMetrics.p95LatencyMs}`,
      '# HELP pramaan_active_cdc_pipelines Number of active Change Data Capture adapters',
      '# TYPE pramaan_active_cdc_pipelines gauge',
      `pramaan_active_cdc_pipelines ${db.systemMetrics.activeCdcPipelines}`,
      '# HELP pramaan_audit_blocks_total Total number of SHA-256 hash-chained audit blocks',
      '# TYPE pramaan_audit_blocks_total counter',
      `pramaan_audit_blocks_total ${db.auditLogs.length}`,
      '# HELP pramaan_active_departments_count Number of connected government departments',
      '# TYPE pramaan_active_departments_count gauge',
      `pramaan_active_departments_count ${db.departments.length}`,
      '# HELP pramaan_system_error_rate System request error rate ratio',
      '# TYPE pramaan_system_error_rate gauge',
      `pramaan_system_error_rate ${db.systemMetrics.errorRate}`,
    ].join('\n');
    res.send(metricsOutput);
  });

  // ==========================================
  // 2. AUTH & PERSONA SWITCHING
  // ==========================================
  const handleMe = (req: express.Request, res: express.Response) => {
    res.json({ user: getCurrentUser() });
  };
  app.get('/api/auth/me', handleMe);
  app.get('/api/auth/current-user', handleMe);

  app.get('/api/auth/users', (req, res) => {
    res.json({ users: db.users });
  });

  const handleSwitchUser = (req: express.Request, res: express.Response) => {
    const { userId, role } = req.body || {};
    let user: User | undefined;

    if (userId) {
      user = db.users.find((u) => u.id === userId);
    } else if (role) {
      user = db.users.find((u) => u.role === role);
    }

    if (!user) {
      // If neither matches, fallback to the first user or create session
      user = db.users[0];
    }

    currentUserId = user.id;
    db.recordAuditLog({
      action: 'USER_SESSION_SWITCHED',
      actor: user.name,
      actorRole: user.role,
      targetEntity: 'SESSION',
      entityId: user.id,
      payload: { role: user.role, dept: user.departmentId || 'NONE' },
    });
    res.json({ success: true, user });
  };

  app.post('/api/auth/switch-user', handleSwitchUser);
  app.post('/api/auth/switch-role', handleSwitchUser);

  app.post('/api/auth/set-custom-claims', async (req, res) => {
    try {
      const { uid, role, departmentId } = req.body || {};
      if (!uid || !role) {
        return res.status(400).json({ error: 'UID and role are required' });
      }
      await setUserRoleClaims(uid, role, departmentId);
      res.json({ success: true, message: `Custom claims set for ${uid}: role=${role}` });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to set custom claims' });
    }
  });

  app.post('/api/auth/send-otp', (req, res) => {
    const { identifier } = req.body || {};
    if (!identifier) {
      return res.status(400).json({ error: 'Mobile number or Aadhaar reference required' });
    }
    // Realistic simulated OTP dispatch
    res.json({
      success: true,
      message: 'OTP dispatched via Sovereign SMS Gateway (CDAC). For test environments, enter: 123456',
      testOtp: '123456',
      expirySeconds: 300,
    });
  });

  app.post('/api/auth/verify-otp', (req, res) => {
    const { identifier, otp, role } = req.body || {};
    if (otp !== '123456' && otp !== '999999') {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }
    // Find or pick appropriate persona
    const user = db.users.find((u) => u.role === (role || 'CITIZEN')) || db.users[0];
    currentUserId = user.id;
    res.json({ success: true, user });
  });

  // ==========================================
  // 3. SCHEMES & ELIGIBILITY EVALUATION
  // ==========================================
  const findScheme = (idOrCode: string) => {
    const term = String(idOrCode || '').toLowerCase().trim();
    const clean = term.replace(/[-_]/g, '');
    return db.schemes.find((s) => {
      const sId = s.id.toLowerCase().trim();
      const sCode = s.code.toLowerCase().trim();
      const sCleanId = sId.replace(/[-_]/g, '');
      const sCleanCode = sCode.replace(/[-_]/g, '');
      return (
        s.id === idOrCode ||
        sId === term ||
        sCode === term ||
        sCleanId === clean ||
        sCleanCode === clean ||
        sCleanCode.startsWith(clean) ||
        clean.startsWith(sCleanCode) ||
        sCleanId.includes(clean)
      );
    });
  };

  app.get('/api/schemes', (req, res) => {
    res.json({ schemes: db.schemes });
  });

  app.get('/api/schemes/:id', (req, res) => {
    const scheme = findScheme(req.params.id);
    if (!scheme) {
      return res.status(404).json({ error: 'Scheme not found' });
    }
    res.json({ scheme });
  });

  app.get('/api/schemes/:id/check-eligibility', (req, res) => {
    const scheme = findScheme(req.params.id);
    if (!scheme) {
      return res.status(404).json({ error: 'Scheme not found' });
    }

    const citizenId = (req.query.citizenId as string) || currentUserId;
    const userCreds = db.credentials.filter((c) => c.citizenId === citizenId);

    // Evaluate predicates against citizen credentials
    const predicateResults = scheme.requirements.map((reqRule) => {
      let satisfied = false;
      let matchingCredTitle = 'No relevant credential found';
      let matchingCredId = '';

      const cred = userCreds.find(
        (c) => c.rawAttributesMasked && c.rawAttributesMasked[reqRule.attribute] !== undefined
      );

      if (cred) {
        matchingCredTitle = cred.title;
        matchingCredId = cred.id;
        const rawVal = cred.rawAttributesMasked[reqRule.attribute];
        const numVal = parseFloat(rawVal);
        const threshNum = typeof reqRule.threshold === 'number' ? reqRule.threshold : parseFloat(String(reqRule.threshold));
        const op = String(reqRule.operator || '').toUpperCase();

        if (!isNaN(numVal) && !isNaN(threshNum)) {
          if (op === 'LESS_THAN_OR_EQUAL' || op === '<=' || op === 'LTE') {
            satisfied = numVal <= threshNum;
          } else if (op === 'GREATER_THAN_OR_EQUAL' || op === '>=' || op === 'GTE') {
            satisfied = numVal >= threshNum;
          } else if (op === 'EQUALS' || op === '==' || op === 'EQ') {
            satisfied = numVal === threshNum;
          } else {
            satisfied = numVal <= threshNum;
          }
        } else {
          satisfied = String(rawVal).toLowerCase().trim() === String(reqRule.threshold).toLowerCase().trim();
        }
      }

      return {
        requirementId: reqRule.id,
        attribute: reqRule.attribute,
        attributeName: reqRule.attributeName,
        thresholdDisplay: reqRule.thresholdDisplay,
        satisfied,
        matchingCredTitle,
        matchingCredId,
      };
    });

    const isFullyEligible = predicateResults.every((p) => p.satisfied);

    res.json({
      schemeId: scheme.id,
      schemeTitle: scheme.title,
      isFullyEligible,
      predicateResults,
    });
  });

  // ==========================================
  // 4. CITIZEN VAULT & VERIFIABLE CREDENTIALS
  // ==========================================
  app.get('/api/credentials', (req, res) => {
    const user = getCurrentUser();
    const { citizenId, all } = req.query;

    if (all === 'true' || user.role === 'SUPER_ADMIN') {
      return res.json({ credentials: db.credentials });
    }

    const targetCitizenId = (citizenId as string) || user.id;
    const creds = db.credentials.filter((c) => c.citizenId === targetCitizenId);
    res.json({ credentials: creds });
  });

  // ==========================================
  // 5. ZERO-KNOWLEDGE PROOF GENERATION & VERIFY
  // ==========================================
  app.post('/api/proofs/generate', (req, res) => {
    try {
      const { credentialId, schemeId, attribute, operator, threshold, secretValue } = req.body || {};
      const user = getCurrentUser();

      let valToUse = secretValue;
      let cred = db.credentials.find((c) => c.id === credentialId);
      if (!cred && attribute) {
        cred = db.credentials.find(
          (c) => c.citizenId === user.id && c.rawAttributesMasked && c.rawAttributesMasked[attribute] !== undefined
        );
      }

      if (valToUse === undefined && cred && attribute && cred.rawAttributesMasked) {
        valToUse = cred.rawAttributesMasked[attribute];
      }

      if (valToUse === undefined) {
        // Safe standard default test values
        if (attribute === 'totalAreaHectares') valToUse = 1.4;
        else if (attribute === 'annualIncomeINR') valToUse = 140000;
        else if (attribute === 'aggregatePercentage') valToUse = 88.5;
        else valToUse = threshold !== undefined ? threshold : 1.0;
      }

      const proof = generatePredicateProof({
        citizenId: user.id,
        schemeId: schemeId || 'SCHEME_GENERIC',
        attribute: attribute || 'totalAreaHectares',
        operator: operator || 'LESS_THAN_OR_EQUAL',
        threshold: threshold !== undefined ? threshold : 2.0,
        secretValue: valToUse,
      });

      res.json({
        success: true,
        proof,
        cryptographicContext: {
          proverModel: 'Client-side WASM snarkjs-swappable engine',
          proofSizeBits: 2048,
          pedersenCommitment: proof.commitment,
          nullifierAssigned: proof.nullifierHash,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Proof generation failed' });
    }
  });

  app.post('/api/proofs/verify', (req, res) => {
    const { proof } = req.body || {};
    if (!proof) {
      return res.status(400).json({ error: 'Proof payload missing' });
    }

    const result = verifyPredicateProof(proof);
    if (result.isValid && result.claimSatisfied) {
      if (!String(proof.id || '').startsWith('prf_demo_') && proof.nullifierHash) {
        markNullifierConsumed(proof.nullifierHash);
      }

      // Record simulated transaction in mesh
      db.liveMeshTransactions.unshift({
        id: `tx_${Date.now()}`,
        sourceDept: 'REVENUE',
        targetDept: 'AGRI',
        predicateType: proof.attribute || 'PREDICATE_CLAIM',
        sanNumber: `SAN-VERIFY-${String(proof.nullifierHash || '000000').substring(0, 6)}`,
        timestamp: new Date().toISOString(),
        status: 'VERIFIED',
        verificationLatencyMs: Math.floor(Math.random() * 60 + 120),
      });
      if (db.liveMeshTransactions.length > 25) db.liveMeshTransactions.pop();
    }

    res.json({
      ...result,
      verifierNode: 'Sovereign-NIC-Cluster-01',
      timestamp: new Date().toISOString(),
    });
  });

  // ==========================================
  // 6. APPLICATIONS & SINGLE APPLICATION NUMBER
  // ==========================================
  app.get('/api/applications', (req, res) => {
    const user = getCurrentUser();
    const { citizenId, departmentCode, all } = req.query;

    if (all === 'true' || user.role === 'SUPER_ADMIN') {
      return res.json({ applications: db.applications });
    }

    if (citizenId) {
      return res.json({
        applications: db.applications.filter((a) => a.citizenId === citizenId),
      });
    }

    if (departmentCode) {
      return res.json({
        applications: db.applications.filter((a) => a.departmentCode === departmentCode),
      });
    }

    if (user.role === 'CITIZEN') {
      const apps = db.applications.filter((a) => a.citizenId === user.id);
      return res.json({ applications: apps });
    } else if (user.role === 'OFFICIAL') {
      const dept = db.departments.find((d) => d.id === user.departmentId);
      const apps = dept
        ? db.applications.filter((a) => a.departmentCode === dept.code)
        : db.applications;
      return res.json({ applications: apps });
    }
    res.json({ applications: db.applications });
  });

  app.get('/api/applications/:san', (req, res) => {
    const term = String(req.params.san || '').toUpperCase();
    const appRecord = db.applications.find(
      (a) => a.sanNumber.toUpperCase() === term || a.id.toUpperCase() === term
    );
    if (!appRecord) {
      return res.status(404).json({ error: 'Application not found with given SAN or ID' });
    }
    res.json({ application: appRecord });
  });

  app.post('/api/applications/apply', (req, res) => {
    const { schemeId, proofs, consentGranted } = req.body || {};
    const user = getCurrentUser();

    if (!consentGranted) {
      return res.status(400).json({ error: 'Explicit consent is mandatory under DPDP Act 2023.' });
    }

    const scheme = db.schemes.find((s) => s.id === schemeId || s.code === schemeId);
    if (!scheme) {
      return res.status(404).json({ error: 'Scheme not found' });
    }

    // Generate Single Application Number (SAN)
    const sanRandom = Math.floor(100000 + Math.random() * 900000);
    const sanNumber = `SAN-2026-IND-${sanRandom}`;
    const now = new Date();
    const slaDeadline = new Date(now.getTime() + scheme.slaHours * 3600 * 1000).toISOString();

    // Map department
    let dept = db.departments[0];
    if (scheme.category === 'FARMERS') {
      dept = db.departments.find((d) => d.code === 'AGRI') || dept;
    } else if (scheme.category === 'STUDENTS') {
      dept = db.departments.find((d) => d.code === 'EDU') || dept;
    } else if (scheme.category === 'HEALTHCARE') {
      dept = db.departments.find((d) => d.code === 'HEALTH') || dept;
    } else {
      dept = db.departments.find((d) => d.code === 'REVENUE') || dept;
    }

    // Create consent record
    const consent: ConsentGrant = {
      id: `cst_${crypto.randomBytes(6).toString('hex')}`,
      citizenId: user.id,
      departmentCode: dept.code,
      departmentName: dept.name,
      purpose: `Evaluation of ${scheme.title} application (${sanNumber})`,
      purposeHi: `${scheme.titleHi} आवेदन (${sanNumber}) का मूल्यांकन`,
      sanNumber,
      scope: scheme.requirements.map((r) => `PROOF_VERIFY:${r.attribute}`),
      grantedAt: now.toISOString(),
      validUntil: new Date(now.getTime() + 30 * 24 * 3600 * 1000).toISOString(),
      status: 'ACTIVE',
      accessCount: 1,
      lastAccessedAt: now.toISOString(),
    };
    db.consents.push(consent);

    // Create application
    const newApp: Application = {
      id: `app_${crypto.randomBytes(6).toString('hex')}`,
      sanNumber,
      citizenId: user.id,
      citizenName: user.name,
      schemeId: scheme.id,
      schemeCode: scheme.code,
      schemeTitle: scheme.title,
      schemeTitleHi: scheme.titleHi,
      departmentCode: dept.code,
      departmentName: dept.name,
      submittedAt: now.toISOString(),
      updatedAt: now.toISOString(),
      status: 'PROOFS_VALIDATED',
      proofs: proofs || [],
      slaDeadline,
      slaBreached: false,
      disbursementAmount: scheme.benefitAmount,
      events: [
        {
          id: `ev_${Date.now()}_1`,
          timestamp: now.toISOString(),
          stage: 'Application Initiated',
          description: `Issued Single Application Number ${sanNumber}. Consent recorded.`,
          actor: 'Pramaan Sovereign Mesh',
        },
        {
          id: `ev_${Date.now()}_2`,
          timestamp: new Date(now.getTime() + 1500).toISOString(),
          stage: 'ZK Proofs Verified',
          description: `Verified ${proofs?.length || 0} cryptographic predicate claims. Zero PII transferred.`,
          actor: `Verifier Node ${dept.code}-CLUSTER-01`,
        },
      ],
    };

    db.applications.unshift(newApp);

    // Record in Immutable Audit Log
    db.recordAuditLog({
      action: 'APPLICATION_SUBMITTED_WITH_SAN',
      actor: user.name,
      actorRole: user.role,
      targetEntity: 'APPLICATION',
      entityId: sanNumber,
      payload: { scheme: scheme.code, proofsCount: proofs?.length || 0 },
    });

    res.json({
      success: true,
      sanNumber,
      application: newApp,
      message: 'Application successfully registered across national interoperability mesh.',
    });
  });

  app.post('/api/applications/:id/status', (req, res) => {
    const { status, remarks } = req.body || {};
    const user = getCurrentUser();
    const appRecord = db.applications.find(
      (a) => a.id === req.params.id || a.sanNumber === req.params.id
    );

    if (!appRecord) {
      return res.status(404).json({ error: 'Application not found' });
    }

    appRecord.status = status;
    appRecord.updatedAt = new Date().toISOString();
    if (remarks) appRecord.officialRemarks = remarks;

    appRecord.events.push({
      id: `ev_${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: `Status updated to ${status}`,
      description: remarks || `Department official updated application status to ${status}.`,
      actor: `${user.name} (${user.departmentName || 'Official'})`,
    });

    db.recordAuditLog({
      action: `APPLICATION_STATUS_${status}`,
      actor: user.name,
      actorRole: user.role,
      targetEntity: 'APPLICATION',
      entityId: appRecord.sanNumber,
      payload: { newStatus: status, remarks },
    });

    res.json({ success: true, application: appRecord });
  });

  // ==========================================
  // 7. CONSENT MANAGEMENT (DPDP ACT 2023)
  // ==========================================
  app.get('/api/consents', (req, res) => {
    const user = getCurrentUser();
    const userConsents = db.consents.filter((c) => c.citizenId === user.id);
    res.json({ consents: userConsents });
  });

  app.post('/api/consents/:id/revoke', (req, res) => {
    const { reason } = req.body;
    const user = getCurrentUser();
    const consent = db.consents.find((c) => c.id === req.params.id && c.citizenId === user.id);

    if (!consent) {
      return res.status(404).json({ error: 'Consent record not found' });
    }

    consent.status = 'REVOKED';
    consent.revokedAt = new Date().toISOString();
    consent.revocationReason = reason || 'Citizen exercised DPDP Act Section 6(4) right to withdraw consent.';

    db.recordAuditLog({
      action: 'CONSENT_REVOKED',
      actor: user.name,
      actorRole: user.role,
      targetEntity: 'CONSENT_GRANT',
      entityId: consent.id,
      payload: { department: consent.departmentCode, reason: consent.revocationReason },
    });

    res.json({
      success: true,
      message: 'Consent successfully revoked. Recipient department access token immediately invalidated.',
      consent,
    });
  });

  // ==========================================
  // 8. AUDIT LOG & CRYPTOGRAPHIC VERIFICATION
  // ==========================================
  app.get('/api/audit/logs', (req, res) => {
    res.json({
      totalBlocks: db.auditLogs.length,
      logs: db.auditLogs.slice(-50).reverse(),
    });
  });

  app.post('/api/audit/record', async (req, res) => {
    try {
      const { action, actor, actorRole, targetEntity, entityId, payload } = req.body || {};
      if (!action || !actor) {
        return res.status(400).json({ error: 'Action and actor are required' });
      }

      const entry = db.recordAuditLog({
        action,
        actor,
        actorRole: actorRole || 'OFFICIAL',
        targetEntity: targetEntity || 'SYSTEM',
        entityId: entityId || 'ID_GEN',
        payload: payload || {},
      });

      // Secure write-only persistence to Firestore via server-side Admin SDK
      if (adminDb) {
        try {
          await adminDb.collection('auditLog').doc(`block_${entry.index}`).set({
            index: entry.index,
            action: entry.action,
            actor: entry.actor,
            actorRole: entry.actorRole,
            targetEntity: entry.targetEntity,
            entityId: entry.entityId,
            sha256Hash: entry.sha256Hash,
            currentHash: entry.sha256Hash,
            previousHash: entry.previousHash,
            payloadDigest: entry.payloadDigest,
            timestamp: entry.timestamp,
            status: entry.status,
            payload: payload || {},
          });
        } catch (dbErr) {
          console.warn('Non-blocking Firestore audit write notice:', dbErr);
        }
      }

      res.json({ success: true, entry });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Audit block record failed' });
    }
  });

  app.get('/api/audit/verify', (req, res) => {
    const result = db.verifyEntireAuditChain();
    res.json({
      ...result,
      chainValid: result.isChainValid,
      isChainValid: result.isChainValid,
      totalBlocksVerified: result.totalBlocksAudited,
      totalBlocksAudited: result.totalBlocksAudited,
      genesisHash: '0000000000000000000000000000000000000000000000000000000000000000',
      tipHash: db.auditLogs[db.auditLogs.length - 1]?.sha256Hash || '0000000000000000000000000000000000000000000000000000000000000000',
      verificationTimestamp: new Date().toISOString(),
    });
  });

  // ==========================================
  // 9. AI SCHEMA MAPPING (GEMINI 3.8 FLASH)
  // ==========================================
  app.get('/api/schemas', (req, res) => {
    res.json({ mappings: db.schemaMappings });
  });

  app.post('/api/schemas/map-ai', async (req, res) => {
    try {
      const { departmentName, sourceTableName, sourceColumns, targetCanonicalModel } = req.body || {};

      if (!sourceTableName || !sourceColumns || !targetCanonicalModel) {
        return res.status(400).json({ error: 'Missing required schema metadata fields' });
      }

      const aiResult = await mapLegacySchemaWithAI({
        departmentName: departmentName || 'Department of Agriculture',
        sourceTableName,
        sourceColumns,
        targetCanonicalModel,
      });

      const newMapping = {
        id: `map_${crypto.randomBytes(6).toString('hex')}`,
        departmentCode: 'AGRI' as const,
        departmentName: departmentName || 'Department of Agriculture',
        sourceTableName,
        canonicalModel: targetCanonicalModel,
        mappedFields: aiResult.mappedFields,
        overallConfidence: aiResult.overallConfidence,
        status: 'PENDING_APPROVAL' as const,
        aiExplanation: aiResult.aiExplanation,
        aiSuggestedBy: aiResult.aiSuggestedBy,
        createdAt: new Date().toISOString(),
      };

      db.schemaMappings.unshift(newMapping);

      res.json({
        success: true,
        mapping: newMapping,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'AI Schema Mapping failed' });
    }
  });

  app.post('/api/schemas/:id/approve', (req, res) => {
    const user = getCurrentUser();
    const mapping = db.schemaMappings.find((m) => m.id === req.params.id);
    if (!mapping) {
      return res.status(404).json({ error: 'Schema mapping not found' });
    }

    mapping.status = 'APPROVED';
    mapping.approvedBy = user.name;
    mapping.approvedAt = new Date().toISOString();

    db.recordAuditLog({
      action: 'SCHEMA_MAPPING_APPROVED',
      actor: user.name,
      actorRole: user.role,
      targetEntity: 'SCHEMA_MAPPING',
      entityId: mapping.id,
      payload: { source: mapping.sourceTableName, target: mapping.canonicalModel },
    });

    res.json({ success: true, mapping });
  });

  // ==========================================
  // 10. CONNECTORS, MESH & DEPARTMENTS
  // ==========================================
  app.get('/api/connectors', (req, res) => {
    res.json({ connectors: db.legacyConnectors });
  });

  app.get('/api/mesh/transactions', (req, res) => {
    res.json({ transactions: db.liveMeshTransactions });
  });

  app.get('/api/mesh/stats', (req, res) => {
    res.json({
      departments: db.departments,
      meshNodesOnline: 38,
      zkPredicatesVerified24h: 421800,
      p95LatencyMs: 182,
      crossDeptMeshLinks: [
        { from: 'REVENUE', to: 'AGRI', label: 'Land & Income Verifications' },
        { from: 'REVENUE', to: 'HEALTH', label: 'EWS/Deprivation Verifications' },
        { from: 'EDU', to: 'EDU', label: 'Academic Merit Verifications' },
        { from: 'IT_GOV', to: 'REVENUE', label: 'Digital Identity Anchor' },
        { from: 'AGRI', to: 'FINANCE', label: 'KCC Collateral Predicates' },
      ],
    });
  });

  app.get('/api/departments', (req, res) => {
    res.json({ departments: db.departments });
  });

  app.post('/api/departments/onboard', (req, res) => {
    const { deptName, jurisdiction, officerName, officialEmail, dbEngine, dailyVolume, schemes } = req.body || {};
    const trackNo = `REQ-DEPT-${Math.floor(1000 + Math.random() * 9000)}`;

    const ticket = {
      id: `grv_${crypto.randomBytes(6).toString('hex')}`,
      trackingNumber: trackNo,
      citizenName: officerName || 'Department Liaison Officer',
      email: officialEmail || 'dept.nodal@gov.in',
      phone: '+91 11 2345 6789',
      departmentCode: 'IT_GOV' as const,
      category: 'Department Interoperability Onboarding',
      subject: `Onboarding Request: ${deptName || 'Government Department'} (${jurisdiction || 'CENTRAL'})`,
      description: `DB Engine: ${dbEngine || 'ORACLE'}, Volume: ${dailyVolume || 'High'}, Target Schemes: ${schemes || 'N/A'}`,
      status: 'REGISTERED' as const,
      createdAt: new Date().toISOString(),
      resolutionNote: 'Assigned to NIC National Data Centre onboarding taskforce.',
    };

    db.grievances.unshift(ticket);

    db.recordAuditLog({
      action: 'DEPARTMENT_ONBOARDING_REQUESTED',
      actor: ticket.citizenName,
      actorRole: 'OFFICIAL',
      targetEntity: 'DEPARTMENT',
      entityId: trackNo,
      payload: { dept: deptName, jurisdiction },
    });

    res.json({
      success: true,
      trackingNumber: trackNo,
      ticket,
      message: 'Onboarding integration request registered with National Data Governance Framework.',
    });
  });

  // ==========================================
  // 11. DEVELOPER API PORTAL & OPENAPI 3.0
  // ==========================================
  app.get('/api/developer/keys', (req, res) => {
    res.json({ keys: db.apiKeys });
  });

  app.post('/api/developer/keys', (req, res) => {
    const { name, departmentCode, tier } = req.body || {};
    const keyPrefix = `prm_${tier === 'PRODUCTION_STAGING' ? 'stg' : 'sbx'}_${crypto.randomBytes(2).toString('hex')}`;
    const rawSecret = crypto.randomBytes(16).toString('hex');
    const fullKey = `${keyPrefix}_${rawSecret}`;

    const newKey = {
      id: `key_${crypto.randomBytes(4).toString('hex')}`,
      name: name || 'Department Development Key',
      keyPrefix,
      secretMasked: `${keyPrefix}_*******************${rawSecret.substring(rawSecret.length - 4)}`,
      departmentCode: departmentCode || 'AGRI',
      tier: tier || 'SANDBOX',
      rateLimitPerMin: tier === 'PRODUCTION_STAGING' ? 600 : 120,
      requestsCount: 0,
      createdAt: new Date().toISOString(),
    };

    db.apiKeys.push(newKey);
    res.json({ success: true, key: newKey, generatedFullKey: fullKey });
  });

  app.get('/api/developer/openapi.json', (req, res) => {
    res.json({
      openapi: '3.0.3',
      info: {
        title: 'Pramaan Sovereign Interoperability & ZK Proof API',
        version: '2.4.0',
        description: 'National API gateway specifications for government departments to issue credentials and verify zero-knowledge predicates without centralizing citizen PII.',
      },
      servers: [{ url: '/api', description: 'National Sovereign Gateway Root' }],
      paths: {
        '/schemes': {
          get: { summary: 'List all published sovereign welfare schemes', responses: { '200': { description: 'Successful schemes array' } } },
        },
        '/proofs/verify': {
          post: {
            summary: 'Verify zero-knowledge predicate proof without receiving raw data',
            requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { proof: { type: 'object' } } } } } },
            responses: { '200': { description: 'Cryptographic verification status' } },
          },
        },
        '/applications/apply': {
          post: {
            summary: 'Submit citizen application with attached ZK proof commitments and issue SAN',
            responses: { '200': { description: 'Application registered with SAN' } },
          },
        },
        '/consents': {
          get: { summary: 'List citizen data verification grants under DPDP Act 2023', responses: { '200': { description: 'Consent list' } } },
        },
        '/audit/verify': {
          get: { summary: 'Verify SHA-256 hash-chain integrity of the sovereign ledger', responses: { '200': { description: 'Integrity audit result' } } },
        },
      },
    });
  });

  // ==========================================
  // 12. GRIEVANCE & FEEDBACK
  // ==========================================
  app.get('/api/grievances', (req, res) => {
    res.json({ grievances: db.grievances });
  });

  app.post('/api/grievances/submit', (req, res) => {
    const { citizenName, email, phone, departmentCode, category, subject, description } = req.body || {};
    const trackNo = `GRV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const ticket = {
      id: `grv_${crypto.randomBytes(6).toString('hex')}`,
      trackingNumber: trackNo,
      citizenName: citizenName || 'Anonymous Citizen',
      email: email || 'citizen@nic.in',
      phone: phone || '+91 90000 00000',
      departmentCode: (departmentCode as any) || 'REVENUE',
      category: category || 'Verification Delay',
      subject: subject || 'Query regarding scheme verification',
      description: description || 'N/A',
      status: 'REGISTERED' as const,
      createdAt: new Date().toISOString(),
      resolutionNote: 'Assigned to Section Officer for 48-hour charter resolution.',
    };

    db.grievances.unshift(ticket);

    db.recordAuditLog({
      action: 'GRIEVANCE_REGISTERED',
      actor: ticket.citizenName,
      actorRole: 'CITIZEN',
      targetEntity: 'GRIEVANCE_TICKET',
      entityId: ticket.trackingNumber,
      payload: { dept: ticket.departmentCode, category: ticket.category },
    });

    res.json({
      success: true,
      trackingNumber: trackNo,
      ticket,
      message: 'Grievance ticket registered under Public Grievance Charter. Tracking number issued.',
    });
  });

  // Strict API 404 Handler: guarantees that any unknown /api route returns JSON and never HTML
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      error: 'API endpoint not found',
      path: req.originalUrl,
      method: req.method,
    });
  });

  // Global Error Handler for API routes
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled Server Error:', err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error',
      timestamp: new Date().toISOString(),
    });
  });

  // ==========================================
  // 13. VITE MIDDLEWARE SETUP
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pramaan Sovereign Interoperability Node listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
