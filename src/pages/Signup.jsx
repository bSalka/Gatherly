import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerWithEmail, loginWithGoogle } from "../services/auth";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;

export default function Signup() {
  const navigate = useNavigate();
  const initialForm = { name: "", email: "", password: "", confirm: "" };
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    //validacija
    if (!form.name || !form.email || !form.password || !form.confirm) {
      return setError("Molimo Vas da popunite sva polja.");
    }
    if (form.name.trim().length < 2) {
      return setError("ime mora imati najmanje 2 karaktera.");
    }
    if (!emailRegex.test(form.email)) {
      return setError(
        "'Unesite ispravnu email adresu (npr. example@email.com).",
      );
    }
    if (!passwordRegex.test(form.password)) {
      return setError(
        "Lozinka mora imati najmanje 6 karaktera, jedno slovo i jedan broj.",
      );
    }
    if (form.password !== form.confirm) {
      return setError("Lozinke se ne podudaraju.");
    }

    try {
      setLoading(true);
      await registerWithEmail(form.name, form.email, form.password);
      setForm(initialForm);
      setSuccess(true);

      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("Račun sa ovom email adrsom već postoji.");
      } else {
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
      navigate("/");
    } catch (err) {
      setError("Google prijava nije uspjela. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/*Header */}
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            Gatherly
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            Kreirajte račun
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Pridružite se i otkrijte događaje
          </p>
        </div>

        {/*Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="p-8">
            {/*Success */}
            {success && (
              <div
                className="bg-green-50 border border-green-200 text-green-700
          rounded-lg px-4 py-3 mb-6 text-sm text-center"
              >
                ✓ Račun kreiran! Preusmjeravamo vas...
              </div>
            )}

            {/*Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-6 text-sm">
                {error}
              </div>
            )}

            {/*Google btn */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3
                         border border-gray-300 rounded-xl px-4 py-3 text-sm
                         font-medium text-gray-700 hover:bg-gray-50
                         transition-colors disabled:opacity-50 mb-6"
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
                ili se prijavite putem email
              </span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/*Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Ime i prezime
                </label>
                <input
                  name="name"
                  type="text"
                  placeholder="Vaše ime i prezime"
                  value={form.name}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 
              text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
              focus:border-transparent"
                />
              </div>

              {/*Email*/}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email adresa
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                  onBlur={() => {
                    if (form.email && !emailRegex.test(form.email)) {
                      setEmailError("Unesite ispravnu email adresu.");
                    } else {
                      setEmailError("");
                    }
                  }}
                  className={`w-full border rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent disabled:bg-gray-50
                           disabled:text-gray-400 transition-colors
                           ${emailError ? "border-red-400" : "border-gray-300"}`}
                />
                {emailError && (
                  <p className="text-xs text-red-500 mt-1">{emailError}</p>
                )}
              </div>

              {/*Password*/}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Lozinka
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="Najmanje 6 karaktera"
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none
             focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 
             disabled:text-gray-400 transition-colors"
                />

                {/*Password hints*/}

                {form.password && (
                  <div className="mt-2 space-y-1">
                    <div
                      className={`flex items-center gap-2 text-xs ${
                        form.password.length >= 6
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {" "}
                      <span>{form.password.length >= 6 ? "✓" : "○"}</span>
                      Najmanje 6 karaktera
                    </div>
                    <div
                      className={`flex items-center gap-2 text-xs ${
                        /[A-Za-z]/.test(form.password)
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      <span>{/[A-Za-z]/.test(form.password) ? "✓" : "○"}</span>
                      Sadrži slovo
                    </div>
                    <div
                      className={`flex items-center gap-2 text-xs ${
                        /\d/.test(form.password)
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      <span>{/\d/.test(form.password) ? "✓" : "○"}</span>
                      Sadrži broj
                    </div>
                  </div>
                )}
              </div>

              {/*Confirm password*/}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 ">
                  Potvrdite lozinku
                </label>
                <input
                  name="confirm"
                  type="password"
                  placeholder="Ponovite lozinku"
                  value={form.confirm}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full border rounded-xl px-4 py-3 text-sm
               focus:outline-none focus:ring-2 focus:ring-blue-500
               focus:border-transparent disabled:bg-gray-50
               disabled:text-gray-400 transition-colors
              ${
                form.confirm && form.confirm !== form.password
                  ? "border-red-400"
                  : "border-gray-300"
              }`}
                />
                {form.confirm && form.confirm !== form.password && (
                  <p className="text-xs text-red-500 mt-1">
                    Lozinke se ne poklapaju
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full bg-blue-600 text-white py-3 rounded-xl
                           font-medium hover:bg-blue-700 active:bg-blue-800
                           transition-colors disabled:opacity-50 mt-2 text-sm"
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
                    Kreiranje računa...
                  </span>
                ) : (
                  "Kreiraj račun"
                )}
              </button>
            </form>

            {/*Footer link */}
            <p className="text-center text-sm text-gray-500 mt-6">
              Imate račun?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:underline font-medium"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
