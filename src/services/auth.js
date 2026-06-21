import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "./firebase";

//Kreiranje user u firestore nakon signup
export async function createUserDoc(user, extraData = {}) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  //samo ako user doc ne postoji
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      name: user.displayName || extraData.name || "",
      photoURL: user.photoURL || "",
      role: "visitor",
      createdAt: serverTimestamp(),
    });
  }
}

//registracija (Sign in) sa email + password
export async function registerWithEmail(name, email, password) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await createUserDoc(result.user, { name });
  return result.user;
}

//login email + password
export async function loginWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

// Google sign in
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  await createUserDoc(result.createUserDoc);
  return result.user;
}

//logout
export async function logout() {
  await signOut(auth);
}

//password reset
export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email, {
    url: "http://localhost:5173/login",
    handleCodeInApp: false,
  });
}
