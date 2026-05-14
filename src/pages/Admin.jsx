import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Admin() {
  const { data, loading, currentUser, loginAdmin, logout } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (loading) return <div className="text-white text-center pt-20">Memuat...</div>;

  // Jika belum login, tampilkan form login
  if (!currentUser || currentUser.role !== 'admin') {
    const handleLogin = (e) => {
      e.preventDefault();
      loginAdmin(username, password);
    };

    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <form onSubmit={handleLogin} className="glass rounded-2xl p-8 max-w-sm w-full">
          <h2 className="text-white text-xl font-bold mb-4">Login Admin</h2>
          <input
            type="text"
            placeholder="admin"
            className="w-full mb-3 px-4 py-2 bg-dark-800 border border-emerald-600/30 rounded-xl text-white"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="admin123"
            className="w-full mb-4 px-4 py-2 bg-dark-800 border border-emerald-600/30 rounded-xl text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-emerald-500 text-white py-2 rounded-xl">Masuk</button>
        </form>
      </div>
    );
  }

  // Sudah login
  return (
    <div className="text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Panel Admin</h1>
        <button onClick={logout} className="bg-red-600 px-4 py-2 rounded-xl">Logout</button>
      </div>

      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="text-xl mb-4">Daftar Kandidat ({data.candidates.length})</h2>
        {data.candidates.map(c => (
          <div key={c.id} className="flex items-center gap-4 py-3 border-b border-dark-600">
            <span className="text-2xl font-bold text-emerald-400">#{c.nomorUrut}</span>
            <img src={c.photo} className="w-12 h-12 rounded-full" />
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-gray-400 text-sm">{c.voteCount} suara</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}