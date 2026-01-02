/**
 * Firebase Admin SDK for Server-Side Operations
 * Used by cron jobs and API routes that need server-side Firebase access
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App | null = null;
let adminDb: Firestore | null = null;

function getAdminApp(): App {
    if (adminApp) return adminApp;

    const existingApps = getApps();
    if (existingApps.length > 0) {
        adminApp = existingApps[0];
        return adminApp;
    }

    // Initialize with service account or default credentials
    // For Vercel, we use environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID || 'organizas';

    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        // If we have a service account key, use it
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        adminApp = initializeApp({
            credential: cert(serviceAccount),
            projectId,
        });
    } else {
        // Otherwise, initialize with just project ID (for local dev)
        adminApp = initializeApp({
            projectId,
        });
    }

    return adminApp;
}

export function getAdminDb(): Firestore {
    if (adminDb) return adminDb;

    adminDb = getFirestore(getAdminApp());
    return adminDb;
}
