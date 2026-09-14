/**
 * Pramaan In-Memory Persistent State & Data Access Layer
 * Pre-seeded with authentic multi-tenant government data,
 * cryptographic state roots, and hash-chained audit blocks.
 */

import crypto from 'crypto';
import {
  Department,
  User,
  CredentialReference,
  Scheme,
  Application,
  ConsentGrant,
  AuditLogEntry,
  SchemaMapping,
  LegacyConnector,
  GrievanceTicket,
  ApiKey,
  InterDepartmentTransaction,
  ZKProof,
} from '../src/types';
import { generatePredicateProof, computeAuditBlockHash } from './crypto';

class PramaanDatabase {
  public departments: Department[] = [];
  public users: User[] = [];
  public credentials: CredentialReference[] = [];
  public schemes: Scheme[] = [];
  public applications: Application[] = [];
  public consents: ConsentGrant[] = [];
  public auditLogs: AuditLogEntry[] = [];
  public schemaMappings: SchemaMapping[] = [];
  public legacyConnectors: LegacyConnector[] = [];
  public grievances: GrievanceTicket[] = [];
  public apiKeys: ApiKey[] = [];
  public liveMeshTransactions: InterDepartmentTransaction[] = [];
  public systemMetrics = {
    uptimeSeconds: 842100,
    proofsVerifiedTotal: 14820941,
    p95LatencyMs: 182,
    activeCdcPipelines: 14,
    queueDepth: 3,
    errorRate: 0.0012,
    memoryRssMb: 148.5,
  };

  constructor() {
    this.seedInitialState();
  }

