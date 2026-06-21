import { useState } from "react";
import { Link } from "react-router-dom";
import { resetPassword } from "../services/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email) return setError("Unesite Vašu email adresu.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setError("Unesite ispravnu email adresu.");
    }
    try {
      setLoading(true);
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError("Nešto je pošlo po krivu. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="text-5xl mb-4">📬 </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Provjerite email
          </h2>
          <p className="text-gray-500 mb-6">
            Poslali smo link za resetiranje lozinke na{" "}
            <strong className="text-gray-700">{email}</strong>.Provjerite i spam
            folder.
          </p>
          <Link
            to="/login"
            className="text-blue-600 text-white px-6 py-2.5
             rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Nazad na prijavu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            Gatherly
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            Reset lozinke
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Unesite email i poslat ćemo vam link za reset
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm overflow-hidden">
          <div className="">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email adresa
                </label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3
                             text-sm focus:outline-none focus:ring-2
                             focus:ring-blue-500 focus:border-transparent
                             disabled:bg-gray-50 disabled:text-gray-400
                             transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl
              font-medium hover:bg-blue-700 active:bg-blue-800
               transition-colors disabled:opacity-50 text-sm"
              >
                {loading ? "Slanje" : "Pošalji reset link"}
              </button>
            </form>
          </div>

          <div className="bg-gray-50 border-t border-gray-100 px-8 py-4 text-center">
            <p className="text-center text-sm text-gray-500">
              <Link
                to="/login"
                className="text-blue-600 hover:underline font-medium"
              >
                Nazad na prijavu
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
