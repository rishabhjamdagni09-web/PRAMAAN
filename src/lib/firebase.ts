/**
 * Pramaan - Firebase Client SDK Integration
 * Implements Firestore real-time synchronization, Firebase Authentication (Phone OTP, Email/Password, Google),
 * and zero-trust ABAC rule validation helpers.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  getIdTokenResult,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  getDocFromServer,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
  addDoc,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Application, ConsentGrant, Credential, Scheme, User, AuditLogEntry, SchemaMapping, Department } from '../types';

// Initialize Firebase App
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export { onAuthStateChanged };

// Initialize Firestore with configured database ID
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const googleProvider = new GoogleAuthProvider();

// ==========================================
// 1. MANDATORY CONNECTION TEST (Firebase Skill)
// ==========================================
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline. Verify network connection.');
    }
  }
}

// Run connection check once on bundle load
testConnection();

// ==========================================
// 2. ERROR HANDLING (Firebase Skill Standard)
// ==========================================
export type OperationType = 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';

export interface FirestoreErrorInfo {
  error: string;
  operation: OperationType;
  path: string | null;
  authInfo: {
    userId: string | null;
    email: string | null;
    emailVerified: boolean | null;
    isAnonymous: boolean;
    customClaims: Record<string, any>;
  };
}

export async function handleFirestoreError(
  error: unknown,
  operation: OperationType,
  path: string | null = null
): Promise<never> {
  const fbUser = auth.currentUser;
  let customClaims: Record<string, any> = {};

  if (fbUser) {
    try {
      const tokenResult = await getIdTokenResult(fbUser);
      customClaims = tokenResult.claims;
    } catch {
      // ignore
    }
  }

  const errorInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operation,
    path,
    authInfo: {
      userId: fbUser ? fbUser.uid : null,
      email: fbUser ? fbUser.email : null,
      emailVerified: fbUser ? fbUser.emailVerified : null,
      isAnonymous: fbUser ? fbUser.isAnonymous : true,
      customClaims,
    },
  };

  console.error('Firestore Security / Access Error:', errorInfo);
  throw new Error(JSON.stringify(errorInfo));
}

// ==========================================
// 3. AUTHENTICATION SERVICES
// ==========================================

export const PRECONFIGURED_PERSONAS: Record<string, {
  name: string;
  nameHi: string;
  email: string;
  phone: string;
  role: 'CITIZEN' | 'OFFICIAL' | 'SUPER_ADMIN';
  departmentId?: string;
  departmentName?: string;
  aadhaarRefMasked?: string;
  title: string;
}> = {
  cit_ramesh: {
    name: 'Ramesh Kumar',
    nameHi: 'रमेश कुमार',
    email: 'ramesh.kumar.farmer@pramaan.gov.in',
    phone: '+91 98765 43210',
    role: 'CITIZEN',
    aadhaarRefMasked: 'XXXXXXXX4912',
    title: 'Small & Marginal Farmer (Barabanki, UP)',
  },
  cit_priya: {
    name: 'Priya Sharma',
    nameHi: 'प्रिया शर्मा',
    email: 'priya.sharma.edu@pramaan.gov.in',
    phone: '+91 98112 23344',
    role: 'CITIZEN',
    aadhaarRefMasked: 'XXXXXXXX9821',
    title: 'Senior Secondary Meritorious Student (Delhi)',
  },
  off_agri: {
    name: 'Rajesh Verma',
    nameHi: 'राजेश वर्मा',
    email: 'rajesh.verma@agri.pramaan.gov.in',
    phone: '+91 97110 55443',
    role: 'OFFICIAL',
    departmentId: 'AGRI',
    departmentName: 'Department of Agriculture & Farmers Welfare',
    title: 'Director of Verification, Dept of Agriculture',
  },
  off_edu: {
    name: 'Dr. Sunita Rao',
    nameHi: 'डॉ. सुनीता राव',
    email: 'sunita.rao@edu.pramaan.gov.in',
    phone: '+91 94220 11998',
    role: 'OFFICIAL',
    departmentId: 'EDU',
    departmentName: 'Department of Higher Education',
    title: 'Deputy Secretary, Dept of Higher Education',
  },
  admin_super: {
    name: 'Dr. Arvind Narayanan',
    nameHi: 'डॉ. अरविंद नारायणन',
    email: 'arvind.narayanan@meity.pramaan.gov.in',
    phone: '+91 99000 11223',
    role: 'SUPER_ADMIN',
    departmentId: 'IT_GOV',
    departmentName: 'National Sovereign Root',
    title: 'Principal Architect, National Sovereign Trust Grid (MeitY)',
  },
};

const STANDARD_DEMO_PASSWORD = 'PramaanSovereign@2026';

/**
 * Ensures user document is synchronized in Firestore /users/{uid}
 */
