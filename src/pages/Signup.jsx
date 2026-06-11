import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerWithEmail, loginWithGoogle } from "../services/auth";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    if (form.password.length < 6) {
      return setError("Lozinka moa imati najmanje 6 karaktera!");
    }
    if (form.password !== form.confirm) {
      return setError("Lozinke se ne podudaraju.");
    }

    try {
      setLoading(true);
      await registerWithEmail(form.name, form.email, form.password);
      navigate("");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("Račun s ovom email adrsom već postoji.");
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
      navigate("");
    } catch (err) {
      setError("Prijava putem Google-a nije uspjela. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md"></div>

      {/*Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Kreirajte korisnički račun{" "}
        </h1>
        <p className="text-gray-500 mt-2">
          Pridružite se Gatherly i otkrijte događaje
        </p>
      </div>

      {/*Card */}
      <div className="bg-white border border-ray-200 rounded-2xl p-8 shadow-sm">
        {/*Error */}
        {error && (
          <div className="bg-red-400 border border-red-200 text-black-700 rounded-lg px-4 py-3 mb-6 text-sm">
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

        {/*Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ime i prezime
            </label>
            <input
              name="name"
              type="text"
              placeholder="Vaše ime i prezime"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 
              text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
              focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mmb-1">
              Email adresa
            </label>
            <input
              name="email"
              type="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 
            text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
            focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lozinka
            </label>
            <input
              name="password"
              type="password"
              placeholder="Najmanje 6 karaktera"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none
             focus:ring-2 focus:ring-bue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 ">
              Potvrdite lozinku
            </label>
            <input
              name="confirm"
              type="password"
              placeholder="Ponovite Vašu lozinku"
              value={form.confirm}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none
             focus:ring-2 focus:ring-bue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg
          font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? "Kreiranje računa" : "Kreiraj račun"}
          </button>
        </form>

        {/*Footer link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Imate račun?{""}
          <Link
            to="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
