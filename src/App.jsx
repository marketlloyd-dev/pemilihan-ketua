import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Scan from './pages/Scan';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-emerald-900">
        <Routes>
          <Route path="/" element={<Scan />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}