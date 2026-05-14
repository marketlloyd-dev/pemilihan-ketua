import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-900/90 backdrop-blur-md border-b border-emerald-700/30 sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-14 flex items-center justify-between">
        {/* Logo & Nama */}
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-sm sm:text-lg flex-shrink-0">
          <img
            src="/img/logo.png"
            alt="Logo"
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
          />
          <span className="hidden sm:block text-sm sm:text-base">HIMMAH NW Kom.STMIK</span>
        </Link>

        {/* Tombol hamburger (mobile) */}
        <button
          className="sm:hidden text-gray-300 hover:text-white focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Link Desktop */}
        <div className="hidden sm:flex items-center gap-1 md:gap-2">
          <NavLinks isActive={isActive} />
        </div>
      </div>

      {/* Menu Mobile */}
      {menuOpen && (
        <div className="sm:hidden bg-gray-800/95 backdrop-blur-md border-b border-emerald-700/30 px-4 py-3 space-y-1">
          <NavLinks isActive={isActive} mobile />
        </div>
      )}
    </nav>
  );
}

function NavLinks({ isActive, mobile }) {
  const links = [
    { to: '/', label: 'Beranda', },
    { to: '/kandidat', label: 'Kandidat', },
    { to: '/dashboard', label: 'Hasil', },
    { to: '/admin', label: 'Admin', },
  ];

  return links.map((link) => (
    <Link
      key={link.to}
      to={link.to}
      onClick={() => mobile && window.scrollTo(0, 0)}
      className={`${
        mobile
          ? 'block w-full text-left px-4 py-2 rounded-lg text-base font-medium'
          : 'px-3 py-2 rounded-full text-sm font-medium'
      } transition ${
        isActive(link.to)
          ? 'bg-emerald-600 text-white'
          : 'text-gray-300 hover:text-white hover:bg-emerald-800/40'
      }`}
    >
      {link.icon} <span className={mobile ? 'ml-2' : 'hidden sm:inline sm:ml-1'}>{link.label}</span>
    </Link>
  ));
}