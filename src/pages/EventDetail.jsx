import { isValidElement, useEffect, useState } from "react";
import { useParams, useNavigate, Link, Await } from "react-router-dom";
import {
  getEventById,
  getTicketTiers,
  createBooking,
  toggleFavourite,
} from "../services/events";
import { useAuth } from "../context/AuthContext";
import { arrayTransformWithIndex } from "firebase/firestore/pipelines";

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
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

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

        //check favourite
        if (user) {
          const { getDoc, doc } = await import("firebase/firestore");
          const { db } = await import("../services/firebase");
          const snap = await getDoc(doc(db, "users", user.uid));
          const favs = snap.data()?.favourites || [];
          setIsFav(favs.includes(id));
        }
      } catch (err) {
        console.error(err);
        setError("Greška pri učitavanju događaja.");
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [id, user]);

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

  async function handleFavourite() {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: `/events/${id}` } });
      return;
    }
    try {
      setFavLoading(true);
      const newState = await toggleFavourite(user.uid, id);
      setIsFav(newState);
    } catch (err) {
      console.error(err);
    } finally {
      setFavLoading(false);
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
      setBookingError("Molimo odaberite vrstu karte.");
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
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <div className="h-72 bg-gray-200 " />
        <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-2/3 " />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="h-32 bg-gray-100 rounded" />
          </div>
          <div className="w-80 h-64 bg-gray-200 rounded-2xl shrink-0" />
        </div>
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

  /////////////////////////////////////////////////
  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        {event.bannerURL && (
          <div
            className="relative h-120 overflow-hidden"
            style={{
              backgroundImage: `url(${event.bannerURL})`,
              filter: "blur(24px) brightness(.35)",
            }}
          />
        )}
        {!event.bannerURL && (
          <div
            className="absolute inset-0 bg-linear-to-br from-blue-800
    to-indigo-900"
          />
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-5">
          <Link
            to="events"
            className="inline-flex items-center gap-1.5 text-sm
  text-white/80 hover:text-white transition-colors"
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
        </div>

        {/*Category over hero */}
        <div className="relative z-10 max-w-7x mx-auto px-4 mt-3">
          <span
            className={`inline-block text-xs font-medium px-3 py-1
            rounded-full ${cat.color}`}
          >
            {cat.label}
          </span>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 -mt-120 relative z-10 pb-12">
        {/*Image card */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/*Left coulumn */}
          <div className="flex-1 min-w-0">
            {/*Banner */}
            <div
              className="h-64 md:h-80 rounded-2xl overflow-hidden mb-6
            bg-gray-200 shadow-xl"
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
                    className="w-16 h-16 text-gray-400"
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
            </div>

            {/*Title */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  {event.title}
                </h1>
              </div>

              {/*Action bttns */}
              <div className="flex items-center gap-2 shrink-0">
                {/*Favourite */}
                <button
                  onClick={handleFavourite}
                  disabled={favLoading}
                  title={isFav ? "Ukloni iz omiljenih" : "Dodaj u omiljene"}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl
                    text-sm font-medium border transition-colors disabled:opacity-50
                    ${
                      isFav
                        ? "bg-red-50 border-red-200 text-red-500"
                        : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill={isFav ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span className="hidden sm:inline">
                    {isFav ? "Omiljeni" : "Dodaj u omiljene"}
                  </span>
                </button>

                {/*Share btn */}
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

            {/*Info row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {/*Date */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p
                  className="text-xs text-gray-400 mb-1 font-medium uppercase
                tracking-wide"
                >
                  Datum
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(event.startDate)}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatTime(event.startDate)}
                  {event.endDate && ` - ${formatTime(event.endDate)}`}
                </p>
              </div>

              {/*Location */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">
                  Lokacija
                </p>

                <p className="text-sm font-semibold text-gray-900">
                  {event.city}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {event.address || ""}
                </p>
              </div>

              {/*Price */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p
                  className="text-xs text-gray-400 mb-1 font-medium uppercase 
                tracking-wide"
                >
                  Cijena od
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  {formatPrice(event.price)}
                </p>
                {tiers.length > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {tiers.length}{" "}
                    {tiers.length === 1 ? "vrsta karte" : "vrste karata"}
                  </p>
                )}
              </div>
            </div>

            {/*Description */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
              <h2 className="text-base font-semibold text-gray-900 mb-3">
                O događaju
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/*Google Map btn */}
            {(event.address || event.city) && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <p
                  className="text-xs text-gray-400 mb-2 font-medium uppercase
              tracking-wide"
                >
                  Lokacija na mapi
                </p>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {event.address || event.city}
                    </p>
                    {event.address && (
                      <p className="text-xs text-gray-500">{event.city}</p>
                    )}
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(
                      `${event.address || ""} ${event.city || ""}`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto flex items-center gap-1.5 px-4 py-2
                    bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm
                    font-medium rounded-lg transition-colors whitespace-nowrap"
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
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Otvori u Google Maps
                  </a>
                </div>
              </div>
            )}
          </div>

          {/*Right column- ticket sidebar */}
          <div className="w-full lg:w-80 shrink-0 lg:sticky lg:top-24">
            <div
              className="bg-white border border-gray-200 rounded-2xl 
             shadow-sm sticky top-24 overflow-hidden"
            >
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {tiers.length === 0 ? "Besplatan ulaz" : "Kupite kartu"}
                </h3>
                {tiers.length > 0 && (
                  <p className="text-xs text-gray-900 mb-1">
                    Odaberite vrtu karte
                  </p>
                )}

                {/*Booking error */}
                {bookingError && (
                  <div
                    className="bg-red-50 border border-red-200 text-red-600
              rounded-lg px-3 py-2 text-xs mb-4"
                  >
                    {bookingError}
                  </div>
                )}

                {/*Free event */}
                {tiers.length === 0 && (
                  <div
                    className="bg-green-50 border-50 border-green-200
              rounded-xl p-3 mb-4 text-sm text-green-700"
                  >
                    Ovaj događaj je besplatan - samo se prijavite!
                  </div>
                )}

                {/*Tier selection */}
                {tiers.length > 0 && (
                  <div className="space-y-2 mb-4">
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
                         transition-all 
                             ${
                               soldOut
                                 ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                                 : isSelected
                                   ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                                   : "border-gray-200 hover:border-blue-300 "
                             }`}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-sm font-medium text-gray-800">
                              {tier.name}
                            </span>
                            <span className="text-sm font-bold text-blue-600">
                              {tier.price === 0
                                ? "Besplatno"
                                : `${tier.price} KM`}
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

                {/*Quantity */}
                {tiers.length > 0 && selectedTier && (
                  <div className="mb-4">
                    <label className="block text-xs text-gray-500 mb-2">
                      Količina
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-lg border border-gray-300 flex
                  items-center justify-center text-gray-600 hover:bg-gray-50
                  transition-colors font-medium"
                      >
                        -
                      </button>
                      <span className="text-sm font-semibold text-gray-900 w-6 text-center">
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
                  hover:bg-gray-50 transition-colors font-medium"
                      >
                        +
                      </button>
                      {/* <span className="text-xs text-gray-400 ml-1">
                      max{selectedTier.quantity - (selectedTier.sold || 0)}
                    </span> */}
                    </div>
                  </div>
                )}

                {/*Total price row */}
                {selectedTier && selectedTier.price > 0 && (
                  <div
                    className="flex items-center justify-between mb-4 py-3
                border-t border-gray-100"
                  >
                    <span className="text-sm text-gray-600">Ukupno</span>
                    <span className="text-lg font-bold text-gray-900">
                      {selectedTier.price * quantity} KM
                    </span>
                  </div>
                )}

                {/*Buy btn */}
                <button
                  onClick={handleBuyTicket}
                  disabled={booking}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl
              font-medium hover:bg-blue-700 active:bg-blue-800 
              transition-colors text-sm disabled:opacity-50"
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
                    `Kupi — ${
                      selectedTier.price === 0
                        ? "Besplatno"
                        : `${selectedTier.price * quantity} KM`
                    }`
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

              {/*Secure purchase footer */}
              <div
                className="bg-gray-50 border-t border-gray-100 px-5 py-3
            flex items-center justify-center gap-2"
              >
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span className="text-xs text-gray-500">Sigurna kupovina</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*Bottom padding */}
      <div className="pb-12" />
    </div>
  );
}
