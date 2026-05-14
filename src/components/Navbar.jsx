import { Link, NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { currentUser, logout } = useApp();

  const navLinks = [
    { to: '/', label: '🗳️ Voting' },
    { to: '/dashboard', label: '📊 Dashboard' },
    { to: '/admin', label: '⚙️ Admin' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-green border-b border-emerald-700/30 shadow-lg shadow-emerald-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
              🗳️
            </div>
            <span className="font-bold text-lg sm:text-xl text-white hidden sm:block">
              Muskom HIMMAH NW Kom. STMIK
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                      : 'text-gray-300 hover:bg-emerald-700/40 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {currentUser && (
              <button
                onClick={logout}
                className="text-sm text-red-400 hover:text-red-300 hover:bg-red-900/30 px-3 py-1.5 rounded-full transition-all"
              >
                Keluar
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}