import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Kandidat() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then((res) => res.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) {
    return <div className="text-white text-center pt-20">Memuat data kandidat...</div>;
  }

  return (
    <div className="pb-12">
      {/* Link kembali ke Beranda */}
      <div className="text-center mb-4">
        <Link to="/" className="text-emerald-400 hover:underline text-sm">
          ← Kembali ke Beranda
        </Link>
      </div>

      {/* Header */}
      <div className="text-center mb-10 mt-4">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-2">
          👥 Daftar <span className="text-emerald-400">Kandidat</span>
        </h1>
        <p className="text-gray-300 text-lg font-medium">
          {data.settings.electionTitle}
        </p>
        <p className="text-gray-500 text-sm mt-1">
          Kenali visi & misi setiap kandidat sebelum memilih
        </p>
      </div>

      {/* Grid Kandidat */}
      {data.candidates.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-xl">Belum ada kandidat.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {data.candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="bg-gray-800/80 backdrop-blur rounded-2xl p-6 border border-emerald-700/30 hover:border-emerald-400/50 transition flex flex-col"
            >
              {/* Nomor Urut + Foto */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg">
                  {candidate.nomorUrut}
                </div>
                <img
                  src={candidate.photo}
                  alt={candidate.name}
                  className="w-36 h-36 sm:w-44 sm:h-44 rounded-full object-cover border-4 border-emerald-500/40 shadow-xl mb-4"
                  onError={(e) => {
                    e.target.src =
                      'https://api.dicebear.com/9.x/avataaars/svg?seed=default&backgroundColor=b6e3f4';
                  }}
                />
              </div>

              {/* Nama */}
              <h2 className="text-xl font-bold text-white text-center mb-1">
                {candidate.name}
              </h2>
              <p className="text-emerald-400 text-sm text-center font-medium mb-4">
                Nomor Urut {candidate.nomorUrut}
              </p>

              {/* Visi */}
              <div className="bg-emerald-900/20 rounded-xl p-3 mb-3 flex-1">
                <h3 className="text-emerald-300 font-semibold text-sm mb-1">🎯 Visi</h3>
                <p className="text-gray-300 text-sm">{candidate.visi}</p>
              </div>

              {/* Misi */}
              <div className="bg-emerald-900/20 rounded-xl p-3 mb-4">
                <h3 className="text-emerald-300 font-semibold text-sm mb-1">📋 Misi</h3>
                <p className="text-gray-300 text-sm whitespace-pre-line">{candidate.misi}</p>
              </div>

              {/* Link ke voting */}
              <Link
                to="/scan"
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-2.5 rounded-xl font-semibold text-center hover:shadow-lg hover:shadow-emerald-500/20 transition"
              >
                🗳️ Pergi ke Voting
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}