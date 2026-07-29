import { useEffect, useState } from "react";
import { getAllEvents, updateEventStatus } from "../services/events";
import { getAllUsers, setUserRole } from "../services/users";
import { useAuth } from "../context/AuthContext";

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

//check if event is past
function isPastEvent(timestamp) {
  if (!timestamp) return false;
  const date = timestamp.toDate()
    ? timestamp.toDate()
    : timestamp.seconds
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);
  return date < new Date();
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
  cancelled: "Otkazan",
  finished: "Završeno",
};

const ROLE_STYLES = {
  admin: "bg-purple-100 text-purple-700",
  organizer: "bg-blue-100 text-blue-700",
  visitor: "bg-gray-100 text-gray-600",
};

const ROLE_LABELS = {
  admin: "Admin",
  organizer: "Organizator",
  visitor: "Korisnik",
};

export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState("events");

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState("pending");
  const [rejectNote, setRejectNote] = useState("");
  const [rejectingId, setRejectingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchEvents();
    fetchUsers();
  }, []);

  function closeRejectModal() {
    setRejectingId(null);
    setRejectNote("");
  }

  function handleRejectBackdropClick(e) {
    if (e.target === e.currentTarget) {
      closeRejectModal();
    }
  }

  async function fetchEvents() {
    try {
      setEventsLoading(true);
      const data = await getAllEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
      setError("Greška pri učitavanju događaja.");
    } finally {
      setEventsLoading(false);
    }
  }

  async function fetchUsers() {
    try {
      setUsersLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Greška pri učitavanju korinika.");
    } finally {
      setUsersLoading(false);
    }
  }

  async function handleApprove(eventId) {
    try {
      setActionLoading(eventId);
      setError("");
      await updateEventStatus(eventId, "approved");
      setEvents(
        events.map((e) =>
          e.id === eventId ? { ...e, status: "approved" } : e,
        ),
      );
      setSuccess("Događaj odobren!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Greška pri dodbravanju.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(eventId) {
    try {
      setActionLoading(eventId);
      setError("");
      await updateEventStatus(eventId, "rejected", rejectNote);
      setEvents(
        events.map((e) =>
          e.id === eventId
            ? { ...e, status: "rejected", adminNote: rejectNote }
            : e,
        ),
      );
      //close modal
      setRejectingId(null);
      setRejectNote("");
      setSuccess("Događaj dobijen");
      setTimeout(() => setSuccess(""), 1500);
    } catch (err) {
      console.error(err);
      setError("Greška pri odbijanju.");
      setRejectingId(null);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRoleChange(uid, newRole) {
    //prevent admin from changing their own role
    if (uid === user.uid) {
      setError("Ne možete promijeniti svoju ulogu.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    try {
      setRoleLoading(uid);
      await setUserRole(uid, newRole);
      setUsers(users.map((u) => (u.uid === uid ? { ...u, role: newRole } : u)));
      setSuccess(`Uloga promijenjena u ${ROLE_LABELS[newRole]}.`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Greška pri pomjeni uloge.");
    } finally {
      setRoleLoading(null);
    }
  }

  //filter events
  const filteredEvents =
    eventFilter === "all"
      ? events
      : eventFilter === "finished"
        ? events.filter((e) => isPastEvent(e.startDate))
        : events.filter((e) => e.status === eventFilter);

  //stats
  const totalEvents = events.length;
  const pendingEvents = events.filter((e) => e.status === "pending").length;
  const approvedEvents = events.filter(
    (e) => e.status === "approved" && !isPastEvent(e.startDate),
  ).length;
  const totalUsers = users.length;
  const organizers = users.filter((u) => u.role === "organizer").length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/*Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Admin panel </h1>
        <p className="text-muted text-sm mt-0.5">
          Upravljajte platformom Gatherly
        </p>
      </div>

      {/*Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          {
            label: "Svi događaji",
            value: totalEvents,
            color: "text-gray-900 dark:text-white",
          },
          {
            label: "Na čekanju",
            value: pendingEvents,
            color: "text-yellow-600 dark:text-yellow-400",
          },
          {
            label: "Odobreni",
            value: approvedEvents,
            color: "text-green-600 dark:text-green-400",
          },
          {
            label: "Korisnici",
            value: totalUsers,
            color: "text-blue-600 dark:text-blue-400",
          },
          {
            label: "Organizatori",
            value: organizers,
            color: "text-purple-600 dark:text-purple-400",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-gray-800 border
             border-gray-200 dark:border-gray-700 rounded-2xl p-4"
          >
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/*Success / errormessage */}
      {success && <div className="alert-success mb-4 ">{success}</div>}
      {error && <div className="alert-error mb-4 ">{error}</div>}

      {/*Tabs */}
      <div
        className="flex gap-1 bg-gray-100 dark:bg-gray-800
       rounded-xl p-1 mb-6 w-fit"
      >
        {[
          { id: "events", label: "Događaji" },
          { id: "users", label: "Korisnici" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors
         ${
           tab === t.id
             ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
             : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
         }`}
          >
            {t.label}
            {t.id === "events" && pendingEvents > 0 && (
              <span
                className="ml-2 bg-yellow-500 text-white text-xs
             px-1.5 py-0.5 rounded-full"
              >
                {pendingEvents}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Events tab */}
      {tab === "events" && (
        <div>
          <div className="flex gap-2 mb-4 flex-wrap">
            {[
              { value: "pending", label: "Na čekanju" },
              { value: "approved", label: "Odobreni" },
              { value: "rejected", label: "Odbijeni" },
              { value: "finished", label: "Završeni" },
              { value: "all", label: "Svi" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setEventFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium
                 transition-colors border
                   ${
                     eventFilter === f.value
                       ? "bg-blue-600 text-white border-blue-600"
                       : "bg-white dark:bg-gray-800 text-muted border border-gray-300 dark:border-gray-700"
                   }`}
              >
                {f.label}
                <span className="ml-1.5 opacity-70">
                  (
                  {f.value === "all"
                    ? events.length
                    : f.value === "finished"
                      ? events.filter((e) => isPastEvent(e.startDate)).length
                      : events.filter((e) => e.status === f.value).length}
                  )
                </span>
              </button>
            ))}
          </div>
          {/*Rejecting modal*/}
          {rejectingId && (
            <div
              className="fixed inset-0 bg-black/50 z-50 flex
                    items-center justify-center p-4"
              onClick={handleRejectBackdropClick}
            >
              <div
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 
                        max-w-sm w-full"
              >
                <h3 className="font-semibold text-primary mb-3">
                  Odbiti događaj
                </h3>
                <p className="text-sm text-secondary mb-3">
                  Opcionalno dodajte razlog odbijanja
                </p>
                <textarea
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="Razlog odbijanja..."
                  rows={3}
                  className="input resize-none mb-4"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setRejectingId(null);
                      setRejectNote("");
                    }}
                    className="btn-secondary flex-1 text-sm"
                  >
                    Odustani
                  </button>
                  <button
                    onClick={() => handleReject(rejectingId)}
                    disabled={actionLoading === rejectingId}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white
                               py-2.5 rounded-xl text-sm font-medium
                               transition-colors disabled:opacity-50"
                  >
                    {actionLoading === rejectingId ? "Odbijanje..." : "Odbij"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {eventsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 border border-gray-200 
                  dark:border-gray-700 rounded-2xl p-4 animate-pulse h-20"
                />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div
              className="text-center py-16 bg-white dark:bg-gray-800 border
               border-gray-200 dark:border-gray-700 rounded-2xl"
            >
              <p className="text-muted text-sm">
                Nema događaja u ovoj kategoriji
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((event) => {
                const past = isPastEvent(event.startDate);

                return (
                  <div
                    key={event.id}
                    className={`bg-white dark:bg-gray-800 border
                border-gray-200 dark:border-gray-700
                  rounded-2xl p-4
                  ${past ? "opacity-50" : ""}`}
                  >
                    <div className="flex gap-4 items-start">
                      <div
                        className="w-16 h-14 rounded-xl overflow-hidden bg-gray-100
                      dark:bg-gray-700 shrink-0"
                      >
                        {event.bannerURL ? (
                          <img
                            src={event.bannerURL}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center 
                      text-2xl"
                          >
                            🎉
                          </div>
                        )}
                      </div>

                      {/*  info */}
                      <div className="flex-1 min-w-0">
                        <div
                          className="flex items-center gap-2
                        mb-0.5 flex-wrap"
                        >
                          <h3
                            className="font-medium text-primary
                            text-sm truncate"
                          >
                            {event.title}
                          </h3>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0
                          ${
                            past
                              ? STATUS_STYLES.finished
                              : STATUS_STYLES[event.status] ||
                                STATUS_STYLES.pending
                          }`}
                          >
                            {past
                              ? STATUS_LABELS.finished
                              : STATUS_LABELS[event.status] || "Na čekanju"}
                          </span>
                        </div>
                        <p className="text-secondary text-xs mt-1">
                          {event.city}{" "}
                          {event.address ? `· ${event.address}` : ""}
                          {" · "}
                          {formatDate(event.startDate)}
                        </p>

                        {event.adminNote && (
                          <p className="text-xs text-red-500 mt-1">
                            Napomena: {event.adminNote}
                          </p>
                        )}
                      </div>

                      {/*Actions */}
                      {!past && event.status === "pending" && (
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleApprove(event.id)}
                            disabled={actionLoading === event.id}
                            className="text-xs bg-green-600 text-white px-3 py-1.5 
                        rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === event.id ? "..." : "Odobri"}
                          </button>
                          <button
                            onClick={() => setRejectingId(event.id)}
                            disabled={actionLoading === event.id}
                            className="text-xs border border-red-200
                        dark:border-red-700 text-red-500
                        dark:text-red-500 px-3 py-1.5 rounded-lg
                        hover:bg-red-50 dark:hover:bg-red-900/30
                          transition-colors disabled:opacity-50"
                          >
                            Odbij
                          </button>
                        </div>
                      )}

                      {/*Review rejected and approved events */}
                      {((!past && event.status === "approved") ||
                        event.status === "rejected") && (
                        <div className="flex gap-2 shrink-0">
                          {event.status === "rejected" && (
                            <button
                              onClick={() => handleApprove(event.id)}
                              disabled={actionLoading === event.id}
                              className="text-xs bg-green-600 text-white px-3 py-1.5
                            rounded-lg hover:bg-green-700 transition-colors 
                            disabled:opacity-50"
                            >
                              Odobri
                            </button>
                          )}
                          {event.status === "approved" && (
                            <button
                              onClick={() => setRejectingId(event.id)}
                              disabled={actionLoading === event.id}
                              className="text-xs border border-red-200
                        dark:border-red-700 text-red-500
                        dark:text-red-500 px-3 py-1.5 rounded-lg
                        hover:bg-red-50 dark:hover:bg-red-900/30
                          transition-colors disabled:opacity-50"
                            >
                              Odbij
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/*User tabs */}
      {tab === "users" && (
        <div>
          {usersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700 rounded-2xl
                  p-4 animate-pulse h-16"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <div
                  key={u.uid || u.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200
                dark:border-gray-700 rounded-2xl p-4
                  flex items-center gap-4"
                >
                  {/*Avatar */}
                  <div
                    className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 
                    flex items-center justify-center text-blue-600 dark:text-blue-400
                    font-semibold text-sm shrink-0"
                  >
                    {(u.name || u.email || "?")[0].toUpperCase()}
                  </div>

                  {/*Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary truncate">
                      {u.name || "—"}
                    </p>
                    <p className="text-xs text-muted truncate">{u.email}</p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full
                 font-medium shrink-0 ${ROLE_STYLES[u.role] || ROLE_STYLES.visitor}`}
                  >
                    {ROLE_LABELS[u.role] || "Posjetilac"}
                  </span>

                  {/*Role select */}
                  {u.uid !== user.uid && (
                    <select
                      value={u.role || "visitor"}
                      disabled={roleLoading === u.uid}
                      onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                      className="text-xs border border-gray-300
                    dark:border-gray-600 rounded-lg px-2 py-1.5
                    bg-white dark:bg-gray-700 text-gray-600
                    dark:text-gray-200 focus:outline-none
                      focus:ring-2 focus:ring-blue-500
                      disabled:opacity-50 transition-colors"
                    >
                      <option value="visitor">Posjetilac</option>
                      <option value="organizer">Organizator</option>
                      <option value="admin">Admin</option>
                    </select>
                  )}

                  {u.uid === user.uid && (
                    <span className="text-xs text-muted shrink-0">(Vi)</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
