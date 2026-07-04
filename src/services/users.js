import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";

//get all users
export async function getAllUsers() {
  const q = query(collection(db, "users"), orderBy("createdAt", "desc"));

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

//update user role
export async function setUserRole(uid, role) {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { role });
}
