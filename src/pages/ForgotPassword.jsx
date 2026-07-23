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
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-4">📬 </div>
          <h2 className="text-2xl font-bold text-primary mb-2">
            Provjerite email
          </h2>
          <p className="text-muted mb-6">
            Poslali smo link za resetiranje lozinke na{" "}
            <strong className="text-secondary">{email}</strong>. Provjerite i
            spam folder.
          </p>
          <Link
            to="/login"
            className="text-blue-600 dark:text-blue-400
             text-sm font-medium hover:underline "
          >
            Nazad na prijavu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/*HEADER */}
        <div className="text-center mb-6">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            Gatherly
          </Link>
          <h1 className="text-2xl font-bold text-primary mt-4">
            Reset lozinke
          </h1>
          <p className="text-muted mt-2">
            Unesite email i poslat ćemo vam link za reset.
          </p>
        </div>

        {/*Card */}
        <div className="card p-8">
          <div className="p-6">
            {error && <div className="alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-label">Email adresa</label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary mt-1"
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
                    Slanje...
                  </span>
                ) : (
                  "Pošalji reset link"
                )}
              </button>
            </form>
          </div>

          {/*Footer link */}
          <div className="text-center">
            <p className="text-center text-sm text-secondary">
              <Link
                to="/login"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
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
