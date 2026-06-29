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
  runTransaction,
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

//booking using transactiion to prevent overselling
export async function createBooking({ user, event, tier, quantity }) {
  const bookingRef = doc(collection(db, "bookings"));

  // Free event — no tier to decrement
  if (tier.id === "free") {
    await runTransaction(db, async (transaction) => {
      transaction.set(bookingRef, {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || user.email,
        eventId: event.id,
        eventTitle: event.title,
        eventCity: event.city,
        eventAddress: event.address || "",
        eventStart: event.startDate,
        tierId: "free",
        tierName: "Besplatan ulaz",
        tierPrice: 0,
        quantity: 1,
        totalPrice: 0,
        status: "confirmed",
        createdAt: serverTimestamp(),
      });
    });
    return bookingRef.id;
  }

  // Paid event — decrement stock
  const tierRef = doc(db, "events", event.id, "tickets", tier.id);

  await runTransaction(db, async (transaction) => {
    const tierSnap = await transaction.get(tierRef);
    if (!tierSnap.exists()) throw new Error("Karta ne postoji.");

    const tierData = tierSnap.data();
    const available = tierData.quantity - (tierData.sold || 0);

    if (available < quantity) {
      throw new Error(`Nema dovoljno karata. Dostupno: ${available}`);
    }

    transaction.update(tierRef, {
      sold: (tierData.sold || 0) + quantity,
    });

    transaction.set(bookingRef, {
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName || user.email,
      eventId: event.id,
      eventTitle: event.title,
      eventCity: event.city,
      eventAddress: event.address || "",
      eventStart: event.startDate,
      tierId: tier.id,
      tierName: tier.name,
      tierPrice: tier.price,
      quantity,
      totalPrice: tier.price * quantity,
      status: "confirmed",
      createdAt: serverTimestamp(),
    });
  });

  return bookingRef.id;
}

//get booking for user
export async function getUserBookings(userId) {
  const q = query(
    collection(db, "bookings"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
