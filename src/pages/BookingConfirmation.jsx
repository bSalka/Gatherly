import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
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

function TicketQRCard({ ticket }) {
  const qrRef = useRef(null);
  const qrValue = JSON.stringify({
    ticketId: ticket.id,
    bookingId: ticket.bookingId,
    event: ticket.eventTitle,
    tier: event.tierName,
    ticketNumber: ticket.ticketNumber,
    totalTickets: ticket.totalTickets,
    status: ticket.status,
  });

  //download qr code as image
  function downloadQR() {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `gatherly-ticket-${ticket.bookingId}.png`;
    a.click();
  }

  return (
    <div
      className="bg-gray-50 border border-gray-200 rounded-2xl p-5
    flex flex-col items-center"
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className="bg-blue-100 text-blue-700 text-xs font-semibold
        px-3 py-1 rounded-full"
        >
          Karta {ticket.ticketNumber} od {ticket.totalTickets}
        </span>
        <span className="text-xs text-gray-400">{ticket.tierName}</span>
      </div>

      <p className="text-xs text-gray-400 mb-3 text-center">
        Pokažite svoj QR kod na ulazu
      </p>

      <div
        ref={qrRef}
        className="bg-white p-4 rounded-2xl shadow-sm border
      border-gray-200 mb-3"
      >
        <QRCodeCanvas
          value={qrValue}
          size={160}
          level="H"
          includeMargin={false}
        />
      </div>

      <p className="font-mono text-xs text-gray-400 mb-3 text-center break-all px-2">
        {ticket.id}
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
        Preuzmi kartu {ticket.ticketNumber}
      </button>
    </div>
  );
}

export default function BookingConfirmation() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const qrRef = useRef(null);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const snap = await getDoc(doc(db, "bookings", bookingId));
        if (snap.exists()) {
          const bookingData = { id: snap.id, ...snap.data() };
          setBooking(bookingData);

          const ticketData = await getBookingTickets(bookingId);
          setTickets(ticketData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div
          className="animate-spin w-8 h-8 border-2 border-blue-600
            border-t-transparent rounded-full mx-auto"
        ></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Rezervacija nije potvrđena.</p>
        <Link
          to="/"
          className="text-blue-600 hover:underline text-sm mt-2 block"
        >
          Nazad na početak
        </Link>
      </div>
    );
  }

  const qrValue = JSON.stringify({
    bookingId: booking.id,
    event: booking.eventTitle,
    tier: booking.tierName,
    quantity: booking.quantity,
    user: booking.userName,
    status: booking.status,
  });

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div
          className="w-16 h-16 bg-green-100 rounded-full flex items-center
            justify-center mx-auto mb-4"
        >
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Rezervacija potvrđena
        </h1>
        <p className="text-gray-500 text-sm">
          {booking.quantity === 1
            ? "Vaša karta je uspješno rezervirana"
            : `${booking.quantity} karte su uspješno rezervirane`}
        </p>
      </div>

      {/*Booking card */}
      <div
        className="bg-white border border-gray-200 rounded-2xl
        overflow-hidden shadow-sm mb-6"
      >
        <div className="p-6 border-b border-dashed border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            {booking.eventTitle}
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            {booking.eventCity}
            {booking.eventAddress ? `· ${booking.eventAddress}` : ""}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg
              className="w-4 h-4 text-gray-400"
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
        </div>

        <div className="p-6">
          <div className="p-6 border-b border-dashed border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Vrsta karte</p>
                <p className="font-medium text-gray-800">{booking.tierName}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Broj karata</p>
                <p className="font-medium text-gray-800">
                  {booking.quantity}{" "}
                  {booking.quantity === 1 ? "karta" : "karte"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Ukupno </p>
                <p className="font-bold text-blue-600">
                  {booking.totalPrice === 0
                    ? "Besplatno"
                    : `${booking.totalPrice} KM`}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Status</p>
                <p className="font-medium text-green-600">Potvrđeno</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            {tickets.length === 1
              ? "Vaša karta"
              : `Vaše karte (${tickets.length})`}
          </h2>

          {tickets.length > 0 ? (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <TicketQRCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
          ) : (
            <div
              className="bg-gray-50 border border-gray-200 rounded-2xl
            p-8 text-center text-gray-400 text-sm"
            >
              Karte se generišu...
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Link
            to="/account"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium
            hover:bg-blue-700 transition-colors text-sm text-center"
          >
            Vidi moje rezervacije
          </Link>
          <Link
            to="/events"
            className="w-full border border-gray-300 text-gray-600 py-3 rounded-xl  
            font-medium hover:bg-gray-50 transition-colors text-sm text-center"
          >
            Pretraži više događaja
          </Link>
        </div>
      </div>
    </div>
  );
}
