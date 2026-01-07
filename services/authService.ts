import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider, db } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  console.log("Firebase user:", user);

  const userRef = doc(db, "users", user.uid);

  await setDoc(userRef, {
    uid: user.uid,
    name: user.displayName,
    email: user.email,
    photo: user.photoURL,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp()
  }, { merge: true });

  console.log("User written to Firestore");

  return user;
}

export async function logout() {
  await signOut(auth);
}
