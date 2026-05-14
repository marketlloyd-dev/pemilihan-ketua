import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Beranda from './pages/Beranda';
import Scan from './pages/Scan';
import Kandidat from './pages/Kandidat';   // ← import baru
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950">
        <Navbar />
        <div className="pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Beranda />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/kandidat" element={<Kandidat />} />   {/* ← route baru */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}