import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function CountdownTimer({ endTime }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const now = new Date().getTime();
    const end = new Date(endTime).getTime();
    const diff = end - now;
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  const { days, hours, minutes, seconds } = timeLeft;

  if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
    return <span className="text-red-400 font-bold text-lg">Waktu habis</span>;
  }

  return (
    <div className="flex gap-2 justify-center text-white font-bold">
      <div className="bg-emerald-800 rounded-xl px-3 py-2 text-center">
        <span className="text-2xl">{days}</span>
        <p className="text-xs text-emerald-300">Hari</p>
      </div>
      <div className="bg-emerald-800 rounded-xl px-3 py-2 text-center">
        <span className="text-2xl">{hours}</span>
        <p className="text-xs text-emerald-300">Jam</p>
      </div>
      <div className="bg-emerald-800 rounded-xl px-3 py-2 text-center">
        <span className="text-2xl">{minutes}</span>
        <p className="text-xs text-emerald-300">Menit</p>
      </div>
      <div className="bg-emerald-800 rounded-xl px-3 py-2 text-center">
        <span className="text-2xl">{seconds}</span>
        <p className="text-xs text-emerald-300">Detik</p>
      </div>
    </div>
  );
}

export default function Beranda() {
  const [data, setData] = useState(null);

  const fetchData = () => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData)
      .catch(() => {});
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div className="text-white text-center pt-20">Memuat...</div>;

  const totalVotes = data.candidates.reduce((sum, c) => sum + (c.voteCount || 0), 0);
  const isActive = data.settings.isElectionActive && new Date(data.settings.electionEndTime) > new Date();

  return (
    <div className="pb-12">
      <div className="text-center mt-6 mb-10">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
          🗳️ {data.settings.electionTitle}
        </h1>
        <p className="text-gray-400 mt-2">Tema : tema "Optimalisasi regenerasi pemimpin muda HIMMAH NW  Yang berkualitas dan berintegritas"</p>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
        <div className="bg-gray-800/80 backdrop-blur rounded-2xl p-6 text-center border border-emerald-700/30">
          <p className="text-4xl mb-2">👥</p>
          <p className="text-3xl font-bold text-white">{data.candidates.length}</p>
          <p className="text-gray-400 text-sm mt-1">Jumlah Kandidat</p>
        </div>
        <div className="bg-gray-800/80 backdrop-blur rounded-2xl p-6 text-center border border-emerald-700/30">
          <p className="text-4xl mb-2">📥</p>
          <p className="text-3xl font-bold text-white">{totalVotes}</p>
          <p className="text-gray-400 text-sm mt-1">Suara Masuk</p>
        </div>
        <div className="bg-gray-800/80 backdrop-blur rounded-2xl p-6 text-center border border-emerald-700/30">
          <p className="text-4xl mb-2">⏳</p>
          <p className="text-gray-400 text-sm mb-2">Waktu Tersisa</p>
          {isActive ? (
            <CountdownTimer endTime={data.settings.electionEndTime} />
          ) : (
            <span className="text-red-400 font-bold">Pemilihan ditutup</span>
          )}
        </div>
      </div>

      {/* Tombol aksi */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/scan"
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-emerald-500/20 transition text-center"
        >
          🗳️ Mulai Voting
        </Link>
        <Link
          to="/dashboard"
          className="bg-gray-700 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-600 transition text-center"
        >
          📊 Lihat Hasil
        </Link>
      </div>
    </div>
  );
}