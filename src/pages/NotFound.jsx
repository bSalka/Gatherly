import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h1 className="text-7xl font-bold alert-error">404</h1>
      <p className="text-muted">Page Not Found</p>
      <Link to="/" className="btn-primary inline-block text-sm">
        Nazad na početnu
      </Link>
    </div>
  );
}
