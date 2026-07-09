import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { logout } from "../services/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, user, isOrganizer, isAdmin } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <nav className="bg-white/90 border-b backdrop-blur-md border-gray-200 px-6 py-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center text-center justify-between">
        {/*Logo*/}
        <Link to="/" className="text-xl font-bold text-blue-600">
          Gatherly
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/events"
            className="text-gray-600 hover:text-blue-600 transition-colors"
          >
            Pretraži događaje
          </Link>
          {isOrganizer && (
            <Link
              to="/organizer"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              Moji događaji
            </Link>
          )}
          {isAdmin && (
            <Link
              to="admin"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              Admin panel
            </Link>
          )}
        </div>

        {/*Auth buttons- desna strana */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link
                to="/account"
                className="flex items-center gap-2 text-sm text-gray-600
                           hover:text-blue-600 transition-colors"
              >
                <div
                  className="w-7 h-7 rounded-full bg-blue-100 flex items-center
                                justify-center text-blue-600 font-medium text-xs"
                >
                  {(user.displayName || user.email || "?")[0].toUpperCase()}
                </div>
                <span className="max-w-30px truncate">
                  {user.displayName || user.email}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm border border-gray-300 px-4 py-2 rounded-lg
             hover:bg-gray-50 transition-colors text-gray-600"
              >
                Odjavi se
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
              >
                Prijava
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Registracija
              </Link>
            </>
          )}
        </div>

        {/*Mobile menu button*/}

        <button
          className="md:hidden text-gray-600 hover:text-blue-600"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/*Mobile menu*/}
      {menuOpen && (
        <div
          className="md:hidden border-t border-gray-100 mt-4 pt-4 pb-2 
        flex flex-col gap-3 px-2"
        >
          <Link
            to="/events"
            onClick={() => setMenuOpen(false)}
            className="text-sm text-gray-600 hover:text-blue-600 py-1"
          >
            Pretraži događaje
          </Link>
          {isOrganizer && (
            <Link
              to="/organizer"
              onClick={() => setMenuOpen(false)}
              className="text-sm text-gray-600 hover:text-blue-600 py-1"
            >
              Moji događaji
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className="text-sm text-gray-600 hover:text-blue-600 py-1"
            >
              Admin panel
            </Link>
          )}
          {isLoggedIn ? (
            <>
              <Link
                to="/account"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-gray-600 hover:text-blue-600 py-1"
              >
                Moj račun
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-left text-red-500 hover:text-red-600 py-1"
              >
                Odjavi se
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-gray-600 hover:text-blue-600 py-1"
              >
                Prijava
              </Link>
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg
                 hover:bg-blue-700 transition-colors text-center"
              >
                Registracija
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
