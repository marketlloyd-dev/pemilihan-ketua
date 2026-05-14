import { useState, useEffect } from 'react';

export default function Scan() {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState('');

  const fetchData = () => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData)
      .catch(() => setMessage('Gagal memuat data'));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // polling setiap 5 detik
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div className="text-white text-center pt-20">Memuat data...</div>;

  const isActive = data.settings.isElectionActive && new Date(data.settings.electionEndTime) > new Date();

  const handleVote = async (candidateId) => {
    setMessage('');
    const res = await fetch('/api/data?action=vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateId }),
    });
    const result = await res.json();
    if (result.success) {
      setMessage('✅ Suara berhasil! Terima kasih.');
      fetchData(); // refresh data
    } else {
      setMessage(`❌ ${result.error}`);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          📋 Pilih Kandidat
        </h1>
        <p className="text-gray-400 mt-2">{data.settings.electionTitle}</p>
        {!isActive && <p className="text-red-400 mt-2 font-semibold">⏰ Pemilihan telah ditutup</p>}
        {message && (
          <p className={`mt-3 text-lg font-semibold ${message.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {data.candidates.map((candidate) => (
          <div key={candidate.id} className="bg-gray-800 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              {candidate.nomorUrut}
            </div>
            <img
              src={candidate.photo}
              alt={candidate.name}
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-emerald-500/30"
              onError={(e) => { e.target.src = 'https://api.dicebear.com/9.x/avataaars/svg?seed=default&backgroundColor=b6e3f4'; }}
            />
            <h2 className="text-xl font-bold text-white">{candidate.name}</h2>
            <p className="text-emerald-400">Nomor Urut {candidate.nomorUrut}</p>
            <p className="text-gray-400 mt-2">🗳️ {candidate.voteCount || 0} suara</p>
            {isActive && (
              <button
                onClick={() => handleVote(candidate.id)}
                className="mt-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                🗳️ Pilih
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}