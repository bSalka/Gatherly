import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
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

//get EVENTS by organizer
export async function getOrganizerEvents(organizerId) {
  const q = query(
    collection(db, "events"),
    where("organizerId", "==", organizerId),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

//create new event
export async function createEvent(eventData, user) {
  const ref = await addDoc(collection(db, "events"), {
    ...eventData,
    organizerId: user.uid,
    organizerName: user.displayName || user.email,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

//update event
export async function updateEvent(eventId, eventData) {
  const ref = doc(db, "events", eventId);
  await updateDoc(ref, {
    ...eventData,
    updatedAt: serverTimestamp(),
  });
}

//delete event
export async function deleteEvent(eventId) {
  await deleteDoc(doc(db, "events", eventId));
}

//get ticket tiers for event
export async function getTicketTiers(eventId) {
  const q = query(
    collection(db, "events", eventId, "tickets"),
    orderBy("createdAt", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

//save ticket tiers for an event(
export async function saveTicketTiers(eventId, tiers) {
  const batch = writeBatch(db);

  //delete existing tiers
  const existing = await getTicketTiers(eventId);
  existing.forEach((tier) => {
    const ref = doc(db, "events", eventId, "tickets", tier.id);
    batch.delete(ref);
  });

  //add new tiers
  tiers.forEach((tier) => {
    const ref = doc(collection(db, "events", eventId, "tickets"));
    batch.set(ref, {
      name: tier.name,
      price: Number(tier.price),
      quantity: Number(tier.quantity),
      sold: 0,
      description: tier.description || "",
      createdAt: serverTimestamp(),
    });
  });

  await batch.commit();
}
