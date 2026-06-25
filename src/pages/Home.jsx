import { useEffect, useState } from "react";
import { Link, useAsyncError, useNavigate } from "react-router-dom";
import EventCard from "../components/EventCard";
import EventCardSkeleton from "../components/EventCardSkeleton";
import { getEvents } from "../services/events";

const CATEGORIES = [
  { value: "music", label: " Muzika" },
  { value: "sports", label: " Sport" },
  { value: "food", label: " Hrana" },
  { value: "art", label: " Umjetnost" },
  { value: "tech", label: " Tech" },
  { value: "other", label: " Ostalo" },
];

export default function Home() {
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const data = await getEvents({});
        setFeaturedEvents(data.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/events?search=${encodeURIComponent(search.trim())}`);
    } else {
      navigate("/events");
    }
  }

  return (
    <div>
      {/*Hero section */}
      <section
        className="bg-gradient-to-br from-blue-600 via-blue-700
    to-indigo-800 text-white"
      >
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-2xl mx-auto text-center">
            <span
              className="inline-block bg-white/20 text-white text-xs
                font-medium px-3 py-1 rounded-full mb-6 backdrop-blur-sm"
            >
              Otkrijte događaje u vašem gradu
            </span>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Pronađite savršen{" "}
              <span className="block text-blue-200">događaj za vas</span>
            </h1>

            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
              Koncerti, festivali, sport, umjetnost i još mnogo toga - sve na
              jednom mjestu
            </p>

            {/*Search bar */}
            <form
              onSubmit={handleSearch}
              className="flex gap-2 max-w-lg mx-auto"
            >
              <div className="flex-1 relative">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2
                                w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Pretražite događaje..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl text-gray-900
                  text-sm focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-400"
                />
              </div>
              <button
                type="submit"
                className="bg-white text-blue-600 font-medium px-5 py-3.5
                rounded-xl hover:bg-blue-50 transition-colors
               text-sm whitespace-nowrap"
              >
                Pretraži
              </button>
            </form>
          </div>
        </div>

        {/*Divider */}
        <div
          className="h-12 bg-gray-50"
          style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }}
        ></div>
      </section>

      {/*Categories */}
      <section className="bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-lgfont-semibold text-gray-800 mb-4 text-center">
            Pretražite po kategoriji
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                to={`/events?category=?{cat.value}`}
                className="bg-white border border-gray-200 text-gray-700
                px-4 py-2.5 rounded-xl text-sm font-medium hover:border-blue-400
                hover:text-blue-600 hover:shadow-sm transition-all"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/*Featured events */}
      <section className="bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Nadolazeći događaji
              </h2>
              <p className="text-gray-500 text-sm mt-0.5">
                Ne propustite ove događaje
              </p>
            </div>
            <Link
              to="/events"
              className="text-sm text-blue-600 hover:underline 
              font-medium flex items-center gap-1"
            >
              Svi događji
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 ls:grid-cols-2
          lg:grid-cols-3 gap-5"
          >
            {loading &&
              Array.from({ length: 3 }).map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}
            {!loading &&
              featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
          </div>

          {/*No events */}
          {!loading && featuredEvents.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              Nema dostupnih događaja
            </div>
          )}
        </div>
      </section>

      {/*Kako funkcioniše */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2>Kako funkcioniše</h2>
            <p className="text-gray-500 text-sm mt-2">
              Tri jednostavna koraka do vašeg sljedećeg doživljaja
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div
                className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center
              justify-center mx-auto mb-4"
              >
                <svg
                  className="w-7 h-7 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <div
                className="text-xs font-semibold text-blue-600 mb-1
                uppercase tracking-wide"
              >
                Korak 1
              </div>
              <h3 className="font-semibold text-gray-900mb-2">
                Pronađite događaje
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Pretražujte događaje po gradu, kategoriji ili datumu.
              </p>
            </div>

            <div className="text-center">
              <div
                className="w-14 h-14 bg-green-100 rounded-2xl flex items-center
            justify-center mx-auto mb-4"
              >
                <svg
                  className="w-7 h-7 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                  />
                </svg>
              </div>
              <div
                className="text-xs font-semibold text-green-600 mb-1
              uppercase tracking-wide"
              >
                Korak 2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Kupite kartu</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Sigurna online kupovina karata za nekoliko sekundi.
              </p>
            </div>

            <div className="text-center">
              <div
                className="w-14 h-14 bg-purple-100 rounded-2xl
                flex items-center justify-center mx-auto mb-4"
              >
                <svg
                  className="w-7 h-7 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div
                className="text-xs font-semibold text-purple-600 mb-1
              uppercase tracking-wide"
              >
                Korak 3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Uživajte</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Pokažite QR kod na ulazu i uživajte
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats*/}
      <section></section>
    </div>
  );
}
