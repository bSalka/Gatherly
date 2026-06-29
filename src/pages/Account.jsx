import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserBookings } from "../services/events";
import { QRCodeCanvas } from "qrcode.react";

function formatDate(timestamp) {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
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
  return `${date.getDate()}.${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatTime(timestamp) {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString("bs-BA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function BookingCard({ booking }) {
  const [showQR, setShowQR] = useState(false);
  const qrRef = useRef(null);

  const qrValue = JSON.stringify({
    bookingId: booking.id,
    event: booking.eventTitle,
    tier: booking.tierName,
    quantity: booking.quantity,
    user: booking.userName,
    status: booking.status,
  });

  function downloadQR() {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `gatherly-ticket-${booking.id}.png`;
    a.click();
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/*Booking info */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-gray-900 text-sm 
                    truncate mb-0.5"
            >
              {booking.eventTitle}
            </h3>
            <p>
              {booking.eventCity}
              {booking.eventAddress ? `· ${booking.eventAddress}` : ""}
            </p>
          </div>
          <span
            className="bg-green-100 text-green-700 text-xs font-medium
                           px-2.5 py-1 rounded-full shrink-0"
          >
            Potvrđeno
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {formatDate(booking.eventStart)} · {formatTime(booking.eventStart)}
          </div>
          <div className="flex items-center gap-1.5">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
            {booking.tierName} ·{booking.quantity}×
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-blue-600">
            {booking.totalPrice === 0
              ? "Besplatno"
              : `${booking.totalPrice} KM`}
          </span>

          <button
            type="button"
            onClick={() => setShowQR((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs text-blue-600
            hover:text-blue-700 font-medium transition-colors "
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
            {showQR ? "Sakrij QR" : "Prikaži QR kod"}
          </button>
        </div>
      </div>

      {/*QR code  */}
      {showQR && (
        <div
          className="border-t border-gray-100 bg-gray-50 p-5
        flex flex-col items-center"
        >
          <p className="text-xs text-gray-400 mb-3 text-center">
            Pokažite ovaj kod na ulazu
          </p>
          <div
            ref={qrRef}
            className="bg-white p-3 rounded-xl shadow-sm border border-gray-200
          mb-3"
          >
            <QRCodeCanvas
              value={qrValue}
              size={160}
              level="H"
              includeMargin={false}
            />
          </div>
          <p
            className="font-mono text-xs text-gray-400 mb-3 text-center
          break-all px-2"
          >
            {booking.id}
          </p>
          <button
            onClick={downloadQR}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300
            rounded-lg text-xs text-gray-600 hover:bg-white transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Preuzmi QR kod
          </button>
        </div>
      )}
    </div>
  );
}

export default function Account() {
  const { user, userRole } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    async function fetchBookings() {
      try {
        const data = await getUserBookings(user.uid);
        setBookings(data);
      } catch (err) {
        console.error(err);
        setError("Greška pri učitavanju rezervacija.");
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, [user.uid]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Moj račun</h1>
        <p className="text-gray-500 text-sm mt-0.5">{user.email}</p>
      </div>

      {/*Role badge */}
      {(userRole === "organizer" || userRole === "admin") && (
        <div
          className="bg-blue-50 border border-blue-200 rounded-xl px-4
        py-3 mb-6 flex items-center justify-between"
        >
          <p className="text-sm text-blue-700 font-medium">
            {userRole === "admin" ? "Admin nalog" : "Organizator nalog"}
          </p>
          <Link
            to={userRole === "admin" ? "/admin" : "/organizer"}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            {userRole === "admin" ? "Admin panel →" : "Moji događaji →"}
          </Link>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Moje rezervacije
        </h2>

        {error && (
          <div
            className="bg-red-50 border border-red-200 text-red-600
            rounded-xl px-4 py-3 text-sm mb-4"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-2xl
                    p-5 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/3 mb-4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div
            className="text-center py-16 bg-white border border-gray-200
            rounded-2xl"
          >
            <h3 className="text-gray-700 font-semibold mb-1">
              Nemate rezervacija
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Pronađite događaje i rezervišie karte
            </p>
            <Link
              to="/events"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl
                text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Pretražite događaje
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