  private seedInitialState() {
    // 1. Departments
    this.departments = [
      {
        id: 'dept_agri',
        code: 'AGRI',
        name: 'Department of Agriculture & Farmers Welfare',
        nameHi: 'कृषि एवं किसान कल्याण विभाग',
        ministry: 'Ministry of Agriculture & Farmers Welfare',
        ministryHi: 'कृषि एवं किसान कल्याण मंत्रालय',
        description: 'Custodians of PM-KISAN, Kisan Credit Card, and National Agri Registry.',
        endpointsCount: 14,
        status: 'ACTIVE',
        cdcStatus: 'HEALTHY',
        nodeLocation: 'NDCG Data Centre, New Delhi (Rack 08B)',
        color: '#15803d',
      },
      {
        id: 'dept_edu',
        code: 'EDU',
        name: 'Department of Higher Education',
        nameHi: 'उच्च शिक्षा विभाग',
        ministry: 'Ministry of Education',
        ministryHi: 'शिक्षा मंत्रालय',
        description: 'Unified Higher Education academic credential registry and scholarship disbursements.',
        endpointsCount: 19,
        status: 'ACTIVE',
        cdcStatus: 'HEALTHY',
        nodeLocation: 'NIC Cloud MeghRaj, Hyderabad',
        color: '#1d4ed8',
      },
      {
        id: 'dept_revenue',
        code: 'REVENUE',
        name: 'Department of Revenue & Land Records',
        nameHi: 'राजस्व एवं भू-अभिलेख विभाग',
        ministry: 'Ministry of Finance & Rural Development',
        ministryHi: 'वित्त एवं ग्रामीण विकास मंत्रालय',
        description: 'Issuer of digitally stamped Land Titles (RoR/Khatauni) and Income Certificates.',
        endpointsCount: 26,
        status: 'ACTIVE',
        cdcStatus: 'HEALTHY',
        nodeLocation: 'NIC National Cloud, Pune',
        color: '#b45309',
      },
      {
        id: 'dept_health',
        code: 'HEALTH',
        name: 'Ministry of Health & Family Welfare',
        nameHi: 'स्वास्थ्य एवं परिवार कल्याण मंत्रालय',
        ministry: 'Ministry of Health & Family Welfare',
        ministryHi: 'स्वास्थ्य एवं परिवार कल्याण मंत्रालय',
        description: 'Ayushman Bharat National Health Authority (NHA) beneficiary ledger.',
        endpointsCount: 12,
        status: 'ACTIVE',
        cdcStatus: 'SYNCING',
        nodeLocation: 'NDCG Data Centre, Bengaluru',
        color: '#0e7490',
      },
      {
        id: 'dept_it',
        code: 'IT_GOV',
        name: 'Ministry of Electronics and Information Technology',
        nameHi: 'इलेक्ट्रॉनिक्स एवं सूचना प्रौद्योगिकी मंत्रालय',
        ministry: 'MeitY',
        ministryHi: 'माइटी',
        description: 'Sovereign root trust anchor, DigiLocker mesh node, and ZK proof verifier grid.',
        endpointsCount: 31,
        status: 'ACTIVE',
        cdcStatus: 'HEALTHY',
        nodeLocation: 'National Sovereign Root, C-DAC Pune',
        color: '#4338ca',
      },
    ];

    // 2. Users
    this.users = [
      {
        id: 'cit_ramesh',
        name: 'Ramesh Kumar',
        nameHi: 'रमेश कुमार',
        email: 'ramesh.kumar.farmer@nic.in',
        phone: '+91 98765 43210',
        role: 'CITIZEN',
        aadhaarRefMasked: 'XXXXXXXX4912',
        createdAt: '2025-04-10T09:00:00.000Z',
      },
      {
        id: 'cit_priya',
        name: 'Priya Sharma',
        nameHi: 'प्रिया शर्मा',
        email: 'priya.sharma.edu@nic.in',
        phone: '+91 98112 23344',
        role: 'CITIZEN',
        aadhaarRefMasked: 'XXXXXXXX9821',
        createdAt: '2025-06-15T11:20:00.000Z',
      },
      {
        id: 'off_agri',
        name: 'Rajesh Verma',
        nameHi: 'राजेश वर्मा',
        email: 'rajesh.verma@agri.gov.in',
        phone: '+91 97110 55443',
        role: 'OFFICIAL',
        departmentId: 'dept_agri',
        departmentName: 'Department of Agriculture & Farmers Welfare',
        createdAt: '2025-01-15T08:30:00.000Z',
      },
      {
        id: 'off_edu',
        name: 'Dr. Sunita Rao',
        nameHi: 'डॉ. सुनीता राव',
        email: 'sunita.rao@education.gov.in',
        phone: '+91 94220 11998',
        role: 'OFFICIAL',
        departmentId: 'dept_edu',
        departmentName: 'Department of Higher Education',
        createdAt: '2025-02-01T10:15:00.000Z',
      },
      {
        id: 'admin_super',
        name: 'Dr. Arvind Narayanan',
        nameHi: 'डॉ. अरविंद नारायणन',
        email: 'arvind.narayanan@meity.gov.in',
        phone: '+91 99000 11223',
        role: 'SUPER_ADMIN',
        departmentId: 'dept_it',
        departmentName: 'National Sovereign Root',
        createdAt: '2024-11-01T06:00:00.000Z',
      },
    ];

    // 3. Credentials (Citizen Vault)
    this.credentials = [
      {
        id: 'cred_ramesh_land',
        citizenId: 'cit_ramesh',
        title: 'Agricultural Land Title (Khatauni RoR)',
        titleHi: 'कृषि भू-अभिलेख (खतौनी)',
        issuingDeptCode: 'REVENUE',
        issuingDeptName: 'Department of Revenue & Land Records',
        credentialType: 'LAND_RECORD',
        issuedAt: '2025-03-01T00:00:00.000Z',
        expiresAt: '2030-03-01T00:00:00.000Z',
        rawAttributesMasked: {
          khataNumber: 'KHT-7729-UP',
          totalAreaHectares: '1.40',
          tehsil: 'Barabanki, Uttar Pradesh',
          ownershipShare: '100%',
          irrigationType: 'Canal Fed',
        },
        supportedPredicates: [
          {
            attribute: 'totalAreaHectares',
            description: 'Proof that land area is within small/marginal farmer thresholds',
            descriptionHi: 'प्रमाण कि भूमि क्षेत्र लघु/सीमांत कृषक सीमा के अंतर्गत है',
            operators: ['LESS_THAN_OR_EQUAL', 'GREATER_THAN_OR_EQUAL'],
          },
        ],
        commitmentHash: '0x8f2d9e11c34a9b671a5500e23ef890a82b4512e038d17b4c6e9a0123f458129a',
      },
      {
        id: 'cred_ramesh_income',
        citizenId: 'cit_ramesh',
        title: 'Verified Annual Income Certificate',
        titleHi: 'प्रमाणित वार्षिक आय प्रमाण पत्र',
        issuingDeptCode: 'REVENUE',
        issuingDeptName: 'Department of Revenue & Land Records',
        credentialType: 'INCOME',
        issuedAt: '2025-05-12T00:00:00.000Z',
        expiresAt: '2027-05-12T00:00:00.000Z',
        rawAttributesMasked: {
          annualIncomeINR: '140000',
          certificateNumber: 'INC/UP/2025/99821',
          certifyingOfficer: 'Tehsildar Grade-I',
          taxExempt: 'YES',
        },
        supportedPredicates: [
          {
            attribute: 'annualIncomeINR',
            description: 'Proof that annual income is below scheme threshold (e.g. <= ₹2,50,000)',
            descriptionHi: 'प्रमाण कि वार्षिक आय योजना सीमा से कम है (उदा. <= ₹2,50,000)',
            operators: ['LESS_THAN_OR_EQUAL'],
          },
        ],
        commitmentHash: '0x3a4b9c8d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
      },
      {
        id: 'cred_priya_marks',
        citizenId: 'cit_priya',
        title: 'Senior Secondary CBSE Marksheet',
        titleHi: 'सीबीएसई 12वीं अंकतालिका',
        issuingDeptCode: 'EDU',
        issuingDeptName: 'Department of Higher Education',
        credentialType: 'ACADEMIC',
        issuedAt: '2025-06-01T00:00:00.000Z',
        expiresAt: '2099-12-31T00:00:00.000Z',
        rawAttributesMasked: {
          rollNumber: 'CBSE-2025-781902',
          aggregatePercentage: '88.5',
          stream: 'Science (PCM)',
          passingYear: '2025',
        },
        supportedPredicates: [
          {
            attribute: 'aggregatePercentage',
            description: 'Proof that academic merit score exceeds scholarship cut-off (e.g. >= 75%)',
            descriptionHi: 'प्रमाण कि शैक्षणिक योग्यता छात्रवृत्ति कट-ऑफ से अधिक है',
            operators: ['GREATER_THAN_OR_EQUAL'],
          },
        ],
        commitmentHash: '0x9918273645aabbccddeeff0011223344556677889900aabbccddeeff00112233',
      },
      {
        id: 'cred_priya_income',
        citizenId: 'cit_priya',
        title: 'Parental Income Certificate (EWS)',
        titleHi: 'अभिभावक आय प्रमाण पत्र (ईडब्ल्यूएस)',
        issuingDeptCode: 'REVENUE',
        issuingDeptName: 'Department of Revenue & Land Records',
        credentialType: 'INCOME',
        issuedAt: '2025-04-15T00:00:00.000Z',
        expiresAt: '2026-04-15T00:00:00.000Z',
        rawAttributesMasked: {
          annualIncomeINR: '180000',
          certificateNumber: 'INC/DL/2025/11094',
          category: 'EWS',
        },
        supportedPredicates: [
          {
            attribute: 'annualIncomeINR',
            description: 'Proof that household income is below EWS scholarship limit',
            descriptionHi: 'प्रमाण कि पारिवारिक आय छात्रवृत्ति सीमा के भीतर है',
            operators: ['LESS_THAN_OR_EQUAL'],
          },
        ],
        commitmentHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      },
    ];

    // 4. Schemes
    this.schemes = [
      {
        id: 'scheme_pm_kisan',
        code: 'PM-KISAN-SAMMAN',
        title: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
        titleHi: 'प्रधानमंत्री किसान सम्मान निधि (पीएम-किसान)',
        ministry: 'Ministry of Agriculture & Farmers Welfare',
        ministryHi: 'कृषि एवं किसान कल्याण मंत्रालय',
        description: 'Direct income support of ₹6,000 per year in three equal installments to all landholding farmer families across India.',
        descriptionHi: 'देश भर के सभी भूमिधारक किसान परिवारों को तीन समान किस्तों में ₹6,000 प्रति वर्ष की प्रत्यक्ष आय सहायता।',
        benefitAmount: '₹6,000 / Year (Direct DBT)',
        benefitAmountHi: '₹6,000 / वर्ष (प्रत्यक्ष डीबीटी)',
        category: 'FARMERS',
        slaHours: 48,
        activeApplicantsCount: 1420800,
        requirements: [
          {
            id: 'req_land',
            attribute: 'totalAreaHectares',
            attributeName: 'Land Holding Area',
            attributeNameHi: 'भूमि जोत क्षेत्र',
            operator: 'LESS_THAN_OR_EQUAL',
            threshold: 2.0,
            thresholdDisplay: '≤ 2.0 Hectares (Small/Marginal)',
            thresholdDisplayHi: '≤ 2.0 हेक्टेयर (लघु/सीमांत)',
            requiredFromDept: 'REVENUE',
            description: 'Proof of landholding size without disclosing cadastral parcel coordinates.',
            descriptionHi: 'भूमि पार्सल विवरण प्रकट किए बिना भूमि जोत आकार का प्रमाण।',
          },
          {
            id: 'req_income',
            attribute: 'annualIncomeINR',
            attributeName: 'Annual Household Income',
            attributeNameHi: 'वार्षिक पारिवारिक आय',
            operator: 'LESS_THAN_OR_EQUAL',
            threshold: 250000,
            thresholdDisplay: '≤ ₹2,50,000 / annum',
            thresholdDisplayHi: '≤ ₹2,50,000 / वर्ष',
            requiredFromDept: 'REVENUE',
            description: 'Zero-knowledge proof that total taxable income is below income tax threshold.',
            descriptionHi: 'शून्य-ज्ञान प्रमाण कि कर योग्य आय सीमा से कम है।',
          },
        ],
      },
      {
        id: 'scheme_nmms',
        code: 'NMM-SCHOLARSHIP-2026',
        title: 'National Merit-cum-Means Scholarship Scheme',
        titleHi: 'राष्ट्रीय साधन-सह-योग्यता छात्रवृत्ति योजना',
        ministry: 'Ministry of Education',
        ministryHi: 'शिक्षा मंत्रालय',
        description: 'Financial assistance of ₹12,000 per annum to meritorious students from economically weaker sections to arrest dropouts at class VIII & XII.',
        descriptionHi: 'आर्थिक रूप से कमजोर वर्गों के मेधावी छात्रों को ड्रॉपआउट रोकने हेतु ₹12,000 प्रति वर्ष की वित्तीय सहायता।',
        benefitAmount: '₹12,000 / Year',
        benefitAmountHi: '₹12,000 / वर्ष',
        category: 'STUDENTS',
        slaHours: 72,
        activeApplicantsCount: 382400,
        requirements: [
          {
            id: 'req_marks',
            attribute: 'aggregatePercentage',
            attributeName: 'Secondary Academic Merit',
            attributeNameHi: 'माध्यमिक शैक्षणिक योग्यता',
            operator: 'GREATER_THAN_OR_EQUAL',
            threshold: 75.0,
            thresholdDisplay: '≥ 75.0% Aggregate Marks',
            thresholdDisplayHi: '≥ 75.0% कुल अंक',
            requiredFromDept: 'EDU',
            description: 'Proof of academic qualification without disclosing exact mark sheets.',
            descriptionHi: 'अंकतालिका प्रकट किए बिना शैक्षणिक योग्यता का प्रमाण।',
          },
          {
            id: 'req_parent_income',
            attribute: 'annualIncomeINR',
            attributeName: 'Parental Annual Income',
            attributeNameHi: 'अभिभावक वार्षिक आय',
            operator: 'LESS_THAN_OR_EQUAL',
            threshold: 350000,
            thresholdDisplay: '≤ ₹3,50,000 / annum',
            thresholdDisplayHi: '≤ ₹3,50,000 / वर्ष',
            requiredFromDept: 'REVENUE',
            description: 'EWS criteria verification proof from issuing state revenue department.',
            descriptionHi: 'राज्य राजस्व विभाग द्वारा जारी ईडब्ल्यूएस सत्यापन प्रमाण।',
          },
        ],
      },
      {
        id: 'scheme_pmjay',
        code: 'AYUSHMAN-PMJAY',
        title: 'Ayushman Bharat PM-JAY Health Protection',
        titleHi: 'आयुष्मान भारत पीएम-जय स्वास्थ्य सुरक्षा',
        ministry: 'Ministry of Health & Family Welfare',
        ministryHi: 'स्वास्थ्य एवं परिवार कल्याण मंत्रालय',
        description: 'World\'s largest government healthcare scheme offering cashless cover up to ₹5,00,000 per family per year for secondary and tertiary hospitalization.',
        descriptionHi: 'द्वितीयक एवं तृतीयक अस्पताल में भर्ती हेतु प्रति परिवार प्रति वर्ष ₹5,00,000 तक कैशलेस कवर।',
        benefitAmount: '₹5,00,000 Cashless Cover',
        benefitAmountHi: '₹5,00,000 कैशलेस सुरक्षा',
        category: 'HEALTHCARE',
        slaHours: 24,
        activeApplicantsCount: 2901400,
        requirements: [
          {
            id: 'req_health_income',
            attribute: 'annualIncomeINR',
            attributeName: 'Vulnerability / Income Index',
            attributeNameHi: 'आय / वंचना सूचकांक',
            operator: 'LESS_THAN_OR_EQUAL',
            threshold: 250000,
            thresholdDisplay: '≤ ₹2,50,000 / annum',
            thresholdDisplayHi: '≤ ₹2,50,000 / वर्ष',
            requiredFromDept: 'REVENUE',
            description: 'Verifies SECC/EWS deprivation criteria via zero-knowledge predicate.',
            descriptionHi: 'शून्य-ज्ञान प्रेडिकेट द्वारा सामाजिक-आर्थिक वंचना मानदंड सत्यापित करता है।',
          },
        ],
      },
      {
        id: 'scheme_kcc',
        code: 'KISAN-CREDIT-CARD',
        title: 'Kisan Credit Card (KCC) Subsidized Agri Credit',
        titleHi: 'किसान क्रेडिट कार्ड (केसीसी) रियायती कृषि ऋण',
        ministry: 'Ministry of Agriculture & Farmers Welfare',
        ministryHi: 'कृषि एवं किसान कल्याण मंत्रालय',
        description: 'Institutional credit at concessional interest rate of 4% per annum for agricultural inputs, machinery, and crop insurance.',
        descriptionHi: 'कृषि इनपुट, मशीनरी एवं फसल बीमा हेतु 4% वार्षिक रियायती ब्याज दर पर संस्थागत ऋण।',
        benefitAmount: 'Up to ₹3,00,000 at 4% Interest',
        benefitAmountHi: '4% ब्याज पर ₹3,00,000 तक',
        category: 'FARMERS',
        slaHours: 48,
        activeApplicantsCount: 712000,
        requirements: [
          {
            id: 'req_kcc_land',
            attribute: 'totalAreaHectares',
            attributeName: 'Agricultural Land Title',
            attributeNameHi: 'कृषि भूमि स्वामित्व',
            operator: 'LESS_THAN_OR_EQUAL',
            threshold: 5.0,
            thresholdDisplay: '≤ 5.0 Hectares',
            thresholdDisplayHi: '≤ 5.0 हेक्टेयर',
            requiredFromDept: 'REVENUE',
            description: 'Verifies active landholding for interest subvention qualification.',
            descriptionHi: 'ब्याज अनुदान पात्रता हेतु सक्रिय भूमि जोत सत्यापित करता है।',
          },
        ],
      },
    ];

    // 5. Generate realistic sample ZK Proofs & Applications
    const rameshLandProof = generatePredicateProof({
      citizenId: 'cit_ramesh',
      schemeId: 'scheme_pm_kisan',
      attribute: 'totalAreaHectares',
      operator: 'LESS_THAN_OR_EQUAL',
      threshold: 2.0,
      secretValue: 1.4,
    });

    const rameshIncomeProof = generatePredicateProof({
      citizenId: 'cit_ramesh',
      schemeId: 'scheme_pm_kisan',
      attribute: 'annualIncomeINR',
      operator: 'LESS_THAN_OR_EQUAL',
      threshold: 250000,
      secretValue: 140000,
    });

    const priyaMarksProof = generatePredicateProof({
      citizenId: 'cit_priya',
      schemeId: 'scheme_nmms',
      attribute: 'aggregatePercentage',
      operator: 'GREATER_THAN_OR_EQUAL',
      threshold: 75.0,
      secretValue: 88.5,
    });

    const priyaIncomeProof = generatePredicateProof({
      citizenId: 'cit_priya',
      schemeId: 'scheme_nmms',
      attribute: 'annualIncomeINR',
      operator: 'LESS_THAN_OR_EQUAL',
      threshold: 350000,
      secretValue: 180000,
    });

    this.applications = [
      {
        id: 'app_883921',
        sanNumber: 'SAN-2026-IND-883921',
        citizenId: 'cit_ramesh',
        citizenName: 'Ramesh Kumar',
        schemeId: 'scheme_pm_kisan',
        schemeCode: 'PM-KISAN-SAMMAN',
        schemeTitle: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
        schemeTitleHi: 'प्रधानमंत्री किसान सम्मान निधि (पीएम-किसान)',
        departmentCode: 'AGRI',
        departmentName: 'Department of Agriculture & Farmers Welfare',
        submittedAt: '2026-09-11T14:30:00.000Z',
        updatedAt: '2026-09-12T08:15:00.000Z',
        status: 'PROOFS_VALIDATED',
        proofs: [rameshLandProof, rameshIncomeProof],
        slaDeadline: '2026-09-13T14:30:00.000Z',
        slaBreached: false,
        disbursementAmount: '₹6,000',
        officialRemarks: 'Both ZK predicate proofs verified cryptographically against state root. Ready for final treasury disbursement.',
        events: [
          {
            id: 'ev_1',
            timestamp: '2026-09-11T14:30:00.000Z',
            stage: 'Application Initiated',
            description: 'Single Application Number SAN-2026-IND-883921 issued to citizen device.',
            actor: 'Pramaan Sovereign Mesh',
          },
          {
            id: 'ev_2',
            timestamp: '2026-09-11T14:30:02.000Z',
            stage: 'ZK Proof Verification',
            description: 'Mathematical verification of Land ≤ 2.0ha and Income ≤ ₹2.5L completed (Latency: 142ms). Zero raw PII transferred.',
            actor: 'Verifier Node AGRI-DELHI-01',
            verifiedHash: rameshLandProof.proofSignature.substring(0, 16),
          },
          {
            id: 'ev_3',
            timestamp: '2026-09-12T08:15:00.000Z',
            stage: 'Official Review Passed',
            description: 'Department Officer Rajesh Verma accepted mathematical verification.',
            actor: 'Rajesh Verma (Dir. Agri Verification)',
          },
        ],
      },
      {
        id: 'app_994102',
        sanNumber: 'SAN-2026-IND-994102',
        citizenId: 'cit_priya',
        citizenName: 'Priya Sharma',
        schemeId: 'scheme_nmms',
        schemeCode: 'NMM-SCHOLARSHIP-2026',
        schemeTitle: 'National Merit-cum-Means Scholarship Scheme',
        schemeTitleHi: 'राष्ट्रीय साधन-सह-योग्यता छात्रवृत्ति योजना',
        departmentCode: 'EDU',
        departmentName: 'Department of Higher Education',
        submittedAt: '2026-09-08T10:00:00.000Z',
        updatedAt: '2026-09-10T11:45:00.000Z',
        status: 'DISBURSED',
        proofs: [priyaMarksProof, priyaIncomeProof],
        slaDeadline: '2026-09-11T10:00:00.000Z',
        slaBreached: false,
        disbursementAmount: '₹12,000',
        officialRemarks: 'Scholarship disbursed via Aadhaar-linked DBT gateway. ZK proofs archived.',
        events: [
          {
            id: 'ev_p1',
            timestamp: '2026-09-08T10:00:00.000Z',
            stage: 'Application Initiated',
            description: 'Issued SAN-2026-IND-994102. Marks proof (≥75%) & Income proof (≤₹3.5L) anchored.',
            actor: 'Citizen Vault',
          },
          {
            id: 'ev_p2',
            timestamp: '2026-09-08T10:00:04.000Z',
            stage: 'Proof Evaluation',
            description: 'Proofs cryptographically checked against CBSE & Revenue state trees.',
            actor: 'EDU-NIC-VERIFIER',
          },
          {
            id: 'ev_p3',
            timestamp: '2026-09-10T11:45:00.000Z',
            stage: 'Treasury Settlement',
            description: 'PFMS DBT token generated and disbursed.',
            actor: 'National Treasury Mesh',
          },
        ],
      },
      {
        id: 'app_772159',
        sanNumber: 'SAN-2026-IND-772159',
        citizenId: 'cit_ramesh',
        citizenName: 'Ramesh Kumar',
        schemeId: 'scheme_pmjay',
        schemeCode: 'AYUSHMAN-PMJAY',
        schemeTitle: 'Ayushman Bharat PM-JAY Health Protection',
        schemeTitleHi: 'आयुष्मान भारत पीएम-जय स्वास्थ्य सुरक्षा',
        departmentCode: 'HEALTH',
        departmentName: 'Ministry of Health & Family Welfare',
        submittedAt: '2026-09-12T07:10:00.000Z',
        updatedAt: '2026-09-12T07:10:00.000Z',
        status: 'VERIFYING_PROOFS',
        proofs: [rameshIncomeProof],
        slaDeadline: '2026-09-13T07:10:00.000Z',
        slaBreached: false,
        events: [
          {
            id: 'ev_h1',
            timestamp: '2026-09-12T07:10:00.000Z',
            stage: 'Proof Ingestion',
            description: 'SAN-2026-IND-772159 received. Proof queue assigned to NHA Verifier cluster.',
            actor: 'Mesh Ingress Gateway',
          },
        ],
      },
    ];

    // 6. Consent Grants (DPDP Act 2023 Compliant)
    this.consents = [
      {
        id: 'cst_01',
        citizenId: 'cit_ramesh',
        departmentCode: 'AGRI',
        departmentName: 'Department of Agriculture & Farmers Welfare',
        purpose: 'Verification of Land Holding & Annual Income predicates for PM-KISAN scheme qualification.',
        purposeHi: 'पीएम-किसान योजना पात्रता हेतु भूमि जोत एवं वार्षिक आय प्रेडिकेट्स का सत्यापन।',
        sanNumber: 'SAN-2026-IND-883921',
        scope: ['PROOF_VERIFY:totalAreaHectares', 'PROOF_VERIFY:annualIncomeINR'],
        grantedAt: '2026-09-11T14:29:45.000Z',
        validUntil: '2026-10-11T14:29:45.000Z',
        status: 'ACTIVE',
        accessCount: 2,
        lastAccessedAt: '2026-09-12T08:15:00.000Z',
      },
      {
        id: 'cst_02',
        citizenId: 'cit_priya',
        departmentCode: 'EDU',
        departmentName: 'Department of Higher Education',
        purpose: 'Single-use predicate verification for National Merit Scholarship evaluation.',
        purposeHi: 'राष्ट्रीय साधन-सह-योग्यता छात्रवृत्ति मूल्यांकन हेतु एकल-उपयोग प्रेडिकेट सत्यापन।',
        sanNumber: 'SAN-2026-IND-994102',
        scope: ['PROOF_VERIFY:aggregatePercentage', 'PROOF_VERIFY:annualIncomeINR'],
        grantedAt: '2026-09-08T09:59:00.000Z',
        validUntil: '2026-10-08T09:59:00.000Z',
        status: 'ACTIVE',
        accessCount: 3,
        lastAccessedAt: '2026-09-10T11:45:00.000Z',
      },
      {
        id: 'cst_03_revoked',
        citizenId: 'cit_ramesh',
        departmentCode: 'FINANCE',
        departmentName: 'Department of Financial Services',
        purpose: 'Agri-equipment collateral predicate verification.',
        purposeHi: 'कृषि उपकरण संपार्श्विक प्रेडिकेट सत्यापन।',
        scope: ['PROOF_VERIFY:totalAreaHectares'],
        grantedAt: '2026-08-01T10:00:00.000Z',
        validUntil: '2026-09-01T10:00:00.000Z',
        status: 'REVOKED',
        revokedAt: '2026-08-15T16:20:00.000Z',
        revocationReason: 'Citizen exercised statutory right under DPDP Act Section 6(4).',
        accessCount: 1,
        lastAccessedAt: '2026-08-02T12:00:00.000Z',
      },
    ];

    // 7. Tamper-evident Hash-Chained Audit Ledger
    this.seedAuditTrail();

    // 8. Legacy CDC Connectors
    this.legacyConnectors = [
      {
        id: 'conn_agri_oracle',
        departmentCode: 'AGRI',
        departmentName: 'Department of Agriculture',
        systemName: 'Oracle GoldenGate 23ai - PM-KISAN Legacy DB',
        dbType: 'ORACLE_CDC',
        host: 'agri-ora-cdc-01.internal.nic.in:1521',
        status: 'HEALTHY',
        lastSyncTimestamp: new Date(Date.now() - 45000).toISOString(),
        syncLatencyMs: 42,
        recordsProcessed24h: 3418290,
        errorRatePercentage: 0.0002,
      },
      {
        id: 'conn_edu_postgres',
        departmentCode: 'EDU',
        departmentName: 'Department of Higher Education',
        systemName: 'Debezium Postgres WAL - AISHE Registry',
        dbType: 'POSTGRES_WAL',
        host: 'edu-pg-cdc-pool.niccloud.in:5432',
        status: 'HEALTHY',
        lastSyncTimestamp: new Date(Date.now() - 25000).toISOString(),
        syncLatencyMs: 28,
        recordsProcessed24h: 1892014,
        errorRatePercentage: 0.0001,
      },
      {
        id: 'conn_revenue_mssql',
        departmentCode: 'REVENUE',
        departmentName: 'Department of Revenue',
        systemName: 'SQL Server Transaction Log CDC - Bhulekh State Mesh',
        dbType: 'MSSQL_REPLICATION',
        host: 'rev-state-cluster.up.gov.in:1433',
        status: 'SYNCING',
        lastSyncTimestamp: new Date(Date.now() - 110000).toISOString(),
        syncLatencyMs: 110,
        recordsProcessed24h: 6819200,
        errorRatePercentage: 0.0015,
      },
      {
        id: 'conn_health_sap',
        departmentCode: 'HEALTH',
        departmentName: 'Ministry of Health',
        systemName: 'SAP NetWeaver RFC - AB-PMJAY Beneficiary Engine',
        dbType: 'SAP_RFC',
        host: 'nha-sap-prod.gov.in:3300',
        status: 'HEALTHY',
        lastSyncTimestamp: new Date(Date.now() - 30000).toISOString(),
        syncLatencyMs: 65,
        recordsProcessed24h: 4209110,
        errorRatePercentage: 0.0004,
      },
    ];

    // 9. Schema Mappings
    this.schemaMappings = [
      {
        id: 'map_agri_01',
        departmentCode: 'AGRI',
        departmentName: 'Department of Agriculture',
        sourceTableName: 'TBL_KISAN_REGISTRATION_V2',
        canonicalModel: 'OIS_FARMER_REGISTRY',
        overallConfidence: 0.96,
        status: 'APPROVED',
        aiExplanation: 'Auto-mapped 6 columns using Gemini 3.8-Flash with DPDP tokenization on financial addresses and LGD geography normalization.',
        aiSuggestedBy: 'Gemini 3.8 Flash (NDGF Interoperability Agent)',
        createdAt: '2026-08-20T10:00:00.000Z',
        approvedBy: 'Rajesh Verma',
        approvedAt: '2026-08-20T14:30:00.000Z',
        mappedFields: [
          { sourceField: 'KISAN_ID', sourceType: 'VARCHAR2(32)', targetField: 'farmerUniqueId', targetType: 'UUID', transformation: 'UUIDv5 Deterministic Hash', confidence: 0.99 },
          { sourceField: 'LAND_HA', sourceType: 'NUMBER(8,2)', targetField: 'landHoldingHectares', targetType: 'DECIMAL', transformation: 'Direct numeric cast', confidence: 0.98 },
          { sourceField: 'INC_ANN', sourceType: 'NUMBER(12,2)', targetField: 'totalAnnualIncomeINR', targetType: 'DECIMAL', transformation: 'Direct numeric cast', confidence: 0.97 },
          { sourceField: 'AADHAAR_TOKEN', sourceType: 'VARCHAR2(64)', targetField: 'pseudonymAadhaarHash', targetType: 'SHA256_HASH', transformation: 'Zero-knowledge salt verify', confidence: 0.99 },
        ],
      },
    ];

    // 10. Developer API Keys
    this.apiKeys = [
      {
        id: 'key_sandbox_01',
        name: 'Ministry of Agri Sandbox Key',
        keyPrefix: 'prm_sbx_99a8',
        secretMasked: 'prm_sbx_99a8*******************f412',
        departmentCode: 'AGRI',
        tier: 'SANDBOX',
        rateLimitPerMin: 120,
        requestsCount: 4120,
        createdAt: '2026-07-01T00:00:00.000Z',
        lastUsedAt: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: 'key_edu_staging',
        name: 'Education Verifier API Staging Key',
        keyPrefix: 'prm_stg_441b',
        secretMasked: 'prm_stg_441b*******************99a1',
        departmentCode: 'EDU',
        tier: 'PRODUCTION_STAGING',
        rateLimitPerMin: 600,
        requestsCount: 18450,
        createdAt: '2026-08-10T00:00:00.000Z',
        lastUsedAt: new Date(Date.now() - 60000).toISOString(),
      },
    ];

    // 11. Grievance Tickets
    this.grievances = [
      {
        id: 'grv_01',
        trackingNumber: 'GRV-2026-09-00142',
        citizenName: 'Suresh Chandra',
        email: 'suresh.chandra@gmail.com',
        phone: '+91 98200 44556',
        departmentCode: 'REVENUE',
        category: 'Land Holding Proof Discrepancy',
        subject: 'Cadastral khatauni update reflection in ZK commitment',
        description: 'Recently consolidated 0.4 ha parcel in Tehsil Mohanlalganj, need the updated state root commitment refreshed.',
        status: 'UNDER_INVESTIGATION',
        createdAt: '2026-09-10T09:15:00.000Z',
        resolutionNote: 'CDC synchronization job scheduled for batch update at 00:00 IST.',
      },
    ];

    // 12. Initial live mesh transactions
    this.liveMeshTransactions = [
      { id: 'tx_1', sourceDept: 'REVENUE', targetDept: 'AGRI', predicateType: 'LAND_HOLDING_LE_2HA', sanNumber: 'SAN-2026-IND-883921', timestamp: new Date(Date.now() - 12000).toISOString(), status: 'VERIFIED', verificationLatencyMs: 142 },
      { id: 'tx_2', sourceDept: 'REVENUE', targetDept: 'AGRI', predicateType: 'INCOME_LE_250K', sanNumber: 'SAN-2026-IND-883921', timestamp: new Date(Date.now() - 11000).toISOString(), status: 'VERIFIED', verificationLatencyMs: 138 },
      { id: 'tx_3', sourceDept: 'EDU', targetDept: 'EDU', predicateType: 'MERIT_GE_75PCT', sanNumber: 'SAN-2026-IND-994102', timestamp: new Date(Date.now() - 40000).toISOString(), status: 'VERIFIED', verificationLatencyMs: 95 },
      { id: 'tx_4', sourceDept: 'REVENUE', targetDept: 'HEALTH', predicateType: 'INCOME_LE_250K', sanNumber: 'SAN-2026-IND-772159', timestamp: new Date(Date.now() - 65000).toISOString(), status: 'VERIFIED', verificationLatencyMs: 164 },
      { id: 'tx_5', sourceDept: 'IT_GOV', targetDept: 'REVENUE', predicateType: 'DOMICILE_UP_STATE', sanNumber: 'SAN-2026-IND-883921', timestamp: new Date(Date.now() - 90000).toISOString(), status: 'VERIFIED', verificationLatencyMs: 120 },
    ];
  }

