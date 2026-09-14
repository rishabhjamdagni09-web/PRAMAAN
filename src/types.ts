/**
 * Pramaan - National Interoperability & ZK Proof Platform
 * Core Data Models & Type Definitions
 */

export type UserRole = 'CITIZEN' | 'OFFICIAL' | 'SUPER_ADMIN';

export type DepartmentCode = 'AGRI' | 'EDU' | 'REVENUE' | 'HEALTH' | 'FINANCE' | 'IT_GOV';

export type ApplicationStatus =
  | 'SUBMITTED'
  | 'VERIFYING_PROOFS'
  | 'PROOFS_VALIDATED'
  | 'APPROVED'
  | 'REJECTED'
  | 'DISBURSED'
  | 'FLAGGED';

export type ConsentStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';

export type PredicateType =
  | 'LESS_THAN_OR_EQUAL'
  | 'GREATER_THAN_OR_EQUAL'
  | 'EQUALS'
  | 'IN_SET'
  | 'BOOLEAN';

export interface User {
  id: string;
  name: string;
  nameHi?: string;
  email: string;
  phone: string;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
  aadhaarRefMasked?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  code: DepartmentCode;
  name: string;
  nameHi: string;
  ministry: string;
  ministryHi: string;
  description: string;
  endpointsCount: number;
  status: 'ACTIVE' | 'INTEGRATING' | 'MAINTENANCE';
  cdcStatus: 'HEALTHY' | 'SYNCING' | 'DEGRADED';
  nodeLocation: string;
  color: string;
}

export interface CredentialReference {
  id: string;
  citizenId: string;
  title: string;
  titleHi: string;
  issuingDeptCode: DepartmentCode;
  issuingDeptName: string;
  credentialType: 'IDENTITY' | 'INCOME' | 'LAND_RECORD' | 'ACADEMIC' | 'HEALTH_RECORD';
  issuedAt: string;
  expiresAt: string;
  rawAttributesMasked: Record<string, string>;
  supportedPredicates: {
    attribute: string;
    description: string;
    descriptionHi: string;
    operators: PredicateType[];
  }[];
  commitmentHash: string;
  type?: string;
  issuerName?: string;
}

export type Credential = CredentialReference;

export interface SchemeRequirement {
  id: string;
  attribute: string;
  attributeName: string;
  attributeNameHi: string;
  operator: PredicateType;
  threshold: string | number;
  thresholdDisplay: string;
  thresholdDisplayHi: string;
  requiredFromDept: DepartmentCode;
  description: string;
  descriptionHi: string;
}

export interface Scheme {
  id: string;
  code: string;
  title: string;
  titleHi: string;
  ministry: string;
  ministryHi: string;
  description: string;
  descriptionHi: string;
  benefitAmount: string;
  benefitAmountHi: string;
  category: 'FARMERS' | 'STUDENTS' | 'HEALTHCARE' | 'HOUSING' | 'PENSION';
  slaHours: number;
  requirements: SchemeRequirement[];
  activeApplicantsCount: number;
}

export interface ZKProof {
  id: string;
  predicateId: string;
  attribute: string;
  operator: PredicateType;
  threshold: string | number;
  claimSatisfied: boolean;
  commitment: string;
  nullifierHash: string;
  proofSignature: string;
  protocol: 'zk-SNARK-Groth16-swappable' | 'sha256-pedersen-commitment';
  timestamp: string;
  expiresAt: string;
  singleUseSpent: boolean;
}

export interface ApplicationEvent {
  id: string;
  timestamp: string;
  stage: string;
  description: string;
  actor: string;
  verifiedHash?: string;
}

export interface Application {
  id: string;
  sanNumber: string; // Single Application Number: e.g. SAN-2026-IND-883921
  citizenId: string;
  citizenName: string;
  schemeId: string;
  schemeCode: string;
  schemeTitle: string;
  schemeTitleHi: string;
  departmentCode: DepartmentCode;
  departmentName: string;
  submittedAt: string;
  updatedAt: string;
  status: ApplicationStatus;
  proofs: ZKProof[];
  slaDeadline: string;
  slaBreached: boolean;
  events: ApplicationEvent[];
  disbursementAmount?: string;
  officialRemarks?: string;
}

export interface ConsentGrant {
  id: string;
  citizenId: string;
  departmentCode: DepartmentCode;
  departmentName: string;
  purpose: string;
  purposeHi: string;
  sanNumber?: string;
  scope: string[];
  grantedAt: string;
  validUntil: string;
  status: ConsentStatus;
  revokedAt?: string;
  revocationReason?: string;
  accessCount: number;
  lastAccessedAt?: string;
}

export interface AuditLogEntry {
  index: number;
  timestamp: string;
  action: string;
  actor: string;
  actorRole: UserRole;
  targetEntity: string;
  entityId: string;
  sha256Hash: string;
  previousHash: string;
  payloadDigest: string;
  status: 'VALID' | 'TAMPERED';
}

export interface SchemaMappingField {
  sourceField: string;
  sourceType: string;
  targetField: string;
  targetType: string;
  transformation: string;
  confidence: number;
}

export interface SchemaMapping {
  id: string;
  departmentCode: DepartmentCode;
  departmentName: string;
  sourceTableName: string;
  canonicalModel: string;
  mappedFields: SchemaMappingField[];
  overallConfidence: number;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  aiExplanation: string;
  aiSuggestedBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface LegacyConnector {
  id: string;
  departmentCode: DepartmentCode;
  departmentName: string;
  systemName: string;
  dbType: 'ORACLE_CDC' | 'POSTGRES_WAL' | 'MSSQL_REPLICATION' | 'SAP_RFC';
  host: string;
  status: 'HEALTHY' | 'SYNCING' | 'DEGRADED';
  lastSyncTimestamp: string;
  syncLatencyMs: number;
  recordsProcessed24h: number;
  errorRatePercentage: number;
}

export interface GrievanceTicket {
  id: string;
  trackingNumber: string;
  citizenName: string;
  email: string;
  phone: string;
  departmentCode: DepartmentCode;
  category: string;
  subject: string;
  description: string;
  status: 'REGISTERED' | 'UNDER_INVESTIGATION' | 'RESOLVED' | 'ESCALATED';
  createdAt: string;
  resolutionNote?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  secretMasked: string;
  departmentCode: DepartmentCode;
  tier: 'SANDBOX' | 'PRODUCTION_STAGING' | 'DEPARTMENT_PRODUCTION';
  rateLimitPerMin: number;
  requestsCount: number;
  createdAt: string;
  lastUsedAt?: string;
}

export interface InterDepartmentTransaction {
  id: string;
  sourceDept: DepartmentCode;
  targetDept: DepartmentCode;
  predicateType: string;
  sanNumber: string;
  timestamp: string;
  status: 'VERIFIED' | 'PROCESSING' | 'FAILED';
  verificationLatencyMs: number;
}
