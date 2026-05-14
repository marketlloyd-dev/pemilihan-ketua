import React, { useState, useEffect } from 'react';

export default function CountdownTimer({ remainingMs }) {
  const [timeLeft, setTimeLeft] = useState(remainingMs);

  useEffect(() => {
    setTimeLeft(remainingMs);
  }, [remainingMs]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1000) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const timeUnits = [
    { value: days, label: 'Hari' },
    { value: hours, label: 'Jam' },
    { value: minutes, label: 'Menit' },
    { value: seconds, label: 'Detik' },
  ];

  if (timeLeft <= 0) {
    return (
      <div className="text-center py-4 px-6 bg-red-900/30 border border-red-700 rounded-2xl animate-pulse">
        <span className="text-red-300 font-bold text-lg">⏰ Pemilihan Telah Ditutup</span>
      </div>
    );
  }

  return (
    <div className="flex gap-2 sm:gap-3 justify-center">
      {timeUnits.map((unit, idx) => (
        <div key={unit.label} className="flex items-center gap-2 sm:gap-3">
          <div className="flex flex-col items-center">
            <div className="bg-emerald-900/60 backdrop-blur-sm border-2 border-emerald-600/40 rounded-xl sm:rounded-2xl w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center shadow-lg shadow-emerald-900/30 animate-float" style={{ animationDelay: `${idx * 0.2}s` }}>
              <span className="text-2xl sm:text-4xl font-extrabold text-emerald-300 tabular-nums">
                {String(unit.value).padStart(2, '0')}
              </span>
            </div>
            <span className="text-xs sm:text-sm text-gray-300 font-medium mt-1.5">{unit.label}</span>
          </div>
          {idx < 3 && (
            <span className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-[-20px]">:</span>
          )}
        </div>
      ))}
    </div>
  );
}