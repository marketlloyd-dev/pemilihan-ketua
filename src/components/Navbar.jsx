import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gray-900/90 backdrop-blur-md border-b border-emerald-700/30 sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1 sm:gap-2 text-white font-bold text-sm sm:text-lg">
          <img
            src="/img/logo.png"
            alt="Logo"
            className="w-7 h-7 sm:w-9 sm:h-9 object-contain flex-shrink-0"
          />
          <span className="hidden xs:inline sm:block text-xs sm:text-base">HIMMAH NW Kom.STMIK</span>
        </Link>

        <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
          <Link to="/" className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition ${isActive('/') ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:text-white'}`}>🏠<span className="hidden sm:inline ml-1">Beranda</span></Link>
          <Link to="/kandidat" className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition ${isActive('/kandidat') ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:text-white'}`}>👥<span className="hidden sm:inline ml-1">Kandidat</span></Link>
          <Link to="/dashboard" className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition ${isActive('/dashboard') ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:text-white'}`}>📊<span className="hidden sm:inline ml-1">Hasil</span></Link>
          <Link to="/admin" className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition ${isActive('/admin') ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:text-white'}`}>⚙️<span className="hidden sm:inline ml-1">Admin</span></Link>
        </div>
      </div>
    </nav>
  );
}