  private seedAuditTrail() {
    const genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';
    let prev = genesisHash;

    const entries = [
      {
        action: 'GENESIS_BLOCK_INITIALIZED',
        actor: 'Sovereign Trust Anchor',
        role: 'SUPER_ADMIN' as const,
        target: 'PRAMAAN_NATIONAL_GRID',
        entityId: 'ROOT_ANCHOR_2026',
        payload: { authority: 'Government of India', standard: 'GIGW 3.0 / DPDP 2023', version: '2.4.0' },
        time: '2026-08-01T00:00:00.000Z',
      },
      {
        action: 'DEPARTMENT_ONBOARDED',
        actor: 'Dr. Arvind Narayanan',
        role: 'SUPER_ADMIN' as const,
        target: 'DEPARTMENT_NODE',
        entityId: 'dept_agri',
        payload: { code: 'AGRI', endpoints: 14, rootKeyAssigned: true },
        time: '2026-08-02T10:00:00.000Z',
      },
      {
        action: 'CDC_PIPELINE_ACTIVATED',
        actor: 'Rajesh Verma',
        role: 'OFFICIAL' as const,
        target: 'LEGACY_CONNECTOR',
        entityId: 'conn_agri_oracle',
        payload: { adapter: 'Oracle GoldenGate 23ai', batchSize: 5000 },
        time: '2026-08-05T14:20:00.000Z',
      },
      {
        action: 'CREDENTIAL_COMMITMENT_ANCHORED',
        actor: 'Department of Revenue & Land Records',
        role: 'OFFICIAL' as const,
        target: 'VERIFIABLE_CREDENTIAL',
        entityId: 'cred_ramesh_land',
        payload: { citizenId: 'cit_ramesh', commitment: '0x8f2d9e11c34a9b671a5500e23ef890a82b4512e038d17b4c6e9a0123f458129a' },
        time: '2026-09-01T08:00:00.000Z',
      },
      {
        action: 'APPLICATION_SUBMITTED_WITH_SAN',
        actor: 'Ramesh Kumar',
        role: 'CITIZEN' as const,
        target: 'APPLICATION',
        entityId: 'SAN-2026-IND-883921',
        payload: { scheme: 'PM-KISAN-SAMMAN', proofsCount: 2 },
        time: '2026-09-11T14:30:00.000Z',
      },
      {
        action: 'ZK_PREDICATE_PROOF_VERIFIED',
        actor: 'Verifier Node AGRI-DELHI-01',
        role: 'OFFICIAL' as const,
        target: 'ZK_PROOF',
        entityId: 'pred_land_LESS_THAN_OR_EQUAL',
        payload: { claimSatisfied: true, latencyMs: 142, singleUseRecorded: true },
        time: '2026-09-11T14:30:02.000Z',
      },
      {
        action: 'CONSENT_GRANTED',
        actor: 'Ramesh Kumar',
        role: 'CITIZEN' as const,
        target: 'CONSENT_GRANT',
        entityId: 'cst_01',
        payload: { recipient: 'AGRI', validityDays: 30, purpose: 'PM-KISAN Verification' },
        time: '2026-09-11T14:30:03.000Z',
      },
    ];

    this.auditLogs = entries.map((e, idx) => {
      const payloadDigest = crypto.createHash('sha256').update(JSON.stringify(e.payload)).digest('hex');
      const hash = computeAuditBlockHash(idx, e.time, e.action, e.actor, e.target, prev, payloadDigest);
      const entry: AuditLogEntry = {
        index: idx,
        timestamp: e.time,
        action: e.action,
        actor: e.actor,
        actorRole: e.role,
        targetEntity: e.target,
        entityId: e.entityId,
        sha256Hash: hash,
        previousHash: prev,
        payloadDigest,
        status: 'VALID',
      };
      prev = hash;
      return entry;
    });
  }

