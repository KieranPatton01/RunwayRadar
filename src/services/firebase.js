/*
 * Initializes Firebase Authentication and provides helper functions.
 * Dependencies: firebase/app, firebase/auth.
 */

import { initializeApp } from 'firebase/app'
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'


const firebaseConfig = {
  apiKey:     import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:  import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId:      import.meta.env.VITE_FIREBASE_APP_ID
}


const app = initializeApp(firebaseConfig)


export const auth = getAuth(app)




export async function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}


export async function logout() {
  return signOut(auth)
}


export async function getIdToken() {
  const user = auth.currentUser
  if (!user) return null
  return user.getIdToken()
}


export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback)
}

export default app
