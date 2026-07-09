import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getEventById,
  getTicketTiers,
  createBooking,
} from "../services/events";
import { useAuth } from "../context/AuthContext";

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
  art: { label: "Kultura", color: "bg-pink-100 text-pink-700" },
  tech: { label: "Tech", color: "bg-blue-100 text-blue-700" },
  other: { label: "Ostalo", color: "bg-gray-100 text-gray-600" },
};

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tiers, setTiers] = useState([]);
  const [selectedTier, setSelectedTier] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");

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
        const tierData = await getTicketTiers(id);
        setTiers(tierData);
        const firstAvailable = tierData.find(
          (t) => t.quantity - (t.sold || 0) > 0,
        );
        if (firstAvailable) setSelectedTier(firstAvailable);
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
      `LOCATION:${event.address || event.city || ""}`,
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

  async function handleBuyTicket() {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: `/events/${id}` } });
      return;
    }
    //free events
    if (tiers.length === 0) {
      try {
        setBooking(true);
        setBookingError("");
        const freeTier = { id: "free", name: "Besplatan ulaz", price: 0 };
        const bookingId = await createBooking({
          user,
          event,
          tier: freeTier,
          quantity: 1,
        });
        navigate(`/booking/${bookingId}`);
      } catch (err) {
        setBookingError(err.message || "Greška pri rezervaciji.");
      } finally {
        setBooking(false);
      }
    }

    if (!selectedTier) {
      setBookingError("Molimo odaberite vrsti karte.");
      return;
    }

    const available = selectedTier.quantity - (selectedTier.sold || 0);
    if (quantity > available) {
      setBookingError(`Dostupno samo ${available} karata.`);
      return;
    }
    try {
      setBooking(true);
      setBookingError("");
      const bookingId = await createBooking({
        user,
        event,
        tier: selectedTier,
        quantity,
      });

      navigate(`/booking/${bookingId}`);
    } catch (err) {
      setBookingError(err.message || "Greška pri kupovini. Pokušajte ponovo.");
    } finally {
      setBooking(false);
    }
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
        Nazad na događaje
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
                justify-center shrink-0"
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
                justify-center shrink-0"
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
                  {event.city}
                </p>
                <p className="text-xs text-gray-500">{event.address || ""}</p>
              </div>
            </div>

            {/*Price */}
            <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
              <div
                className="w-8 h-8 bg-purple-100 rounded-lg flex items-center
                justify-center shrink-0"
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
                <p className="text-xs text-gray-400 mb-0.5">
                  {tiers.length > 0 ? "Cijena od" : "Cijena"}
                </p>
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

          {/*Map */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Lokacija
            </h2>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 bg-green-100 rounded-lg flex items-center
                justify-center shrink-0 mt-0.5"
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
                <div className="flex-1">
                  {event.address && (
                    <p className="text-sm font-medium text-gray-900">
                      {event.address}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">{event.city}</p>

                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(
                      `${event.address || ""} ${event.city || ""}`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-xs text-blue-600
                    hover:text-blue-700 font-medium border border-blue-200 px-3 py-1.5
                    rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    {" "}
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
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    Otvori u Google Maps
                  </a>
                </div>
              </div>
            </div>
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
        <div className="lg:w-72 shrink-0">
          <div
            className="bg-white border border-gray-200 rounded-2xl p-5
             sticky top-24"
          >
            <h3 className="font-semibold text-gray-900 mb-4">
              {tiers.length === 0 ? "Besplatan ulaz" : "Kupite kartu"}
            </h3>

            {bookingError && (
              <div
                className="bg-red-50 border border-red-200 text-red-600
              rounded-lg px-3 py-2 text-xs mb-4"
              >
                {bookingError}
              </div>
            )}

            {tiers.length === 0 && (
              <div
                className="bg-green-50 border-50 border-green-200
              rounded-xl p-3 mb-4 text-sm text-green-700"
              >
                Ovaj događaj je besplatan - samo se prijavite!
              </div>
            )}

            {tiers.length > 0 && (
              <div className="space-y-3 mb-4">
                {tiers.map((tier) => {
                  const available = tier.quantity - (tier.sold || 0);
                  const soldOut = available <= 0;
                  const isSelected = selectedTier?.id === tier.id;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      disabled={soldOut}
                      onClick={() => {
                        if (!soldOut) {
                          setSelectedTier(tier);
                          setQuantity(1);
                          setBookingError("");
                        }
                      }}
                      className={`w-full text-left border rounded-xl p-3 
                         transition-all duration-150
                             ${
                               soldOut
                                 ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                                 : isSelected
                                   ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                                   : "border-gray-200 hover:border-blue-300 cursor-pointer"
                             }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-800">
                          {tier.name}
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {tier.price === 0 ? "Besplatno" : `${tier.price} KM`}
                        </span>
                      </div>
                      {tier.description && (
                        <p className="text-xs text-gray-400 mb-1">
                          {tier.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-xs font-medium ${
                            soldOut ? "text-red-500" : "text-green-600"
                          }`}
                        >
                          {soldOut ? "Rasprodano" : `${available} dostupno`}
                        </p>
                        {isSelected && (
                          <span className="text-xs text-blue-600 font-medium">
                            Odabrano
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {tiers.length > 0 && selectedTier && (
              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-1.5">
                  Količina
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg border border-gray-300 flex
                  items-center justify-center text-gray-600 hover:bg-gray-50
                  transition-colors"
                  >
                    -
                  </button>
                  <span className="text-s, font-semibold text-gray-900 w-6 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const available =
                        selectedTier.quantity - (selectedTier.sold || 0);
                      setQuantity(Math.min(available, quantity + 1));
                    }}
                    className="w-8 h-8 rounded-lg border border-gray-300
                   flex items-center justify-center text-gray-600
                 hover:bg-gray-50 transition-colors"
                  >
                    +
                  </button>
                  <span className="text-xs text-gray-400 ml-1">
                    max{selectedTier.quantity - (selectedTier.sold || 0)}
                  </span>
                </div>
              </div>
            )}

            {/*Total price row */}
            {selectedTier && selectedTier.price > 0 && (
              <div
                className="flex items-center justify-between mb-4 pt-3
              border-t border-gray-100"
              >
                <span className="text-sm text-gray-600">Ukupno</span>
                <span className="text-base font-bold text-gray-900">
                  {selectedTier.price * quantity}KM
                </span>
              </div>
            )}

            {/*Buy btn */}
            <button
              onClick={handleBuyTicket}
              disabled={booking}
              className="w-full bg-blue-600 text-white py-3 rounded-xl
              font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm"
            >
              {booking ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Obrađuje se...
                </span>
              ) : !isLoggedIn ? (
                "Prijavi se za kupovinu"
              ) : tiers.length === 0 ? (
                "Prijavi se besplatno"
              ) : selectedTier ? (
                `Kupi ${quantity} × ${selectedTier.name}`
              ) : (
                "Odaberite kartu"
              )}
            </button>

            {/*Hint za login */}
            {!isLoggedIn && (
              <p className="text-sm text-gray-400 text-center mt-2">
                Potrebna je prijava za kupovinu karata.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
