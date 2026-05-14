import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData)
      .catch(() => console.log('Gagal fetch data'));
    const interval = setInterval(() => {
      fetch('/api/data')
        .then(res => res.json())
        .then(setData);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div className="text-white text-center pt-20">Memuat dashboard...</div>;

  const totalVotes = data.candidates.reduce((sum, c) => sum + (c.voteCount || 0), 0);
  const isActive = data.settings.isElectionActive && new Date(data.settings.electionEndTime) > new Date();
  const sorted = [...data.candidates].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));

  return (
    <div className="pb-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
           {isActive ? 'Suara Sementara' : 'Hasil Akhir'}
        </h1>

        {/* Statistik */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-2xl p-4 text-center border border-emerald-700/30">
            <p className="text-gray-400 text-sm">Total Suara</p>
            <p className="text-2xl font-bold text-white">{totalVotes}</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-4 text-center border border-emerald-700/30">
            <p className="text-gray-400 text-sm">Kandidat</p>
            <p className="text-2xl font-bold text-white">{data.candidates.length}</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-4 text-center border border-emerald-700/30">
            <p className="text-gray-400 text-sm">Status</p>
            <p className={`text-lg font-bold ${isActive ? 'text-green-400' : 'text-red-400'}`}>
              {isActive ? 'Berlangsung' : 'Ditutup'}
            </p>
          </div>
        </div>

        {/* Progress kandidat */}
        <div className="space-y-4">
          {sorted.map((candidate, index) => {
            const percentage = totalVotes > 0 ? ((candidate.voteCount || 0) / totalVotes) * 100 : 0;
            return (
              <div key={candidate.id} className="bg-gray-800 rounded-2xl p-4 border border-emerald-700/30">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                  <img
                    src={candidate.photo}
                    alt={candidate.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500/30"
                    onError={(e) => { e.target.src = 'https://api.dicebear.com/9.x/avataaars/svg?seed=default'; }}
                  />
                  <span className="font-semibold text-white flex-1">{candidate.name}</span>
                  <span className="text-emerald-400 font-bold">{candidate.voteCount || 0} suara</span>
                  <span className="text-gray-400 text-sm">{percentage.toFixed(1)}%</span>
                </div>
                <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}