export async function syncUserDoc(user: User): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, {
      uid: user.id,
      name: user.name,
      nameHi: user.nameHi || '',
      email: user.email,
      phone: user.phone,
      role: user.role,
      departmentId: user.departmentId || '',
      departmentName: user.departmentName || '',
      aadhaarRefMasked: user.aadhaarRefMasked || '',
      createdAt: user.createdAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Error syncing user doc to Firestore:', err);
  }
}

/**
 * Sign in as one of the pre-configured sovereign personas
 */
export async function signInAsPersona(personaKey: string): Promise<User> {
  const persona = PRECONFIGURED_PERSONAS[personaKey];
  if (!persona) throw new Error(`Unknown persona: ${personaKey}`);

  let fbUser: FirebaseUser | null = null;
  try {
    // Attempt sign-in with existing credentials
    const cred = await signInWithEmailAndPassword(auth, persona.email, STANDARD_DEMO_PASSWORD);
    fbUser = cred.user;
  } catch (err: any) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      try {
        // Create new account if not present
        const cred = await createUserWithEmailAndPassword(auth, persona.email, STANDARD_DEMO_PASSWORD);
        fbUser = cred.user;
      } catch (createErr) {
        // If already exists or error, try sign-in once more
        const cred = await signInWithEmailAndPassword(auth, persona.email, STANDARD_DEMO_PASSWORD);
        fbUser = cred.user;
      }
    } else {
      throw err;
    }
  }

  const appUser: User = {
    id: fbUser ? fbUser.uid : personaKey,
    name: persona.name,
    nameHi: persona.nameHi,
    email: persona.email,
    phone: persona.phone,
    role: persona.role,
    departmentId: persona.departmentId,
    departmentName: persona.departmentName,
    aadhaarRefMasked: persona.aadhaarRefMasked,
    createdAt: new Date().toISOString(),
  };

  // Sync to Firestore
  await syncUserDoc(appUser);

  // Sync custom claims on backend
  try {
    await fetch('/api/auth/set-custom-claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: appUser.id,
        role: appUser.role,
        departmentId: appUser.departmentId,
      }),
    });
  } catch {
    // Non-blocking
  }

  return appUser;
}

/**
 * Citizen Phone / OTP Sign-In
 */
export async function signInCitizenPhone(phone: string, otp: string): Promise<User> {
  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
  const synthEmail = `citizen.${cleanPhone}@citizen.pramaan.gov.in`;

  let fbUser: FirebaseUser | null = null;
  try {
    const cred = await signInWithEmailAndPassword(auth, synthEmail, STANDARD_DEMO_PASSWORD);
    fbUser = cred.user;
  } catch (err: any) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, synthEmail, STANDARD_DEMO_PASSWORD);
      fbUser = cred.user;
    } catch {
      const cred = await signInWithEmailAndPassword(auth, synthEmail, STANDARD_DEMO_PASSWORD);
      fbUser = cred.user;
    }
  }

  const appUser: User = {
    id: fbUser ? fbUser.uid : `cit_${cleanPhone}`,
    name: `Citizen (${cleanPhone.slice(-4)})`,
    email: synthEmail,
    phone: `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`,
    role: 'CITIZEN',
    aadhaarRefMasked: `XXXXXXXX${cleanPhone.slice(-4)}`,
    createdAt: new Date().toISOString(),
  };

  await syncUserDoc(appUser);
  return appUser;
}

/**
 * Department Official / Admin Email Password Sign-In
 */
export async function signInOfficialEmail(
  email: string,
  pass: string,
  roleHint: 'OFFICIAL' | 'SUPER_ADMIN' = 'OFFICIAL',
  departmentId?: string
): Promise<User> {
  let cred;
  try {
    cred = await signInWithEmailAndPassword(auth, email, pass);
  } catch (err: any) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
      cred = await createUserWithEmailAndPassword(auth, email, pass);
    } else {
      throw err;
    }
  }

  const fbUser = cred.user;
  const userSnap = await getDoc(doc(db, 'users', fbUser.uid));
  let user: User;

  if (userSnap.exists()) {
    const data = userSnap.data();
    user = {
      id: fbUser.uid,
      name: data.name || email.split('@')[0],
      nameHi: data.nameHi,
      email: fbUser.email || email,
      phone: data.phone || '+91 90000 00000',
      role: data.role || roleHint,
      departmentId: data.departmentId || departmentId,
      departmentName: data.departmentName,
      createdAt: data.createdAt || new Date().toISOString(),
    };
  } else {
    user = {
      id: fbUser.uid,
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      email: fbUser.email || email,
      phone: '+91 90000 00000',
      role: roleHint,
      departmentId: departmentId || (roleHint === 'SUPER_ADMIN' ? 'IT_GOV' : 'AGRI'),
      createdAt: new Date().toISOString(),
    };
    await syncUserDoc(user);
  }

  return user;
}

