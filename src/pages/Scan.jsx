import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Scan() {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState('');
  const [voting, setVoting] = useState(false);

  const fetchData = () => {
    fetch('/api/data')
      .then((res) => res.json())
      .then(setData)
      .catch(() => setMessage('Gagal memuat data'));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Kirim suara (cookie ditangani oleh server)
  const handleVote = async (candidateId) => {
    setVoting(true);
    setMessage('');
    try {
      const res = await fetch('/api/data?action=vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId }),
      });
      const result = await res.json();
      if (result.success) {
        setMessage('✅ Suara berhasil! Terima kasih.');
        fetchData();
      } else {
        setMessage(`❌ ${result.error}`);
      }
    } catch (err) {
      setMessage('❌ Gagal terhubung ke server.');
    } finally {
      setVoting(false);
    }
  };

  if (!data) return <div className="text-white text-center pt-20">Memuat data...</div>;

  const isActive =
    data.settings.isElectionActive &&
    new Date(data.settings.electionEndTime) > new Date();

  return (
    <div className="pb-10 sm:pb-12 px-2 sm:px-4">
      {/* Link kembali */}
      <div className="text-center mb-4">
        <Link to="/" className="text-emerald-400 hover:underline text-xs sm:text-sm">
          ← Kembali ke Beranda
        </Link>
      </div>

      {/* Header */}
      <div className="text-center mb-8 sm:mb-10 mt-2">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2">
          📋 <span className="text-emerald-400">Pilih</span> Kandidat
        </h1>
        <p className="text-gray-300 text-sm sm:text-lg font-medium">
          {data.settings.electionTitle}
        </p>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">
          {isActive
            ? '🗳️ Pemilihan sedang berlangsung'
            : '⏰ Pemilihan telah ditutup'}
        </p>
        {!isActive && (
          <div className="mt-2">
            <Link
              to="/dashboard"
              className="text-emerald-400 hover:underline font-semibold text-sm sm:text-base"
            >
              Lihat Hasil Akhir →
            </Link>
          </div>
        )}
      </div>

      {/* Pesan setelah vote */}
      {message && (
        <div
          className={`max-w-md mx-auto mb-6 p-3 sm:p-4 rounded-xl text-center font-semibold text-sm sm:text-base ${
            message.startsWith('✅')
              ? 'bg-emerald-900/30 text-emerald-300'
              : 'bg-red-900/30 text-red-300'
          }`}
        >
          {message}
        </div>
      )}

      {/* Grid Kandidat */}
      {data.candidates.length === 0 ? (
        <div className="text-center py-16 sm:py-20">
          <p className="text-gray-400 text-lg sm:text-xl">Belum ada kandidat.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {data.candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="bg-gray-800/80 backdrop-blur rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-700/30 hover:border-emerald-400/50 transition flex flex-col"
            >
              {/* Nomor Urut + Foto */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold mb-3 shadow-lg">
                  {candidate.nomorUrut}
                </div>
                <img
                  src={candidate.photo}
                  alt={candidate.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-emerald-500/40 shadow-xl mb-3 sm:mb-4"
                  onError={(e) => {
                    e.target.src =
                      'https://api.dicebear.com/9.x/avataaars/svg?seed=default&backgroundColor=b6e3f4';
                  }}
                />
              </div>

              {/* Nama */}
              <h2 className="text-lg sm:text-xl font-bold text-white text-center mb-1">
                {candidate.name}
              </h2>
              <p className="text-emerald-400 text-xs sm:text-sm text-center font-medium">
                Nomor Urut {candidate.nomorUrut}
              </p>

              {/* Visi Misi Singkat */}
              <div className="mt-3 text-xs sm:text-sm text-gray-300 flex-1">
                <p className="line-clamp-2">
                  <span className="text-emerald-300 font-semibold">Visi:</span> {candidate.visi}
                </p>
                <p className="line-clamp-2 mt-1 text-gray-400">
                  <span className="text-emerald-300 font-semibold">Misi:</span>{' '}
                  {candidate.misi}
                </p>
              </div>

              {/* Suara */}
              <div className="mt-3 text-center">
                <span className="bg-gray-700 px-3 py-1 rounded-full text-xs sm:text-sm text-gray-300">
                   {candidate.voteCount || 0} suara
                </span>
              </div>

              {/* Tombol Pilih */}
              {isActive && (
                <button
                  onClick={() => handleVote(candidate.id)}
                  disabled={voting}
                  className="mt-4 w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-2 sm:py-2.5 rounded-xl font-semibold text-sm sm:text-base hover:shadow-lg hover:shadow-emerald-500/20 transition disabled:opacity-50"
                >
                  {voting ? 'Mengirim...' : '🗳️ Pilih'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Link ke Dashboard */}
      <div className="text-center mt-8">
        <Link to="/dashboard" className="text-emerald-400 hover:underline text-sm sm:text-base">
          Lihat Hasil Sementara
        </Link>
      </div>
    </div>
  );
}