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
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  const { days, hours, minutes, seconds } = timeLeft;
  if (days + hours + minutes + seconds === 0) {
    return <span className="text-red-400 font-bold text-base sm:text-lg">Waktu habis</span>;
  }

  const units = [
    { value: days, label: 'Hari' },
    { value: hours, label: 'Jam' },
    { value: minutes, label: 'Menit' },
    { value: seconds, label: 'Detik' },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
      {units.map((unit, idx) => (
        <div key={unit.label} className="flex items-center gap-1 sm:gap-2">
          <div className="bg-emerald-800 rounded-lg sm:rounded-xl px-3 py-2 text-center min-w-[60px] sm:min-w-[70px]">
            <span className="text-xl sm:text-2xl font-bold tabular-nums text-white">
              {String(unit.value).padStart(2, '0')}
            </span>
            <p className="text-2xs sm:text-xs text-emerald-300 mt-1">{unit.label}</p>
          </div>
          {idx < 3 && <span className="text-xl sm:text-2xl text-emerald-400 font-bold">:</span>}
        </div>
      ))}
    </div>
  );
}

export default function Beranda() {
  const [data, setData] = useState(null);

  const fetchData = () => {
    fetch('/api/data')
      .then((res) => res.json())
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
    <div className="pb-10 sm:pb-12 px-3 sm:px-4">
      <div className="text-center mt-6 mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
          🗳️ {data.settings.electionTitle}
        </h1>
        <p className="text-gray-400 text-sm sm:text-base mt-2">Pemilihan Ketua Umum</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto mb-8 sm:mb-10">
        <div className="bg-gray-800/80 backdrop-blur rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border border-emerald-700/30">
          <p className="text-3xl sm:text-4xl mb-1 sm:mb-2">👥</p>
          <p className="text-2xl sm:text-3xl font-bold text-white">{data.candidates.length}</p>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">Jumlah Kandidat</p>
        </div>
        <div className="bg-gray-800/80 backdrop-blur rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border border-emerald-700/30">
          <p className="text-3xl sm:text-4xl mb-1 sm:mb-2">📥</p>
          <p className="text-2xl sm:text-3xl font-bold text-white">{totalVotes}</p>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">Suara Masuk</p>
        </div>
        <div className="bg-gray-800/80 backdrop-blur rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border border-emerald-700/30">
          <p className="text-3xl sm:text-4xl mb-1 sm:mb-2">⏳</p>
          <p className="text-gray-400 text-xs sm:text-sm mb-2">Waktu Tersisa</p>
          {isActive ? (
            <CountdownTimer endTime={data.settings.electionEndTime} />
          ) : (
            <span className="text-red-400 font-bold text-base sm:text-lg">Pemilihan ditutup</span>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
        <Link
          to="/scan"
          className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 sm:px-8 py-3 rounded-xl font-bold text-base sm:text-lg hover:shadow-lg transition text-center"
        >
          🗳️ Mulai Voting
        </Link>
        <Link
          to="/dashboard"
          className="w-full sm:w-auto bg-gray-700 text-white px-6 sm:px-8 py-3 rounded-xl font-bold text-base sm:text-lg hover:bg-gray-600 transition text-center"
        >
          📊 Lihat Hasil
        </Link>
      </div>
    </div>
  );
}