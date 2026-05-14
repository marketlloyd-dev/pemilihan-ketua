import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { exportToExcel } from '../utils/excelExport';

export default function Hasil() {
  const { data, totalVotes, isElectionActive } = useApp();

  const sortedCandidates = useMemo(() => {
    return [...data.candidates].sort((a, b) => b.voteCount - a.voteCount);
  }, [data.candidates]);

  const maxVotes = Math.max(...data.candidates.map(c => c.voteCount), 1);
  const winner = sortedCandidates[0];

  const handleExport = () => {
    exportToExcel(data.candidates, data.settings.electionTitle, totalVotes, data.voters.length);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          📊 Hasil <span className="gradient-text">Pemilihan</span>
        </h1>
        <p className="text-gray-400 mt-2">
          {isElectionActive ? 'Hasil sementara - pemilihan masih berlangsung' : 'Hasil akhir pemilihan'}
        </p>
      </div>

      {totalVotes > 0 && winner && (
        <div className="glass rounded-3xl p-8 text-center max-w-xl mx-auto border-2 border-yellow-500/30 shadow-xl shadow-yellow-500/10 animate-glow">
          <div className="text-6xl mb-3">🏆</div>
          <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider">
            {isElectionActive ? 'Leading' : 'Pemenang'}
          </h3>
          <img
            src={winner.photo}
            alt={winner.name}
            className="w-20 h-20 rounded-full mx-auto my-3 border-4 border-yellow-500/40 object-cover"
            onError={(e) => { e.target.src = 'https://api.dicebear.com/9.x/avataaars/svg?seed=winner'; }}
          />
          <h2 className="text-2xl font-extrabold text-gray-100">{winner.name}</h2>
          <p className="text-emerald-400 font-bold text-lg">{winner.voteCount} Suara</p>
          <p className="text-gray-400 text-sm">
            ({totalVotes > 0 ? ((winner.voteCount / totalVotes) * 100).toFixed(1) : 0}% suara)
          </p>
        </div>
      )}

      <div className="glass rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <h3 className="text-xl font-bold text-gray-200">📋 Detail Perolehan Suara</h3>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-all"
          >
            📥 Export ke Excel
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-emerald-900/30 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400">Total Suara</p>
            <p className="text-xl font-bold text-emerald-300">{totalVotes}</p>
          </div>
          <div className="bg-emerald-900/20 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400">Pemilih</p>
            <p className="text-xl font-bold text-emerald-300">{data.voters.length}</p>
          </div>
          <div className="bg-emerald-900/20 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400">Kandidat</p>
            <p className="text-xl font-bold text-emerald-300">{data.candidates.length}</p>
          </div>
          <div className="bg-emerald-900/20 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400">Partisipasi</p>
            <p className="text-xl font-bold text-emerald-300">
              {data.voters.length > 0 ? ((totalVotes / data.voters.length) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {sortedCandidates.map((candidate, index) => {
            const percentage = totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;
            return (
              <div key={candidate.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-lg font-bold text-gray-400 w-6">#{index + 1}</span>
                  <img
                    src={candidate.photo}
                    alt={candidate.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500/30"
                    onError={(e) => { e.target.src = 'https://api.dicebear.com/9.x/avataaars/svg?seed=default'; }}
                  />
                  <span className="font-semibold text-gray-200 text-sm flex-1">{candidate.name}</span>
                  <span className="font-bold text-emerald-400 text-sm">{candidate.voteCount} suara</span>
                  <span className="text-xs text-gray-500 w-12 text-right">{percentage.toFixed(1)}%</span>
                </div>
                <div className="h-5 bg-dark-700 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                    style={{ width: `${percentage}%` }}
                  >
                    {percentage > 15 && (
                      <span className="text-white text-xs font-bold">{percentage.toFixed(0)}%</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {totalVotes === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-400">Belum ada suara masuk.</p>
          </div>
        )}
      </div>
    </div>
  );
}