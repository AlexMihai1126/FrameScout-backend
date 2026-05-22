import { initializeApp, getApps } from "firebase-admin/app";
import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";

import serviceAccount from "../../serviceAccountKey.json";

const firebaseApp =
  getApps().length === 0
    ? initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      })
    : getApps()[0];

export const firebaseAuth = getAuth(firebaseApp);