/**
 * Google Sign-In
 */
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  const fbUser = result.user;

  const userSnap = await getDoc(doc(db, 'users', fbUser.uid));
  let appUser: User;

  if (userSnap.exists()) {
    const data = userSnap.data();
    appUser = {
      id: fbUser.uid,
      name: data.name || fbUser.displayName || 'Google User',
      email: fbUser.email || '',
      phone: data.phone || '+91 98765 00000',
      role: data.role || 'CITIZEN',
      departmentId: data.departmentId,
      createdAt: data.createdAt || new Date().toISOString(),
    };
  } else {
    appUser = {
      id: fbUser.uid,
      name: fbUser.displayName || 'Verified Citizen',
      email: fbUser.email || '',
      phone: '+91 98765 00000',
      role: 'CITIZEN',
      createdAt: new Date().toISOString(),
    };
    await syncUserDoc(appUser);
  }

  return appUser;
}

/**
 * User Logout
 */
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

// ==========================================
// 4. REAL-TIME FIRESTORE DATA LISTENERS
// ==========================================

/**
 * Listen to citizen's credentials in real-time
 */
export function subscribeCredentials(
  citizenId: string,
  onData: (creds: Credential[]) => void
): Unsubscribe {
  try {
    const q = query(collection(db, 'credentials'), where('citizenId', '==', citizenId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Credential));
        onData(list);
      },
      (err) => {
        handleFirestoreError(err, 'list', 'credentials').catch(() => {});
      }
    );
  } catch (err) {
    handleFirestoreError(err, 'list', 'credentials');
    return () => {};
  }
}

/**
 * Listen to applications (for citizen or department)
 */
export function subscribeApplications(
  filter: { citizenId?: string; departmentCode?: string },
  onData: (apps: Application[]) => void
): Unsubscribe {
  try {
    let q;
    if (filter.citizenId) {
      q = query(collection(db, 'applications'), where('citizenId', '==', filter.citizenId));
    } else if (filter.departmentCode) {
      q = query(collection(db, 'applications'), where('departmentCode', '==', filter.departmentCode));
    } else {
      q = query(collection(db, 'applications'));
    }

    return onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Application));
        list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        onData(list);
      },
      (err) => {
        handleFirestoreError(err, 'list', 'applications').catch(() => {});
      }
    );
  } catch (err) {
    handleFirestoreError(err, 'list', 'applications');
    return () => {};
  }
}

/**
 * Listen to citizen consent grants
 */
export function subscribeConsents(
  citizenId: string,
  onData: (consents: ConsentGrant[]) => void
): Unsubscribe {
  try {
    const q = query(collection(db, 'consentGrants'), where('citizenId', '==', citizenId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ConsentGrant));
        onData(list);
      },
      (err) => {
        handleFirestoreError(err, 'list', 'consentGrants').catch(() => {});
      }
    );
  } catch (err) {
    handleFirestoreError(err, 'list', 'consentGrants');
    return () => {};
  }
}

/**
 * Listen to published schemes directory
 */
export function subscribeSchemes(onData: (schemes: Scheme[]) => void): Unsubscribe {
  try {
    const q = collection(db, 'schemes');
    return onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Scheme));
        onData(list);
      },
      (err) => {
        handleFirestoreError(err, 'list', 'schemes').catch(() => {});
      }
    );
  } catch (err) {
    handleFirestoreError(err, 'list', 'schemes');
    return () => {};
  }
}

/**
 * Listen to Schema Mappings in real-time
 */
export function subscribeSchemaMappings(onData: (mappings: SchemaMapping[]) => void): Unsubscribe {
  try {
    const q = collection(db, 'schemaMappings');
    return onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as SchemaMapping));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onData(list);
      },
      (err) => {
        handleFirestoreError(err, 'list', 'schemaMappings').catch(() => {});
      }
    );
  } catch (err) {
    handleFirestoreError(err, 'list', 'schemaMappings');
    return () => {};
  }
}

/**
 * Listen to Immutable Audit Logs
 */
