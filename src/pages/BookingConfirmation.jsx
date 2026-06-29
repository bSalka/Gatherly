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
  if (timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString("bs-BA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BookingConfirmation() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const qrRef = useRef(null);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const snap = await getDoc(doc(db, "bookings", bookingId));
        if (snap.exists()) setBooking({ id: snap.id, ...snap.data() });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [bookingId]);

  //download qr code as image
  function downloadQR() {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `gatherly-ticket-${bookingId}.png`;
    a.click();
  }

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
          Vaša karta je uspješno rezervirana
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

        <div className="p-6 border-b border-dashed border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Vrsta karte</p>
              <p className="font-medium text-gray-800">{booking.tierName}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Količina</p>
              <p className="font-medium text-gray-800">{booking.quantity}</p>
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

        {/*QR code section */}
        <div className="p-6 flex flex-col items-center bg-gray-50">
          <p className="text-xs text-gray-400 mb-4 text-center">
            Pokažite svoj QR kod na ulazu
          </p>

          {/*QR KOD */}
          <div
            ref={qrRef}
            className="bg-white p-4 rounded-2xl shadow-sm border 
          border-gray-200 mb-4"
          >
            <QRCodeCanvas
              value={qrValue}
              size={160}
              level="H"
              includeMargin={false}
            />
          </div>

          <p
            className="font-mono text-xs text-gray-500 mb-4 text-center
          break-all px-4"
          >
            {booking.id}
          </p>

          {/*Download btn */}
          <button
            onClick={downloadQR}
            className="flex items-center gap-2 px-4 py-2.5 border
          border-gray-300 rounded-xl text-sm text-gray-600 hover:bg-white transition-colors"
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Preuzmi QR kod
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Link
          to="/account"
          className="w-full bg-blue-600 text-white py-3 
  rounded-xl font-medium hover:bg-blue-700 transition-colors
  text-sm text-center"
        >
          {" "}
          Vidi moje rezervacije
        </Link>

        <Link
          to="/events"
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium 
            hover:bg-blue-700 transition-colors text-sm text-center"
        >
          Pretražite više događaja
        </Link>
      </div>
    </div>
  );
}
