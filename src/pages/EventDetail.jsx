import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getEventById } from "../services/events";
import { useAuth } from "../context/AuthContext";

/* function formatDate(timestamp) {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("bs-BA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
} */

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

  return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatTime(timestamp) {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString("bs-BA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(price) {
  if (!price || price === 0) return "Besplatno";
  return `${price} KM`;
}

const CATEGORY_LABELS = {
  music: { label: "Muzika", color: "bg-purple-100 text-purple-700" },
  sports: { label: "Sport", color: "bg-green-100 text-green-700" },
  food: { label: "Hrana", color: "bg-orange-100 text-orange-700" },
  art: { label: "Umjetnost", color: "bg-pink-100 text-pink-700" },
  tech: { label: "Tech", color: "bg-blue-100 text-blue-700" },
  other: { label: "Ostalo", color: "bg-gray-100 text-gray-600" },
};

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchEvent() {
      try {
        setLoading(true);
        const data = await getEventById(id);
        if (!data) {
          setError("Događaj nije pronađen.");
          return;
        }
        setEvent(data);
      } catch (err) {
        console.error(err);
        setError("Greška pri učitavanju događaja.");
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id]);

  //save to calendar
  function handleAddToCalendar() {
    if (!event?.startDate) return;
    const start = event.startDate.toDate
      ? event.startDate.toDate()
      : new Date(event.startDate);
    const end = event.endDate?.toDate
      ? event.endDate.toDate()
      : new Date(start.getTime() + 2 * 60 * 60 * 1000); // + 2 sata default

    const pad = (n) => String(n).padStart(2, "0");
    const fmt = (d) =>
      `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
      `T${pad(d.getHours())}${pad(d.getMinutes())}00`;

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `SUMMARY:${event.title}`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `DESCRIPTION:${event.description || ""}`,
      `LOCATION:${event.venue?.address || event.city || ""}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\n");

    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link kopiran!");
    }
  }

  function handleBuyTicket() {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: `/events/${id}` } });
      return;
    }
    //dodati stripe
    alert("Kupovina karata-soooon");
  }

  //loading skeleton
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-64 bg-gray-200 rounded-2xl mb-6"></div>
        <div className="h-8 bg-gray-200 rounded w-2/3 mb-3"></div>
        <div className="h-4 bg-gray-100 rounded w-1/3 mb-6"></div>
        <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-100 rounded w-5/6 mb-2"></div>
        <div className="h-4 bg-gray-100 rounded w-4/6"></div>
      </div>
    );
  }

  //Error
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        {/*<div className="text-5xl mb-4"> 😕</div>*/}
        <h2 className="text-xl font-semibold text-gray-700 mb-2">{error}</h2>
        <Link to="/events" className="text-blue-600 hover:underline text-sm">
          Nazad na događaje
        </Link>
      </div>
    );
  }
  const cat = CATEGORY_LABELS[event.category] || CATEGORY_LABELS.other;

  //main
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        to="/events"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500
        hover:text-blue-600 transition-colors mb-6"
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Nazad na događaj
      </Link>

      {/*Banner */}
      <div
        className="relative h-64 md:h-80 rounded-2xl overflow-hidden 
        bg-gray-100 mb-6"
      >
        {event.bannerURL ? (
          <img
            src={event.bannerURL}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        <span
          className={`absolute top-4 left-4 text-xs font-medium
            px-3 py-1 rounded-full ${cat.color}`}
        >
          {cat.label}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          {/*Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {event.title}
          </h1>

          {/*Organizer*/}
          <p className="text-sm text-gray-500 mb-6">
            Organizator:{" "}
            <span className="text-gray-700 font-medium">
              {event.organizerName}
            </span>
          </p>

          {/*Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/*Date */}
            <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
              <div
                className="w-8 h-8 bg-blue-100 rounded-lg flex items-center
                justify-center flex-shrink-0"
              >
                <svg
                  className="w-4 h-4 text-blue-600"
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
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Datum</p>
                <p className="text-sm font-medium text-gray-800">
                  {formatDate(event.startDate)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatTime(event.startDate)}
                </p>
              </div>
            </div>

            {/*Location */}
            <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
              <div
                className="w-8 h-8 bg-green-100 rounded-lg flex items-center
                justify-center flex-shrink-0"
              >
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Lokacija</p>
                <p className="text-sm font-medium text-gray-800">
                  {event.venue?.name || event.city}
                </p>
                <p className="text-xs text-gray-500">
                  {event.venue?.address || ""}
                </p>
              </div>
            </div>

            {/*Price */}
            <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
              <div
                className="w-8 h-8 bg-purple-100 rounded-lg flex items-center
                justify-center flex-shrink-0"
              >
                <svg
                  className="w-4 h-4 text-purple-600"
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
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Cijena</p>
                <p className="text-sm font-medium text-gray-800">
                  {formatPrice(event.price)}
                </p>
              </div>
            </div>
          </div>

          {/*Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              O događaju
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/*Action btns */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAddToCalendar}
              className="flex items-center gap-2 px-4 py-2.5 border
              border-gray-300 rounded-xl text-sm text-gray-600
              hover:bg-gray-50 transition-colors"
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Dodaj u kalendar
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2.5 border
              border-gray-300 rounded-xl text-sm text-gray-600 
              hover:bg-gray-50 transition-colors"
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
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Podijeli
            </button>
          </div>
        </div>

        {/*Sidebar ticket */}
        <div className="lg:w-72 flex-shrink-0">
          <div
            className="bg-white border border-gray-200 rounded-2xl p-5
             sticky top-24"
          >
            <h3 className="font-semibold text-gray-900 mb-4">Kupite kartu</h3>

            <div className="border border-gray-200 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-800">
                  Standardna karta
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {formatPrice(event.price)}
                </span>
              </div>
              <p className="text-xs text-gray-400">Ulaz na događaj</p>
            </div>

            {/*Buy btn */}
            <button
              onClick={handleBuyTicket}
              className="w-full bg-blue-600 text-white py-3 rounded-xl
          font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm"
            >
              {isLoggedIn ? "Kupi kartu" : "Prijavi se za kupovinu"}
            </button>

            {/*Hint za login */}
            {!isLoggedIn && (
              <p className="text-sm text-gray-400 text-center mt-2">
                Potrebna je prijava za kupovinu karata.
              </p>
            )}

            {/*Free events */}
            {event.price === 0 && (
              <p className="text-xs text-green-600 text-center mt-2 font-medium">
                Ovaj događaj je besplatan
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
