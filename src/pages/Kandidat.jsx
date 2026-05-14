import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Celebration from '../components/Celebration';

export default function Kandidat() {
  const {
    data, currentUser, isElectionActive, hasUserVoted, castVote,
    setShowLoginModal, setLoginMode
  } = useApp();
  const navigate = useNavigate();
  const [showDetail, setShowDetail] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Fungsi untuk memulai voting (buka konfirmasi)
  const handleVote = (candidateId) => {
    if (!currentUser) {
      setLoginMode('voter');
      setShowLoginModal(true);
      return;
    }
    if (hasUserVoted) {
      alert('Anda sudah memberikan suara.');
      return;
    }
    if (!isElectionActive) {
      alert('Pemilihan sudah ditutup.');
      return;
    }
    setShowConfirm(candidateId);
  };

  // ✅ Fungsi konfirmasi suara (async, deteksi IP dari context)
  const confirmVote = async () => {
    const result = await castVote(showConfirm);
    if (result.success) {
      setShowConfirm(null);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 4000);
    } else {
      alert(result.message);
      setShowConfirm(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <Celebration show={showCelebration} />

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          👥 Daftar <span className="gradient-text">Kandidat</span>
        </h1>
        <p className="text-gray-400 mt-2">
          Kenali visi & misi setiap kandidat sebelum memilih
        </p>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {data.candidates.map((candidate, index) => (
          <div
            key={candidate.id}
            className="glass rounded-3xl p-6 glow-card shine flex flex-col items-center text-center animate-slide-up relative"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Nomor Urut Badge */}
            <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              {candidate.nomorUrut}
            </div>

            {/* Photo */}
            <div className="relative">
              <img
                src={candidate.photo}
                alt={candidate.name}
                className="w-28 h-28 rounded-full object-cover border-4 border-emerald-600/40 shadow-lg mb-4"
                onError={(e) => {
                  e.target.src =
                    'https://api.dicebear.com/9.x/avataaars/svg?seed=default&backgroundColor=b6e3f4';
                }}
              />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm">
                ✓
              </div>
            </div>

            {/* Name */}
            <h3 className="text-xl font-bold text-gray-100 mt-2">
              {candidate.name}
            </h3>
            <p className="text-sm text-emerald-400 font-medium">
              Nomor Urut {candidate.nomorUrut}
            </p>

            {/* Visi Preview */}
            <p className="text-gray-400 text-sm mt-3 line-clamp-2">
              {candidate.visi}
            </p>

            {/* Vote Count */}
            <div className="mt-3 bg-emerald-900/40 rounded-full px-4 py-1 text-sm font-semibold text-emerald-300">
              🗳️ {candidate.voteCount} Suara
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-5 w-full">
              <button
                onClick={() => setShowDetail(candidate)}
                className="flex-1 px-4 py-2.5 border-2 border-emerald-500 text-emerald-300 rounded-xl font-semibold text-sm hover:bg-emerald-500/20 transition-all"
              >
                📋 Detail
              </button>
              <button
                onClick={() => handleVote(candidate.id)}
                disabled={!isElectionActive || hasUserVoted}
                className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  isElectionActive && !hasUserVoted
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg btn-ripple'
                    : 'bg-dark-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                🗳️ Vote
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {data.candidates.length === 0 && (
        <div className="text-center py-16 glass rounded-3xl">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-gray-200">
            Belum Ada Kandidat
          </h3>
          <p className="text-gray-400">
            Admin belum menambahkan kandidat.
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDetail(null)}
          ></div>
          <div className="relative bg-dark-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto animate-bounce-in shadow-2xl border border-emerald-700/30">
            <button
              onClick={() => setShowDetail(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-dark-700 rounded-full flex items-center justify-center text-gray-400 hover:bg-dark-600"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <img
                src={showDetail.photo}
                alt={showDetail.name}
                className="w-24 h-24 rounded-full mx-auto border-4 border-emerald-600/40 object-cover"
                onError={(e) => {
                  e.target.src =
                    'https://api.dicebear.com/9.x/avataaars/svg?seed=default';
                }}
              />
              <h2 className="text-2xl font-bold text-white mt-3">
                {showDetail.name}
              </h2>
              <span className="inline-block bg-emerald-900/40 text-emerald-300 px-3 py-1 rounded-full text-sm font-semibold mt-1">
                Nomor Urut {showDetail.nomorUrut}
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-emerald-900/30 rounded-2xl p-4">
                <h4 className="font-bold text-emerald-400 mb-2">🎯 Visi</h4>
                <p className="text-gray-300 text-sm">{showDetail.visi}</p>
              </div>
              <div className="bg-emerald-900/20 rounded-2xl p-4">
                <h4 className="font-bold text-emerald-400 mb-2">📋 Misi</h4>
                <p className="text-gray-300 text-sm whitespace-pre-line">
                  {showDetail.misi}
                </p>
              </div>
              <div className="text-center">
                <span className="text-emerald-400 font-semibold">
                  🗳️ {showDetail.voteCount} Suara
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowDetail(null);
                handleVote(showDetail.id);
              }}
              disabled={!isElectionActive || hasUserVoted}
              className={`w-full mt-6 py-3 rounded-xl font-semibold transition-all ${
                isElectionActive && !hasUserVoted
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg'
                  : 'bg-dark-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              🗳️ Vote Kandidat Ini
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowConfirm(null)}
          ></div>
          <div className="relative bg-dark-800 rounded-2xl p-8 max-w-sm w-full text-center animate-bounce-in shadow-2xl border border-emerald-700/30">
            <div className="text-5xl mb-4">🗳️</div>
            <h3 className="text-xl font-bold text-white">
              Konfirmasi Pilihan
            </h3>
            <p className="text-gray-400 mt-2">
              Suara Anda tidak dapat diubah setelah ini.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 px-4 py-2.5 border-2 border-dark-600 rounded-xl font-semibold text-gray-300"
              >
                Batal
              </button>
              <button
                onClick={confirmVote}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}