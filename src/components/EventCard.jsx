import { Link } from "react-router-dom";

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

export default function EventCard({ event }) {
  const cat = CATEGORY_LABELS[event.category] || CATEGORY_LABELS.other;
  return (
    <Link
      to={`/events/${event.id}`}
      className="group bg-white dark:bg-gray-800 border border-blue-600 dark:border-blue-400
       rounded-2xl overflow-hidden hover:shadow-md dark:hover:shadow-blue-900 
       hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
    >
      {/* Banner image*/}
      <div className="relative h-44 bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {event.bannerURL ? (
          <img
            src={event.bannerURL}
            alt="event.title"
            className="w-full h-full object-cover group-hover:scale-105
            transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-300 dark:text-gray-600"
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

        {/*Category badge*/}
        <span
          className={`absolute top-3 left-3 text-xs font-medium
        px-2.5 py-1 rounded-full ${cat.color}`}
        >
          {cat.label}
        </span>
      </div>

      {/*Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3
          className="font-semibold text-gray-900 dark:text-white text-sm leading-snug
        mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
        >
          {event.title}
        </h3>

        {/*Date */}
        <div
          className="flex items-center gap-1.5 text-xs text-gray-500 
        dark:text-gray-300 mb-1"
        >
          <svg
            className="w-3.5 h-3.5 shrink-0"
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
          {formatDate(event.startDate)}
        </div>

        {/*City*/}
        <div
          className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-300
         mb-3"
        >
          <svg
            className="w-3.5 h-3.5 shrink-0"
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
          {event.city}
        </div>

        {/*Price */}
        <div
          className="mt-auto pt-3 border-t border-gray-100  dark:border-gray-700 
        flex items-center justify-between"
        >
          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            {formatPrice(event.price)}
          </span>
          <span
            className="text-xs text-gray-400 group-hover:text-blue-500
           dark:group-hover:text-blue-400 transition-colors"
          >
            Više →
          </span>
        </div>
      </div>
    </Link>
  );
}
