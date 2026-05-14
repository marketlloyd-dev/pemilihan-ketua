import React from 'react';
import { useApp } from '../context/AppContext';

export default function Scan() {
  const { data } = useApp();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          📋 Daftar <span className="gradient-text">Kandidat</span>
        </h1>
        <p className="text-gray-400 mt-2">
          {data.settings.electionTitle}
        </p>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {data.candidates.length === 0 ? (
          <div className="col-span-full text-center py-16 glass rounded-3xl">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-200">Belum Ada Kandidat</h3>
            <p className="text-gray-400">Admin belum menambahkan kandidat.</p>
          </div>
        ) : (
          data.candidates.map((candidate, index) => (
            <div
              key={candidate.id}
              className="glass rounded-3xl p-6 flex flex-col items-center text-center animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Nomor Urut */}
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-4">
                {candidate.nomorUrut}
              </div>

              {/* Foto */}
              <img
                src={candidate.photo}
                alt={candidate.name}
                className="w-40 h-40 sm:w-48 sm:h-48 rounded-full object-cover border-4 border-emerald-500/40 shadow-xl mb-4"
                onError={(e) => { e.target.src = 'https://api.dicebear.com/9.x/avataaars/svg?seed=default&backgroundColor=b6e3f4'; }}
              />

              {/* Nama */}
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">
                {candidate.name}
              </h2>
              <p className="text-emerald-400 font-medium text-lg">
                Nomor Urut {candidate.nomorUrut}
              </p>

              {/* Visi Misi (opsional, bisa ditampilkan) */}
              <div className="mt-4 text-left w-full">
                <p className="text-gray-300 text-sm"><span className="font-semibold text-emerald-400">Visi:</span> {candidate.visi}</p>
                <p className="text-gray-400 text-xs mt-2 whitespace-pre-line"><span className="font-semibold text-emerald-400">Misi:</span> {candidate.misi}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}