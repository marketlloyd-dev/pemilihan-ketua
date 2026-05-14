import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Scan from './pages/Scan';
import Admin from './pages/Admin';

export default function App() {
  return (
    <div className="min-h-screen relative">
      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="particle w-4 h-4 bg-emerald-400/20 top-[10%] left-[5%]" style={{ animationDelay: '0s', animationDuration: '6s' }}></div>
        <div className="particle w-6 h-6 bg-emerald-300/15 top-[20%] right-[10%]" style={{ animationDelay: '1s', animationDuration: '7s' }}></div>
        <div className="particle w-3 h-3 bg-emerald-500/25 bottom-[30%] left-[15%]" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
        <div className="particle w-5 h-5 bg-emerald-400/20 top-[60%] right-[8%]" style={{ animationDelay: '0.5s', animationDuration: '8s' }}></div>
        <div className="particle w-4 h-4 bg-emerald-300/20 bottom-[10%] right-[20%]" style={{ animationDelay: '3s', animationDuration: '6.5s' }}></div>
        <div className="particle w-3 h-3 bg-emerald-400/30 top-[40%] left-[25%]" style={{ animationDelay: '1.5s', animationDuration: '5.5s' }}></div>
      </div>

      <Navbar />
      
      <main className="relative z-10 pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Routes>
          {/* Halaman utama langsung menampilkan daftar kandidat (scan) */}
          <Route path="/" element={<Scan />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/admin" element={<Admin />} />
          {/* Redirect semua rute tidak dikenal ke halaman utama */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-dark-900/90 text-gray-200 py-6 mt-12 border-t border-emerald-800/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} HIMMAH NW STMIK
          </p>
        </div>
      </footer>
    </div>
  );
}