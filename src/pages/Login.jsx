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
      return setError("Unesite Vaš email i lozinku.");
    }
    try {
      setLoading(true);
      await loginWithEmail(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      switch (err.code) {
        case "auth/user-not-found":
          setError("Nije pronađen račun s ovom e-mail adresom.");
          break;
        case "auth/wrong-password":
          setError("Neispravna lozinka. Pokušajte ponovo.");
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
          setError("Neispravan email ili lozinka.");
          break;
        default:
          setError("Nešto nije uredu. Pokušajte ponovo.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    try {
      setLoading(true);
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      setError("Prijava putem Google-a nije uspjela. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-h[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/*Header*/}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back </h1>
          <p className="text-gray-500 mt-2">
            Prijavite se na Vaš Gatherly račun
          </p>
        </div>

        {/* Card*/}
        <div className="bg-white border border-gray-700 rounded-2xl p-8 shadow-sm">
          {/*Error*/}
          {error && (
            <div className="bg-red-50 border border-red-200 text-black-700 rounded-lg px-4 mb-6 text-sm">
              {error}
            </div>
          )}

          {/*Google btn */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-300
        rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-6
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
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="text-xs text-gray-400">
              {" "}
              ili se prijavite putem email
            </span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/*Form*/}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-3
                           text-sm focus:outline-none focus:ring-2
                           focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg 
            font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? "Prijava..." : "Prijava"}
            </button>
          </form>
        </div>

        {/*Footer link*/}
        <p className="text-center text-sm text-gray-500 mt-6">
          Nemate račun?{}
          <Link
            to="/signup"
            className="text-blue-600 hover:underline font-medium"
          >
            Prijavite se
          </Link>
        </p>
      </div>
    </div>
  );
}
