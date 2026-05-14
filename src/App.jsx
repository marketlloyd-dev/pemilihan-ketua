import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Beranda from './pages/Beranda';
import Scan from './pages/Scan';
import Kandidat from './pages/Kandidat';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 flex flex-col">
        <Navbar />
        <div className="flex-1 pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Beranda />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/kandidat" element={<Kandidat />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900/90 border-t border-emerald-700/30 py-6 mt-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
            &copy; HIMMAHNWKOMSTMIK || 2026
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}