import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col px-6 py-12">
        <div className="flex flex-col items-center text-center">
          <span className="text-xl font-bold text-blue-600">Gatherly</span>

          <p className="text-sm text-gray-500 mt-3 leading-relaxed max-w-md">
            Otkrij događaje, rezerviši ulaznice i uživaj u najboljim iskustvima
            na jednom mjestu.
          </p>

          <div className="flex gap-6 text-sm text-gray-500 mt-2">
            <Link
              to="/events"
              className="hover:text.blue-600 transition-colors "
            >
              Istražite događaje
            </Link>
            <Link to="/login" className="hover:text-blue-600 transition">
              Prijava
            </Link>
            <Link to="/signup" className="hover:text-blue-600 transition">
              Registracija
            </Link>
          </div>

          <div className="border-t border-gray-200 w-full mt-8 pt-6">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} Gatherly. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
