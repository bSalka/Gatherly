import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
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
            Browse Events
          </Link>
        </div>

        {/*Auth buttons- desna strana */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
}
