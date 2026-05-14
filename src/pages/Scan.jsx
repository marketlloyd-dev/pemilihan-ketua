import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Scan() {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState('');
  const [voting, setVoting] = useState(false);

  const fetchData = () => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData)
      .catch(() => setMessage('Gagal memuat data'));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // refresh suara tiap 5 detik
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div className="text-white text-center pt-20">Memuat data...</div>;

  const isActive = data.settings.isElectionActive && new Date(data.settings.electionEndTime) > new Date();

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

  return (
    <div className="pb-12">
      {/* Link kembali ke Beranda */}
      <div className="text-center mb-4">
        <Link to="/" className="text-emerald-400 hover:underline text-sm">
          ← Kembali ke Beranda
        </Link>
      </div>

      {/* Header */}
      <div className="text-center mb-8 mt-4">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-2">
          📋 <span className="text-emerald-400">Pilih</span> Kandidat
        </h1>
        <p className="text-gray-300 text-lg font-medium">{data.settings.electionTitle}</p>
        <p className="text-gray-500 text-sm mt-1">
          {isActive ? '🗳️ Pemilihan sedang berlangsung' : '⏰ Pemilihan telah ditutup'}
        </p>
        {!isActive && (
          <div className="mt-2">
            <Link to="/dashboard" className="text-emerald-400 hover:underline font-semibold">
              📊 Lihat Hasil Akhir →
            </Link>
          </div>
        )}
      </div>

      {/* Pesan setelah vote */}
      {message && (
        <div className={`max-w-md mx-auto mb-6 p-4 rounded-xl text-center font-semibold ${
          message.startsWith('✅') ? 'bg-emerald-900/30 text-emerald-300' : 'bg-red-900/30 text-red-300'
        }`}>
          {message}
        </div>
      )}

      {/* Grid Kandidat */}
      {data.candidates.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-xl">Belum ada kandidat.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {data.candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="bg-gray-800/80 backdrop-blur rounded-2xl p-6 border border-emerald-700/30 hover:border-emerald-400/50 transition flex flex-col"
            >
              {/* Nomor Urut + Foto */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-lg">
                  {candidate.nomorUrut}
                </div>
                <img
                  src={candidate.photo}
                  alt={candidate.name}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-emerald-500/40 shadow-xl mb-4"
                  onError={(e) => { e.target.src = 'https://api.dicebear.com/9.x/avataaars/svg?seed=default&backgroundColor=b6e3f4'; }}
                />
              </div>

              {/* Nama */}
              <h2 className="text-xl font-bold text-white text-center mb-1">{candidate.name}</h2>
              <p className="text-emerald-400 text-sm text-center font-medium">Nomor Urut {candidate.nomorUrut}</p>

              {/* Visi Misi Singkat */}
              <div className="mt-3 text-sm text-gray-300 flex-1">
                <p className="line-clamp-2"><span className="text-emerald-300 font-semibold">Visi:</span> {candidate.visi}</p>
                <p className="line-clamp-2 mt-1 text-gray-400"><span className="text-emerald-300 font-semibold">Misi:</span> {candidate.misi}</p>
              </div>

              {/* Suara */}
              <div className="mt-3 text-center">
                <span className="bg-gray-700 px-3 py-1 rounded-full text-sm text-gray-300">
                  🗳️ {candidate.voteCount || 0} suara
                </span>
              </div>

              {/* Tombol Pilih */}
              {isActive && (
                <button
                  onClick={() => handleVote(candidate.id)}
                  disabled={voting}
                  className="mt-4 w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/20 transition disabled:opacity-50"
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
        <Link to="/dashboard" className="text-emerald-400 hover:underline">
          📊 Lihat Hasil Sementara
        </Link>
      </div>
    </div>
  );
}