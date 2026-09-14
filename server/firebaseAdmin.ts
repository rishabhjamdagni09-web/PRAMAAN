/**
 * Sovereign Backend Firebase Admin SDK Initialization
 * Handles server-side custom claims, tamper-evident audit ledger writes,
 * and cryptographic proof validations.
 */

import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase Admin App
const adminApp = getApps().length
  ? getApps()[0]
  : initializeApp({
      projectId: firebaseConfig.projectId,
    });

export const adminAuth = getAuth(adminApp);

// Named database instance
let firestoreInstance: ReturnType<typeof getFirestore> | null = null;
try {
  if (firebaseConfig.firestoreDatabaseId) {
    firestoreInstance = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId);
  } else {
    firestoreInstance = getFirestore(adminApp);
  }
} catch (e) {
  console.warn('Admin Firestore init fallback:', e);
  try {
    firestoreInstance = getFirestore(adminApp);
  } catch (e2) {
    console.error('Failed to init admin firestore:', e2);
  }
}

export const adminDb = firestoreInstance;

/**
 * Assign custom claims to a Firebase Auth user
 */
export async function setUserRoleClaims(
  uid: string,
  role: 'CITIZEN' | 'OFFICIAL' | 'SUPER_ADMIN',
  departmentId?: string
) {
  if (!adminAuth) return;
  try {
    const claims: Record<string, any> = {
      role,
      citizen: role === 'CITIZEN',
      official: role === 'OFFICIAL',
      admin: role === 'SUPER_ADMIN',
    };
    if (departmentId) {
      claims.departmentId = departmentId;
    }
    await adminAuth.setCustomUserClaims(uid, claims);
  } catch (err) {
    console.error(`Failed setting custom claims for ${uid}:`, err);
  }
}
