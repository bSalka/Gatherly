import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getOrganizerEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getTicketTiers,
  saveTicketTiers,
} from "../services/events";
import TicketTierManager from "../components/TicketTierManager";

const CATEGORIES = [
  { value: "music", label: " Muzika" },
  { value: "sports", label: " Sport" },
  { value: "festival", label: "Festival" },
  { value: "art", label: " Kultura" },
  { value: "tech", label: " Tech" },
  { value: "other", label: " Ostalo" },
];

const emptyForm = {
  title: "",
  description: "",
  category: "",
  city: "",
  address: "",
  bannerURL: "",
  startDate: "",
  endDate: "",
  tiers: [],
};

//check if event is in the past
function isPastEvent(timestamp) {
  if (!timestamp) return false;
  const date = timestamp.toDate
    ? timestamp.toDate()
    : timestamp.seconds
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);
  return date < new Date();
}

function formatDate(timestamp) {
  if (!timestamp) return "-";
  try {
    const date = timestamp.toDate
      ? timestamp.toDate()
      : timestamp.seconds
        ? new Date(timestamp.seconds * 1000)
        : new Date(timestamp);
    const months = [
      "jan",
      "feb",
      "mar",
      "apr",
      "maj",
      "jun",
      "jul",
      "aug",
      "sep",
      "okt",
      "nov",
      "dec",
    ];
    return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`;
  } catch {
    return "-";
  }
}

const STATUS_STYLES = {
  pending:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  approved:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  rejected: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300",
  cancelled: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
  finished: "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500",
};

const STATUS_LABELS = {
  pending: "Na čekanju",
  approved: "Odobren",
  rejected: "Odbijen",
  cancelled: "Otkazano",
  finished: "Završeno",
};

export default function Organizer() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const modalRef = useRef(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      closeForm();
    }
  }

  async function fetchEvents() {
    try {
      setLoading(true);
      const data = await getOrganizerEvents(user.uid);
      setEvents(data);
    } catch (err) {
      console.error(err);
      setError("Greška pri učitavanju događaja.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function openCreate() {
    setEditingEvent(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  async function openEdit(event) {
    setEditingEvent(event);

    const toInput = (ts) => {
      if (!ts) return "";
      if (ts.toDate) return ts.toDate().toISOString().slice(0, 16);
      if (ts.seconds)
        return new Date(ts.seconds * 1000).toISOString().slice(0, 16);
      return new Date(ts).toISOString().slice(0, 16);
    };
    const existingTiers = await getTicketTiers(event.id);

    console.log("EVENT", event);
    console.log("TIERS", existingTiers);

    setForm({
      title: event.title || "",
      description: event.description || "",
      category: event.category || "music",
      city: event.city || "",
      address: event.address || "",
      bannerURL: event.bannerURL || "",
      startDate: toInput(event.startDate),
      endDate: toInput(event.endDate),
      tiers: existingTiers.map((t) => ({
        id: t.id,
        name: t.name || "",
        price: t.price ?? "",
        quantity: t.quantity ?? "",
        description: t.description || "",
        sold: t.sold || 0,
        // FIXED: if maxPerUser is somehow a Timestamp, convert to null
        maxPerUser:
          t.maxPerUser && typeof t.maxPerUser === "number" ? t.maxPerUser : "",
      })),
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingEvent(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) return setError("Naslov je obavezan.");
    if (!form.description.trim()) return setError("opis je obavezan.");
    if (!form.city.trim()) return setError("Grad je obavezan.");
    if (!form.startDate) return setError("Datum početka je obavezan.");

    //validate tiers
    const validTiers = form.tiers.filter(
      (t) => t.name && t.price !== "" && t.quantity,
    );

    const price =
      validTiers.length > 0
        ? Math.min(...validTiers.map((t) => Number(t.price)))
        : 0;

    const eventData = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      city: form.city.trim(),
      address: form.address.trim(),
      bannerURL: form.bannerURL.trim(),
      startDate: new Date(form.startDate),
      endDate: form.endDate ? new Date(form.endDate) : null,
      price,
    };

    try {
      setSubmitting(true);
      let eventId;
      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData);
        eventId = editingEvent.id;
        setSuccess("Događaj uspješno ažuriran");
      } else {
        eventId = await createEvent(eventData, user);
        setSuccess("Događaj kreiran! Čeka odobrenje admina.");
      }

      await saveTicketTiers(eventId, validTiers);

      await fetchEvents();
      setTimeout(() => {
        closeForm();
        setSuccess("");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Greška pri čuvanju događaja. Pokušajte ponovo.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(eventId) {
    try {
      await deleteEvent(eventId);
      setEvents(events.filter((e) => e.id !== eventId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      setError("Greška pri brisanju događaja");
    }
  }

  const total = events.length;
  const approved = events.filter((e) => e.status === "approved").length;
  const pending = events.filter((e) => e.status === "pending").length;
  const rejected = events.filter((e) => e.status === "rejected").length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/*Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Organizator panel</h1>
          <p className="text-secondary text-sm mt-0.5">
            Upravljajte vašim događajima
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 btn-primary
        "
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Novi događaj
        </button>
      </div>

      {/*Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Ukupno", value: total, color: "text-primary" },
          {
            label: "Odobreni",
            value: approved,
            color: "text-green-600 dark:text-green-400",
          },
          {
            label: "Na čekanju",
            value: pending,
            color: "text-yellow-600 dark:text-yellow-400",
          },
          {
            label: "Odbijeni",
            value: rejected,
            color: "text-red-600 dark:text-red-400",
          },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className={`text-xs text-muted mt-0.5`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/*Global error */}
      {error && !showForm && <div className="alert-error mb-4 ">{error}</div>}

      {/*Event form modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center
        justify-center p-4"
          onClick={handleBackdropClick}
        >
          <div
            className="card w-full max-w-lg max-h-[90vh]
           overflow-y-auto"
          >
            {/*Modal header */}
            <div
              className="flex items-center justify-between p-6 border-b
            border-gray-100 dark:border-gray-700"
            >
              <h2 className="text-lg font-semibold text-primary">
                {editingEvent ? "Uredi događaj" : "Novi događaj"}
              </h2>
              <button
                onClick={closeForm}
                className="text-muted hover:text-gray-600
                transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/*Modal body*/}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="alert-error">{error}</div>}
              {success && <div className="alert-success">{success}</div>}

              {/*Title */}
              <div>
                <label className="text-label">Naziv događaja *</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="npr. Koncert"
                  disabled={submitting}
                  className="input"
                />
              </div>

              {/*Description */}
              <div>
                <label className="text-label">Opis*</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Opišite događaj..."
                  rows={3}
                  disabled={submitting}
                  className="input resize-none"
                ></textarea>
              </div>

              {/*Category and city */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label">Kategorija</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    disabled={submitting}
                    className="input-select disabled:bg-gray-50"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-label">Grad*</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="npr. Sarajevo"
                    disabled={submitting}
                    className="input"
                  />
                </div>
              </div>

              {/*address */}
              <div>
                <label className="text-label">Adresa mjesta održavanja</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="npr. Ferhadija 1, Sarajevo"
                  disabled={submitting}
                  className="input"
                />
              </div>

              {/*Start & end date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label">Datum početka *</label>
                  <input
                    name="startDate"
                    type="datetime-local"
                    value={form.startDate}
                    onChange={handleChange}
                    disabled={submitting}
                    className="input"
                  />
                </div>

                <div>
                  <label className="text-label">Datum završetka</label>
                  <input
                    name="endDate"
                    type="datetime-local"
                    value={form.endDate}
                    onChange={handleChange}
                    disabled={submitting}
                    className="input"
                  />
                </div>
              </div>

              {/*Banneer URL */}
              <div>
                <label className="text-label">URL slike za banner</label>
                <input
                  name="bannerURL"
                  value={form.bannerURL}
                  onChange={handleChange}
                  placeholder="https://images.banner.com/..."
                  disabled={submitting}
                  className="input"
                />

                {/*Preview */}
                {form.bannerURL && (
                  <img
                    src={form.bannerURL}
                    alt="Preview"
                    onError={(e) => (e.target.style.display = "none")}
                    className="mt-2 h-24 w-full object-cover rounded-lg"
                  />
                )}
              </div>

              {/*Ticket tiers */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Vrste karata
                </label>
                <TicketTierManager
                  tiers={form.tiers}
                  onChange={(tiers) => setForm({ ...form, tiers })}
                />
              </div>

              {/*Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={submitting}
                  className="btn-secondary py-2.5 flex-1 text-sm disabled:opacity-50"
                >
                  Odustani
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1"
                >
                  {submitting
                    ? "Čuvanje..."
                    : editingEvent
                      ? "Sačuvaj izmjene"
                      : "Kreiraj događaj"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/*Events list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 border border-gray-200
              dark:border-gray-700 rounded-2xl p-4
              animate-pulse flex gap-4"
            >
              <div
                className="w-20 h-16 bg-gray-200 dark:bg-gray-700
               rounded-xl shrink-0"
              />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                <div className="h-3 bg-gray-100  dark:bg-gray-700 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div
          className="text-center py-16 bg-white dark:bg-gray-800 border border-gray-200
        dark:border-gray-700 rounded-2xl"
        >
          <div className="text-5xl mb-3">📭</div>
          <h3 className="text-primary font-semibold mb-1">Nemate događaja </h3>
          <p className="text-secondary text-sm mb-4">
            Kreirajte vaš prvi događaj
          </p>
          <button onClick={openCreate} className="btn-primary">
            Kreiraj događaj
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const past = isPastEvent(event.startDate);

            return (
              <div
                key={event.id}
                className={`bg-white dark:bg-gray-800 border
                               border-gray-200 dark:border-gray-700
                               rounded-2xl p-4 flex gap-4 items-center
                               ${past ? "opacity-50" : ""}`}
              >
                {/*Banner thumbnail */}
                <div className="w-20 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0">
                  {event.bannerURL ? (
                    <img
                      src={event.bannerURL}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center
                    justify-center text-muted text-2xl"
                    >
                      🎉
                    </div>
                  )}
                </div>

                {/*Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h3 className="font-medium text-primary text-sm truncate">
                      {event.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0
                    ${
                      past
                        ? STATUS_STYLES.finished
                        : STATUS_STYLES[event.status] || STATUS_STYLES.pending
                    }`}
                    >
                      {past
                        ? STATUS_LABELS.finished
                        : STATUS_LABELS[event.status] || "Na čekanju"}
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    {event.city} · {formatDate(event.startDate)} ·{" "}
                    {event.price === 0 ? "Besplatno" : `${event.price} KM`}
                  </p>
                </div>

                {/*Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {!past && (
                    <button
                      onClick={() => openEdit(event)}
                      className="btn-secondary px-3 py-1.5 text-xs"
                    >
                      Uredi
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteConfirm(event.id)}
                    className="text-xs border border-red-200 dark:border-red-700
                  text-red-500 dark:text-red-400 px-3 py-1.5
                  rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  >
                    Obriši
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/*Confirm delete modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center
        justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteConfirm(null);
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-primary mb-2">
              Obrisati događaj
            </h3>
            <p className="text-sm text-secondary mb-5">
              Ova akcija se ne može poništiti.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary flex-1 py-2.5 text-sm "
              >
                Odustani
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl
                text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Obriši
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
