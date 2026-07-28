import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { logout } from "../services/auth";

import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, user, isOrganizer, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const { isDark, toggleTheme } = useTheme();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <nav
      className="bg-white/90 dark:bg-gray-900 border-b backdrop-blur-md border-gray-200 
    dark:border-gray-700 px-6 py-4 sticky top-0 z-50"
    >
      <div className="max-w-6xl mx-auto flex items-center text-center justify-between">
        {/*Logo*/}
        <Link
          to="/"
          className="text-xl font-bold text-blue-600 dark:text-blue-400"
        >
          Gatherly
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/events" className="text-navbar">
            Pretraži događaje
          </Link>

          {isLoggedIn && (
            <Link to="/favourites" className="text-navbar">
              Omiljeni
            </Link>
          )}

          {isOrganizer && (
            <Link to="/organizer" className="text-navbar">
              Moji događaji
            </Link>
          )}
          {isAdmin && (
            <Link to="admin" className="text-navbar">
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
                className="flex items-center gap-2 text-sm text-navbar"
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

              <button onClick={handleLogout} className="text-sm btn-secondary">
                Odjavi se
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-navbar">
                Prijava
              </Link>
              <Link to="/signup" className="btn-primary text-sm">
                Registracija
              </Link>
            </>
          )}
          <button
            onClick={toggleTheme}
            className="btn-icon"
            title={isDark ? "Svijetli način" : "Tamni način"}
          >
            {isDark ? (
              //sun
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
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
                />
              </svg>
            ) : (
              //moon
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
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
        </div>

        {/*Mobile menu button*/}

        <button
          className="md:hidden text-navbar"
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
          className="md:hidden border-t border-gray-100 dark:border-gray-700
          mt-4 pt-4 pb-2 flex flex-col gap-3 px-2"
        >
          <Link to="/events" onClick={closeMenu} className="mobile-nav-link">
            Pretraži događaje
          </Link>

          {isLoggedIn && (
            <Link
              to="/favourites"
              onClick={closeMenu}
              className="mobile-nav-link"
            >
              Omiljeni
            </Link>
          )}

          {isOrganizer && (
            <Link
              to="/organizer"
              onClick={closeMenu}
              className="mobile-nav-link"
            >
              Moji događaji
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" onClick={closeMenu} className="mobile-nav-link">
              Admin panel
            </Link>
          )}
          {isLoggedIn ? (
            <>
              <Link
                to="/account"
                onClick={closeMenu}
                className="mobile-nav-link"
              >
                Moj račun
              </Link>
              <button
                onClick={handleLogout}
                className="text-left mobile-nav-link"
              >
                Odjavi se
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu} className="mobile-nav-link">
                Prijava
              </Link>
              <Link
                to="/signup"
                onClick={closeMenu}
                className="btn-primary text-sm text-center"
              >
                Registracija
              </Link>
            </>
          )}
          <button onClick={toggleTheme} className="btn-secondary text-sm mt-2">
            {isDark ? "Svijetli način" : "Tamni način"}
          </button>
        </div>
      )}
    </nav>
  );
}
