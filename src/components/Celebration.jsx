import React, { useEffect, useState } from 'react';

const CONFETTI_COLORS = ['#22c55e', '#4ade80', '#86efac', '#10b981', '#34d399', '#fbbf24', '#f472b6', '#818cf8'];

export default function Celebration({ show }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (show) {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        delay: Math.random() * 0.5,
        duration: Math.random() * 2 + 2,
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => setParticles([]), 3500);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size * 1.5}px`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            animation: `confetti ${p.duration}s ease-out ${p.delay}s forwards`,
            opacity: 0,
          }}
        />
      ))}
      {/* Success message */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-8 text-center animate-bounce-in">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-primary-700">Suara Berhasil!</h2>
        <p className="text-gray-600 mt-2">Terima kasih telah berpartisipasi</p>
      </div>
    </div>
  );
}