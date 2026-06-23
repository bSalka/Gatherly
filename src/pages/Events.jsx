import { useEffect, useState } from "react";
import EventCard from "../components/EventCard";
import EventCardSkeleton from "../components/EventCardSkeleton";
import { getEvents } from "../services/events";

const CATEGORIES = [
  { value: "", label: "Sve kategorije" },
  { value: "music", label: "Muzika" },
  { value: "sport", label: "Sport" },
  { value: "food", label: "Hrana" },
  { value: "art", label: "Umjetnost" },
  { value: "tech", label: "Tech" },
  { value: "other", label: "Ostalo" },
];

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        setError("");
        const data = await getEvents({ search, category, city });
        setEvents(data);
      } catch (err) {
        console.error(err);
        setError("Greška pri učitavanju događaja. Pokušajte ponovo.");
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchEvents, 300);
    return () => clearTimeout(timer);
  }, [search, category, city]);

  function clearFilters() {
    setSearch("");
    setCategory("");
    setCity("");
  }

  const hasFilters = search || category || city;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/*Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Događaji</h1>
        <p className="text-gray-500 text-sm mt-1">
          Pronađite događaje u vašem gradu
        </p>
      </div>

      {/*Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          {/*Search*/}
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4
                            text-gray-400"
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
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300
              rounded-xl text-sm focus:outline-none focus:ring-2
              focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/*Category*/}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="md:w-44 px-4 py-2.5 border border-gray-300 rounded-xl
            text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
            bg-white text-gray-700"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/*City*/}
          <div className="relative md:w-40">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4
                            text-gray-400"
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
            <input
              type="text"
              placeholder="Grad..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300
              rounded-xl text-sm focus:outline-none focus:ring-2
              focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/*Clear filters*/}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700
            border border-gray-300 rounded-xl hover:bg-gray-50
            transition-colors whitespace-nowrap"
            >
              Očisti filtere
            </button>
          )}
        </div>
      </div>

      {/*Error*/}
      {error && (
        <div
          className="bg-red-50 border border-red-200 text-red-600
        rounded-xl px-4 py-3 mb-6 text-sm"
        >
          {error}
        </div>
      )}

      {/*Results count */}
      {!loading && !error && (
        <p className="text-sm text-gray-500 mb-4">
          {events.length === 0
            ? "Nema pronađenih događaja"
            : `${events.length} ${events.length === 1 ? "događaj" : "događaja"}`}
        </p>
      )}

      {/*Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Skeletons while loading */}
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}

        {/* Event cards */}
        {!loading &&
          events.map((event) => <EventCard key={event.id} event={event} />)}
      </div>

      {/*Empty state */}

      {!loading && !error && events.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Nema događaja
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Pokušajte promijeniti filtere ili pretražite drugi grad
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-blue-600 text-sm hover:underline"
            >
              Očisti filtere
            </button>
          )}
        </div>
      )}
    </div>
  );
}
