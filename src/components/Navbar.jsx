import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gray-900/90 backdrop-blur-md border-b border-emerald-700/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg">
          <img
            src="/img/logo.png"
            alt="Logo HIMMAH NW"
            className="w-10 h-10 object-contain flex-shrink-0"
          />
          <span className="hidden sm:block">Muskom HIMMAH NW Kom. STMIK</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              isActive('/') ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            🏠 Beranda
          </Link>
          <Link
            to="/kandidat"
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              isActive('/kandidat') ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            👥 Kandidat
          </Link>
          <Link
            to="/dashboard"
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              isActive('/dashboard') ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            📊 Hasil
          </Link>
          <Link
            to="/admin"
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              isActive('/admin') ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            ⚙️ Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}