import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

export async function getEvents(filters = {}) {
  let q = query(
    collection(db, "events"),
    where("status", "==", "approved"),
    orderBy("startDate", "asc"),
  );

  const snap = await getDocs(q);
  let events = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  //client side filter
  if (filters.category) {
    events = events.filter((e) => e.category === filters.category);
  }
  if (filters.city) {
    events = events.filter((e) =>
      e.city?.toLowerCase().includes(filters.city.toLowerCase()),
    );
  }
  if (filters.search) {
    events = events.filter(
      (e) =>
        e.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        e.description?.toLowerCase().includes(filters.search.toLowerCase()),
    );
  }
  return events;
}

//get single event by ID
export async function getEventById(id) {
  const snap = await getDoc(doc(db, "events", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}
