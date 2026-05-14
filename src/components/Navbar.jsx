import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { currentUser, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: ' Kandidat' },
    { to: '/admin', label: ' Admin' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-green border-b border-emerald-700/30 shadow-lg shadow-emerald-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform duration-300 animate-float">
              🗳️
            </div>
            <span className="font-bold text-lg sm:text-xl text-white hidden sm:block">
              HIMMAH NW STMIK
            </span>
          </Link>

          {/* Desktop Nav Links */}
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

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 bg-emerald-900/40 px-3 py-1.5 rounded-full border border-emerald-600/30">
                  <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-200">{currentUser.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="text-sm text-red-400 hover:text-red-300 hover:bg-red-900/30 px-3 py-1.5 rounded-full transition-all duration-300"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <Link
                to="/admin"
                className="text-sm text-gray-300 hover:text-white hover:bg-emerald-700/40 px-4 py-2 rounded-full transition-all"
              >
                Login Admin
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-emerald-700/40 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-emerald-700/30 animate-slide-down">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl my-1 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-white'
                      : 'text-gray-300 hover:bg-emerald-800/40 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {!currentUser && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full mt-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-3 rounded-xl text-sm font-semibold text-center"
              >
                Login Admin
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}