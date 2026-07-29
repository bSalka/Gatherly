import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EventCard from "../components/EventCard";
import EventCardSkeleton from "../components/EventCardSkeleton";
import { getEvents } from "../services/events";

const CATEGORIES = [
  { value: "", label: "Sve kategorije" },
  { value: "music", label: " Muzika" },
  { value: "sports", label: " Sport" },
  { value: "festival", label: "Festival" },
  { value: "art", label: " Kultura" },
  { value: "tech", label: " Tech" },
  { value: "other", label: " Ostalo" },
];

const CITIES = [
  "Sarajevo",
  "Tuzla",
  "Mostar",
  "Banja Luka",
  "Zenica",
  "Bijeljina",
  "Trebinje",
];

export default function Home() {
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    async function fetchFeatured() {
      try {
        setLoading(true);

        const data = await getEvents({
          category: selectedCategory,
          city: selectedCity.trim(),
        });

        setFeaturedEvents(data.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, [selectedCategory, selectedCity]);

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set("search", search.trim());
    }
    if (selectedCategory) {
      params.set("category", selectedCategory);
    }
    if (selectedCity.trim()) {
      params.set("city", selectedCity.trim());
    }

    navigate(`/events?${params.toString()}`);
  }

  return (
    <div>
      {/*Hero section */}
      <section
        className="bg-linear-to-br from-blue-600 via-blue-700
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
              Pronađite savršen
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
                  w-4 h-4 text-secondary"
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
                  className="w-full pl-10 input"
                />
              </div>
              <button type="submit" className="btn-primary">
                Pretraži
              </button>
            </form>
          </div>
        </div>

        {/*Divider */}
        <div
          className="h-12 bg-gray-50 dark:bg-gray-950"
          style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }}
        ></div>
      </section>

      {/*Categories */}
      <section className=" py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div
            className="flex flex-col sm:flex-row sm:items-center
          justify-between gap-4 mb-6"
          >
            <div>
              <h2 className="text-2xl font-semibold text-primary mb-4 text-center">
                Nadolazeći događaji
              </h2>
            </div>

            <div className="flex gap-2 flex-wrap">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl
              text-sm bg-white dark:bg-gray-800 text-secondary focus:outline-none
              focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>

              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4
                  text-secondary"
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
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                  }}
                  className="px-3 py-2 pl-9 input"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading &&
              Array.from({ length: 6 }).map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}
            {!loading &&
              featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
          </div>

          {/*No events */}
          {!loading && featuredEvents.length === 0 && (
            <div className="text-center py-12 text-muted text-sm">
              Nema dostupnih događaja
            </div>
          )}
        </div>
      </section>

      {/*section- 3 recenice */}
      <section className=" py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div
            className="flex flex-col md:flex-row items-center
          justify-center gap-0"
          >
            {/*1 */}
            <div className="flex-1 text-center px-8 py-4">
              <p className="text-primary font-medium text-base leading-relaxed">
                Otkrij događaje koji će upotpuniti tvoje slobodno vrijeme.
              </p>
            </div>

            {/*Divider */}
            <div className="hidden md:block w-px h-20 bg-gray-400 dark:bg-gray-700 shrink-0" />
            {/*Mobile divider */}
            <div className="md:hidden w-30 h-px bg-gray-400 dark:bg-gray-700 my-2" />

            {/*2 */}
            <div className="flex-1 text-center px-8 py-4">
              <p className="text-primary font-medium text-base leading-relaxed">
                Od koncerata i festivala do edukativnih i sportskih
                manifestacija - sve što tražiš nalazi se na jednom mjestu.
              </p>
            </div>

            {/*Divider */}
            <div className="hidden md:block w-px h-20 bg-gray-400 dark:bg-gray-700 shrink-0" />
            {/*Mobile divider */}
            <div className="md:hidden w-30 h-px bg-gray-400 dark:bg-gray-700 my-2" />

            {/*3 */}
            <div className="flex-1 text-center px-8 py-4">
              <p className="text-primary font-medium text-base leading-relaxed">
                Prati najnovija dešavanja, rezerviši ulaznice u nekoliko klikova
                i uživaj u iskustvima koja se pamte.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