  public recordAuditLog(params: {
    action: string;
    actor: string;
    actorRole: 'CITIZEN' | 'OFFICIAL' | 'SUPER_ADMIN';
    targetEntity: string;
    entityId: string;
    payload: any;
  }): AuditLogEntry {
    const lastEntry = this.auditLogs[this.auditLogs.length - 1];
    const prevHash = lastEntry ? lastEntry.sha256Hash : '0000000000000000000000000000000000000000000000000000000000000000';
    const nextIndex = this.auditLogs.length;
    const timestamp = new Date().toISOString();
    const payloadDigest = crypto.createHash('sha256').update(JSON.stringify(params.payload)).digest('hex');
    const hash = computeAuditBlockHash(
      nextIndex,
      timestamp,
      params.action,
      params.actor,
      params.targetEntity,
      prevHash,
      payloadDigest
    );

    const entry: AuditLogEntry = {
      index: nextIndex,
      timestamp,
      action: params.action,
      actor: params.actor,
      actorRole: params.actorRole,
      targetEntity: params.targetEntity,
      entityId: params.entityId,
      sha256Hash: hash,
      previousHash: prevHash,
      payloadDigest,
      status: 'VALID',
    };

    this.auditLogs.push(entry);
    return entry;
  }

  public verifyEntireAuditChain(): {
    isChainValid: boolean;
    totalBlocksAudited: number;
    tamperedBlockIndex?: number;
    auditSummary: string;
  } {
    let expectedPrev = '0000000000000000000000000000000000000000000000000000000000000000';

    for (let i = 0; i < this.auditLogs.length; i++) {
      const block = this.auditLogs[i];

      // 1. Verify previous hash pointer
      if (block.previousHash !== expectedPrev) {
        return {
          isChainValid: false,
          totalBlocksAudited: i,
          tamperedBlockIndex: i,
          auditSummary: `Chain integrity violation at block #${i}. Previous hash pointer does not match expected hash of block #${i - 1}.`,
        };
      }

      // 2. Recompute current block's hash
      const recomputed = computeAuditBlockHash(
        block.index,
        block.timestamp,
        block.action,
        block.actor,
        block.targetEntity,
        block.previousHash,
        block.payloadDigest
      );

      if (recomputed !== block.sha256Hash) {
        return {
          isChainValid: false,
          totalBlocksAudited: i,
          tamperedBlockIndex: i,
          auditSummary: `Block content modification detected at block #${i}. Signature checksum does not match payload digest.`,
        };
      }

      expectedPrev = block.sha256Hash;
    }

    return {
      isChainValid: true,
      totalBlocksAudited: this.auditLogs.length,
      auditSummary: `All ${this.auditLogs.length} blocks verified cryptographically from Genesis block to Tip. Chain integrity 100% untampered.`,
    };
  }
}

export const db = new PramaanDatabase();
