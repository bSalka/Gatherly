import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      className="bg-gray-50 dark:bg-gray-900
    border-t border-gray-200 dark:border-gray-700 mt-auto"
    >
      <div className="max-w-6xl mx-auto flex flex-col px-6 py-12">
        <div className="flex flex-col items-center text-center">
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
            Gatherly
          </span>

          <p className="text-sm text-secondary mt-3 leading-relaxed max-w-md">
            Otkrij događaje, rezerviši ulaznice i uživaj u najboljim iskustvima
            na jednom mjestu.
          </p>

          <div className="flex gap-6 text-sm text-gray-500 mt-2">
            <Link to="/events" className="text-navbar ">
              Istražite događaje
            </Link>
            <Link to="/login" className="text-navbar">
              Prijava
            </Link>
            <Link to="/signup" className="text-navbar">
              Registracija
            </Link>
          </div>

          <div className="divider w-full mt-8 pt-5">
            <p className="text-xs text-muted">
              © {new Date().getFullYear()} Gatherly. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
