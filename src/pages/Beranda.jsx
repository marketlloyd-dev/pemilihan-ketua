import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import CountdownTimer from '../components/CountdownTimer';
import Celebration from '../components/Celebration';

export default function Beranda() {
  const {
    data, currentUser, isElectionActive, remainingTime,
    totalVotes, totalVoters, hasUserVoted, castVote,
    setShowLoginModal, setLoginMode
  } = useApp();
  const navigate = useNavigate();
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showVoteConfirm, setShowVoteConfirm] = useState(false);

  const handleVoteClick = () => {
    if (!currentUser) {
      setLoginMode('voter');
      setShowLoginModal(true);
      return;
    }
    if (hasUserVoted) {
      alert('Anda sudah memberikan suara. Terima kasih!');
      return;
    }
    if (!isElectionActive) {
      alert('Pemilihan sudah ditutup.');
      return;
    }
    navigate('/kandidat');
  };

  const quickVote = (candidateId) => {
    if (!currentUser) {
      setLoginMode('voter');
      setShowLoginModal(true);
      return;
    }
    if (hasUserVoted) {
      alert('Anda sudah memberikan suara.');
      return;
    }
    setSelectedCandidate(candidateId);
    setShowVoteConfirm(true);
  };

  // ✅ Fungsi konfirmasi suara (async, dilengkapi deteksi IP dari context)
  const confirmVote = async () => {
    const result = await castVote(selectedCandidate);
    if (result.success) {
      setShowVoteConfirm(false);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 4000);
    } else {
      alert(result.message);
      setShowVoteConfirm(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <Celebration show={showCelebration} />

      {/* Hero Section */}
      <div className="text-center py-6 sm:py-10">
        <div className="inline-block mb-4">
          <span className="bg-emerald-900/40 text-emerald-300 px-4 py-1.5 rounded-full text-sm font-semibold border border-emerald-600/30">
            🗳️ {data.settings.electionTitle}
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
          Pilih <span className="gradient-text">Pemimpin</span> Terbaik
        </h1>
        <p className="text-gray-300 mt-4 max-w-2xl mx-auto text-sm sm:text-base">
          Gunakan hak suara Anda untuk memilih ketua yang akan membawa perubahan positif.
          Setiap suara sangat berarti!
        </p>
      </div>

      {/* Countdown Timer */}
      {isElectionActive && (
        <div className="glass rounded-3xl p-6 sm:p-8 text-center max-w-2xl mx-auto shadow-xl shadow-emerald-900/30">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">⏳ Waktu Tersisa</h3>
          <CountdownTimer remainingMs={remainingTime} />
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
        {/* Total Kandidat */}
        <div className="glass rounded-2xl p-6 text-center glow-card shine">
          <div className="text-4xl mb-3">👥</div>
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 animate-count-up">
            {data.candidates.length}
          </div>
          <p className="text-gray-400 text-sm mt-1">Jumlah Kandidat</p>
        </div>

        {/* Suara Masuk */}
        <div className="glass rounded-2xl p-6 text-center glow-card shine">
          <div className="text-4xl mb-3">📥</div>
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-300 animate-count-up">
            {totalVotes}
          </div>
          <p className="text-gray-400 text-sm mt-1">Suara Masuk</p>
        </div>

        {/* Pemilih Terdaftar */}
        <div className="glass rounded-2xl p-6 text-center glow-card shine">
          <div className="text-4xl mb-3">👤</div>
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-300 animate-count-up">
            {totalVoters}
          </div>
          <p className="text-gray-400 text-sm mt-1">Pemilih Terdaftar</p>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
        {/* Tombol Berikan Suara (Kiri) */}
        <button
          onClick={handleVoteClick}
          disabled={!isElectionActive && !currentUser}
          className={`btn-ripple w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
            isElectionActive && !hasUserVoted
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-500/30 hover:scale-105 animate-glow'
              : 'bg-dark-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          🗳️ Berikan Suara
        </button>

        {/* Tombol Lihat Kandidat (Kanan) */}
        <Link
          to="/kandidat"
          className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-lg border-2 border-emerald-500 text-emerald-300 hover:bg-emerald-500/20 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105"
        >
          👥 Lihat Kandidat
        </Link>
      </div>

      {/* Quick Vote Section (only if logged in and hasn't voted) */}
      {currentUser && !hasUserVoted && isElectionActive && (
        <div className="glass rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto shadow-xl">
          <h3 className="text-xl font-bold text-white text-center mb-6">
            ⚡ Vote Cepat - Pilih Kandidat
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {data.candidates.map(candidate => (
              <button
                key={candidate.id}
                onClick={() => quickVote(candidate.id)}
                className="bg-emerald-900/40 rounded-2xl p-5 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-emerald-500 shine"
              >
                <img
                  src={candidate.photo}
                  alt={candidate.name}
                  className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-emerald-600/40 object-cover"
                  onError={(e) => { e.target.src = 'https://api.dicebear.com/9.x/avataaars/svg?seed=default'; }}
                />
                <p className="font-bold text-gray-200">{candidate.name}</p>
                <p className="text-xs text-emerald-400 font-semibold mt-1">Nomor Urut {candidate.nomorUrut}</p>
                <span className="inline-block mt-2 text-xs bg-emerald-800/50 text-emerald-300 px-2 py-1 rounded-full">
                  Klik untuk Vote
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Already Voted Message */}
      {hasUserVoted && (
        <div className="glass rounded-3xl p-8 text-center max-w-lg mx-auto border-2 border-emerald-500/40">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-emerald-300">Anda Sudah Memberikan Suara</h3>
          <p className="text-gray-300 mt-2">Terima kasih atas partisipasi Anda!</p>
          <Link
            to="/hasil"
            className="inline-block mt-4 px-6 py-2 bg-emerald-500 text-white rounded-full font-semibold hover:bg-emerald-600 transition-all"
          >
            Lihat Hasil
          </Link>
        </div>
      )}

      {/* Vote Confirmation Modal */}
      {showVoteConfirm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowVoteConfirm(false)}></div>
          <div className="relative bg-dark-800 rounded-2xl p-8 max-w-sm w-full text-center animate-bounce-in shadow-2xl border border-emerald-700/30">
            <div className="text-5xl mb-4">🤔</div>
            <h3 className="text-xl font-bold text-white">Konfirmasi Suara</h3>
            <p className="text-gray-400 mt-2">
              Apakah Anda yakin ingin memilih kandidat ini? Suara tidak dapat diubah.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowVoteConfirm(false)}
                className="flex-1 px-4 py-2.5 border-2 border-dark-600 rounded-xl font-semibold text-gray-300 hover:bg-dark-700 transition-all"
              >
                Batal
              </button>
              <button
                onClick={confirmVote}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Ya, Vote!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}