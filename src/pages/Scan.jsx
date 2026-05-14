import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Scan() {
  const { data, loading, castVote } = useApp();
  const [voting, setVoting] = useState(false);
  const [message, setMessage] = useState('');

  if (loading) return <div className="text-center text-white pt-20">Memuat...</div>;
  if (!data) return <div className="text-center text-red-400 pt-20">Gagal memuat data</div>;

  const isActive = data.settings.isElectionActive && new Date(data.settings.electionEndTime) > new Date();

  const handleVote = async (candidateId) => {
    setVoting(true);
    setMessage('');
    const result = await castVote(candidateId);
    if (result.success) {
      setMessage('✅ Suara berhasil! Terima kasih.');
    } else {
      setMessage(`❌ ${result.message}`);
    }
    setVoting(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          📋 <span className="gradient-text">Pilih Kandidat</span>
        </h1>
        <p className="text-gray-400 mt-2">{data.settings.electionTitle}</p>
        {!isActive && (
          <p className="text-red-400 mt-2 font-semibold">⏰ Pemilihan telah ditutup</p>
        )}
        {message && (
          <div className={`mt-4 text-lg font-semibold ${message.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {data.candidates.map((candidate, index) => (
          <div
            key={candidate.id}
            className="glass rounded-3xl p-6 flex flex-col items-center text-center animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-4">
              {candidate.nomorUrut}
            </div>
            <img
              src={candidate.photo}
              alt={candidate.name}
              className="w-40 h-40 sm:w-48 sm:h-48 rounded-full object-cover border-4 border-emerald-500/40 shadow-xl mb-4"
              onError={(e) => { e.target.src = 'https://api.dicebear.com/9.x/avataaars/svg?seed=default&backgroundColor=b6e3f4'; }}
            />
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">{candidate.name}</h2>
            <p className="text-emerald-400 font-medium text-lg">Nomor Urut {candidate.nomorUrut}</p>

            {isActive && (
              <button
                onClick={() => handleVote(candidate.id)}
                disabled={voting}
                className="mt-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {voting ? 'Mengirim...' : '🗳️ Pilih'}
              </button>
            )}
            <p className="text-gray-400 mt-2">🗳️ {candidate.voteCount || 0} suara</p>
          </div>
        ))}
      </div>
    </div>
  );
}