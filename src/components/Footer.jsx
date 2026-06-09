import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-gray-200 px-6 py-20 mt-auto">
      <div className="max-w-6x1 mx-auto flex flex-col md:fle-row justify-between items-center gap-4">
        <div>
          <span className="text-lg font-bold text-blue-600">Gatherly</span>
          <p className="text-sm text-gray-500 mt-1">Discover event near you </p>
        </div>

        <div className="flex gap-6 text-sm text-gray-500">
          <Link to="/events" className="hover:text.blue-600 transition-colors ">
            Browse events
          </Link>
          <Link to="/login" className="hover:text.blue-600 transition-colors ">
            Log in
          </Link>
          <Link to="/signup" className="hover:text.blue-600 transition-colors ">
            Sign up
          </Link>
        </div>

        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Gatherly. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
