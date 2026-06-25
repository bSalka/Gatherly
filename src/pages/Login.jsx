import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loginWithEmail, loginWithGoogle } from "../services/auth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // redirect na mjesto prije logina
  //(npr. pokušaj kupovine karte, poslati ih opet tu nakon logina)
  const from = location.state?.from || "/";

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      return setError("Molimo unesite email i lozinku.");
    }
    try {
      setLoading(true);
      await loginWithEmail(form.email, form.password);
      navigate(from || "/", { replace: true });
    } catch (err) {
      switch (err.code) {
        case "auth/user-not-found":
          setError("Nije pronađen račun s ovom e-mail adresom.");
          break;
        case "auth/wrong-password":
          setError("Pogrešna lozinka. Pokušajte ponovo.");
          break;
        case "auth/invalid-email":
          setError("Unesite važeću email adresu.");
          break;
        case "auth/too-many-requests":
          setError(
            "Previše pokušaja. Molimo pričekajte trenutak i pokušajte ponovo.",
          );
          break;
        case "auth/invalid-credential":
          setError("Pogrešan email ili lozinka.");
          break;
        default:
          setError("Nešto nije uredu. Pokušajte ponovo.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    try {
      setLoading(true);
      await loginWithGoogle();
      navigate(from || "/", { replace: true });
    } catch (err) {
      setError("Google prijava nije uspjela. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/*Header*/}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">
            Dobrodošli nazad{" "}
          </h1>
          <p className="text-gray-500 mt-2">
            Prijavite se na svoj Gatherly račun
          </p>
        </div>

        {/* Card*/}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overlow-hidden">
          {/*Error*/}
          <div className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 mb-2.5 text-sm">
                {error}
              </div>
            )}

            {/*Google btn */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border border-gray-300
              rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-4
              disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path
                  fill="#4285F4"
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                />
                <path
                  fill="#34A853"
                  d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                />
                <path
                  fill="#FBBC05"
                  d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
                />
                <path
                  fill="#EA4335"
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
                />
              </svg>
              Nastavite sa Google
            </button>

            {/*Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="text-xs text-gray-400">ili putem emaila</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/*Form*/}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email adresa
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="example@email.com"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  disabled:bg-gray-50 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Lozinka
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Zaboravili ste lozinku?
                  </Link>
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="Vaša lozinka..."
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5
                           text-sm focus:outline-none focus:ring-2
                           focus:ring-blue-500 focus:border-transparent
                           disabled:bg.gray-50 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl 
                font-medium hover:bg-blue-700 sctive:bg-blue-800
                transition-colors disabled:opacity-50 text-sm mt-1"
              >
                {loading ? (
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
                    Prijavljivanje...
                  </span>
                ) : (
                  "Prijava"
                )}
              </button>
            </form>
          </div>

          {/*Footer link*/}
          <div className="bg-gray-50 border-t border-gray-100 px-6 py-3 text-center">
            <p className="text-center text-sm text-gray-500">
              Nemate račun?{""}
              <Link
                to="/signup"
                className="text-blue-600 hover:underline font-medium"
              >
                Regisrtujte se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
