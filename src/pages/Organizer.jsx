import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getOrganizerEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../services/events";

const CATEGORIES = [
  { value: "music", label: " Muzika" },
  { value: "sports", label: " Sport" },
  { value: "food", label: " Hrana" },
  { value: "art", label: " Umjetnost" },
  { value: "tech", label: " Tech" },
  { value: "other", label: " Ostalo" },
];

const emptyForm = {
  title: "",
  description: "",
  category: "",
  city: "",
  price: "",
  bannerURL: "",
  startDate: "",
  endDate: "",
};

function formatDate(timestamp) {
  if (!timestamp) return "-";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("bs-BA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
  cancelled: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS = {
  pending: "Na čekanju",
  approved: "Odobren",
  rejected: "Odbijen",
  cancelled: "Otkazano",
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

  useEffect(() => {
    fetchEvents();
  }, []);

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

  function openEdit(event) {
    setEditingEvent(event);

    //firestore timestamp to local datetime format
    const toInput = (ts) => {
      if (!ts) return "";
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toISOString().slice(0, 16);
    };
    setForm({
      title: event.title || "",
      description: event.description || "",
      category: event.category || "music",
      city: event.city || "",
      price: event.price || "",
      bannerURL: event.bannerURL || "",
      startDate: toInput(event.startDate),
      endDate: toInput(event.endDate),
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

    //validacija
    if (!form.title.trim()) return setError("Naslov je obavezan.");
    if (!form.description.trim()) return setError("opis je obavezan.");
    if (!form.city.trim()) return setError("Grad je obavezan.");
    if (!form.startDate) return setError("Datum početka je obavezan.");
    if (form.price === "")
      return setError("Cijena je obavezna (0 za besplatno).");

    const eventData = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      city: form.city.trim(),
      price: Number(form.price),
      bannerURL: form.bannerURL.trim(),
      startDate: new Date(form.startDate),
      endDate: form.endDate ? new Date(form.endDate) : null,
    };

    try {
      setSubmitting(true);
      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData);
        setSuccess("Događaj uspješno ažuriran");
      } else {
        await createEvent(eventData, user);
        setSuccess("Događaj kreiran! Čeka odobrenje admina.");
      }
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

  //Stats
  const total = events.length;
  const approved = events.filter((e) => e.status === "approved").length;
  const pending = events.filter((e) => e.status === "pending").length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/*Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Moji događaji</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Upravljajte vašim događajima
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 text-white
          px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors
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
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Ukupno", value: total, color: "text-gray-900" },
          { label: "Odobreni", value: approved, color: "text-green-600" },
          { label: "Na čekanju", value: pending, color: "text-yellow-600" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-gray-200 rounded-2xl p-4"
          >
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className={`text-xs text-gray-500 mt-0.5`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/*Global error */}
      {error && !showForm && (
        <div
          className="bg-red-50 border border-red-200 text-red-600 rounded-xl
        px-4 py-3 mb-4 text-sm"
        >
          {error}
        </div>
      )}

      {/*Event form modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center
        justify-center p-4"
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh]
           overflow-y-auto"
          >
            {/*Modal header */}
            <div
              className="flex items-center justify-between p-6 border-b
            border-gray-100"
            >
              <h2 className="text-lg font-semibold text-gray-900">
                {editingEvent ? "Uredi događaj" : "Novi događaj"}
              </h2>
              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-gray-600"
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
              {error && (
                <div
                  className="bg-red-50 border border-red-200 text-red-600
              rounded-lg px-3 py-2.5 text-sm"
                >
                  {error}
                </div>
              )}
              {success && (
                <div
                  className="bg-green-50 border border-green-200
              text-green-700 rounded-lg px-3 py-2.5 text-sm"
                >
                  {success}
                </div>
              )}

              {/*Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Naziv događaja *
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="npr. Food Festival Sarajevo"
                  disabled={submitting}
                  className="w-full border border-gray-300 rounded-xl px-4
                py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                 focus:border-transparent disabled:bg-gray-50"
                />
              </div>

              {/*Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opis*
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Opišite događaj..."
                  rows={3}
                  disabled={submitting}
                  className="w-full border border-gray-300 rounded-xl px-4
                 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                 focus:border-transparent disabled:bg-gray-50 resize-none"
                ></textarea>
              </div>

              {/*Category and city */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategorija
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full border border-gray-300 rounded-xl px-4
                    py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                  bg-white disabled:bg-gray-50"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grad*
                  </label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="npr. Sarajevo"
                    disabled={submitting}
                    className="w-full border border-gray-300 rounded-xl px-4
                    py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                    focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Datum početka *
                  </label>
                  <input
                    name="startDate"
                    type="datetime-local"
                    value={form.startDate}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full border border-gray-300 rounded-xl 
                    px-4 py-2.5 text-sm focus:outline-none focus:ring-2
                    focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Datum završetka
                  </label>
                  <input
                    name="endDate"
                    type="datetime-local"
                    value={form.endDate}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5
                    text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                    focus:border-transparent disabled:bg-gray-50"
                  />
                </div>
              </div>

              {/*Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cijena (KM) * - unesite 0 (nulu) za besplatan događaj
                </label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.50"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0"
                  disabled={submitting}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5
                  text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                  focus:border-transparent disabled:bg-gray-50"
                />
              </div>

              {/*Banneer URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL slike za banner
                </label>
                <input
                  name="bannerURL"
                  value={form.bannerURL}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  disabled={submitting}
                  className="w-full border border-gray-300 rounded-xl px-4
                 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                 focus:border-transparent disabled:bg-gray-50"
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

              {/*Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={submitting}
                  className="flex-1 border border-gray-300 text-gray-600
                  py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors
                  disabled:opacity-50"
                >
                  Odustani
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl
                  text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
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
              className="bg-white border border-gray-200 rounded-2xl p-4
                            animate-pulse flex gap-4"
            >
              <div className="w-20 h-16 bg-gray-200 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
          <div className="text-5xl mb-3">📭</div>
          <h3 className="text-gray-700 font-semibold mb-1">Nemate događaja </h3>
          <p className="text-gray-400 text-sm mb-4">
            Kreirajte vaš prvi događaj
          </p>
          <button
            onClick={openCreate}
            className="bg-blue-600 text-white px-5
            py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Kreiraj događaj
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white border border-gray-200 rounded-2xl
                p-4 flex gap-4 items-center"
            >
              {/*Banner thumbnail */}
              <div className="w-20 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                {event.bannerURL ? (
                  <img
                    src={event.bannerURL}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center
                                  justify-center text-gray-300 text-2xl"
                  >
                    🎉
                  </div>
                )}
              </div>

              {/*Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <h3 className="font-medium text-gray-900 text-sm truncate">
                    {event.title}
                  </h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0
                    ${STATUS_STYLES[event.status] || STATUS_STYLES.pending}`}
                  >
                    {STATUS_LABELS[event.status] || "Na čekanju"}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {event.city} · {formatDate(event.startDate)} ·{" "}
                  {event.price === 0 ? "Besplatno" : `${event.price} KM`}
                </p>
              </div>

              {/*Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEdit(event)}
                  className="text-xs border border-gray-300 text-gray-600
                    px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Uredi
                </button>
                <button
                  onClick={() => setDeleteConfirm(event.id)}
                  className="text-xs border border-red-200 text-red-500 px-3 py-1.5
                  rounded-lg hover:bg-red-50 transition-colors"
                >
                  Obriši
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/*Confirm delete modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center
        justify-center p-4"
        >
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-gray-900 mb-2">
              Obrisati događaj
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Ova akcija se ne može poništiti.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 border border-gray-300 text-gray-600
                py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 
                transition-colors"
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