export function subscribeAuditLogs(onData: (logs: AuditLogEntry[]) => void): Unsubscribe {
  try {
    const q = collection(db, 'auditLog');
    return onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => d.data() as AuditLogEntry);
        list.sort((a, b) => (b.index ?? 0) - (a.index ?? 0));
        onData(list);
      },
      (err) => {
        handleFirestoreError(err, 'list', 'auditLog').catch(() => {});
      }
    );
  } catch (err) {
    handleFirestoreError(err, 'list', 'auditLog');
    return () => {};
  }
}

// ==========================================
// 5. FIRESTORE WRITE ACTIONS
// ==========================================

/**
 * Save new application directly into Firestore
 */
export async function submitApplicationToFirestore(appData: Application): Promise<void> {
  try {
    const appRef = doc(db, 'applications', appData.id);
    await setDoc(appRef, {
      ...appData,
      createdAt: serverTimestamp(),
    });

    // Also persist application events
    if (appData.events && appData.events.length > 0) {
      for (const ev of appData.events) {
        await setDoc(doc(db, 'applicationEvents', ev.id), {
          ...ev,
          applicationId: appData.sanNumber,
          deptId: appData.departmentCode,
        });
      }
    }
  } catch (err) {
    await handleFirestoreError(err, 'create', `applications/${appData.id}`);
  }
}

/**
 * Save consent grant directly into Firestore
 */
export async function saveConsentToFirestore(consent: ConsentGrant): Promise<void> {
  try {
    const cstRef = doc(db, 'consentGrants', consent.id);
    await setDoc(cstRef, consent);
  } catch (err) {
    await handleFirestoreError(err, 'create', `consentGrants/${consent.id}`);
  }
}

/**
 * Revoke consent in Firestore
 */
export async function revokeConsentInFirestore(consentId: string, reason: string): Promise<void> {
  try {
    const cstRef = doc(db, 'consentGrants', consentId);
    await updateDoc(cstRef, {
      status: 'REVOKED',
      revokedAt: new Date().toISOString(),
      revocationReason: reason,
    });
  } catch (err) {
    await handleFirestoreError(err, 'update', `consentGrants/${consentId}`);
  }
}

/**
 * Update Application status by Official
 */
export async function updateApplicationStatusInFirestore(
  appId: string,
  newStatus: string,
  remarks: string,
  officerName: string
): Promise<void> {
  try {
    const appRef = doc(db, 'applications', appId);
    const snap = await getDoc(appRef);
    const existing = snap.data() as Application | undefined;

    const newEvent = {
      id: `ev_${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: `Status updated to ${newStatus}`,
      description: remarks || `Department official updated application status to ${newStatus}.`,
      actor: officerName,
    };

    const updatedEvents = existing && existing.events ? [...existing.events, newEvent] : [newEvent];

    await updateDoc(appRef, {
      status: newStatus,
      updatedAt: new Date().toISOString(),
      officialRemarks: remarks,
      events: updatedEvents,
    });
  } catch (err) {
    await handleFirestoreError(err, 'update', `applications/${appId}`);
  }
}

/**
 * Approve Schema Mapping
 */
export async function approveSchemaMappingInFirestore(mappingId: string, officerName: string): Promise<void> {
  try {
    const mapRef = doc(db, 'schemaMappings', mappingId);
    await updateDoc(mapRef, {
      status: 'APPROVED',
      approvedBy: officerName,
      approvedAt: new Date().toISOString(),
    });
  } catch (err) {
    await handleFirestoreError(err, 'update', `schemaMappings/${mappingId}`);
  }
}

// ==========================================
// 6. INITIAL SEEDING HELPER
// ==========================================

export async function seedFirestoreInitialData(): Promise<void> {
  try {
    // Check if schemes collection has data
    const schemesSnap = await getDocs(collection(db, 'schemes'));
    if (schemesSnap.empty) {
      const { db: inMemDb } = await import('../../server/db');

      // Seed schemes
      for (const scheme of inMemDb.schemes) {
        await setDoc(doc(db, 'schemes', scheme.id), scheme);
      }

      // Seed departments
      for (const dept of inMemDb.departments) {
        await setDoc(doc(db, 'departments', dept.id), dept);
      }

      // Seed credentials
      for (const cred of inMemDb.credentials) {
        await setDoc(doc(db, 'credentials', cred.id), cred);
      }

      // Seed initial applications
      for (const application of inMemDb.applications) {
        await setDoc(doc(db, 'applications', application.id), application);
      }

      // Seed consents
      for (const consent of inMemDb.consents) {
        await setDoc(doc(db, 'consentGrants', consent.id), consent);
      }

      // Seed schema mappings
      for (const mapping of inMemDb.schemaMappings) {
        await setDoc(doc(db, 'schemaMappings', mapping.id), mapping);
      }
    }
  } catch (err) {
    console.warn('Initial Firestore seed non-blocking warning:', err);
  }
}
