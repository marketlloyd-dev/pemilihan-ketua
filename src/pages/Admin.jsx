import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import QRCode from 'react-qr-code';

export default function Admin() {
  const {
    data, currentUser,
    loginAdmin, logout,
    addCandidate, updateCandidate, deleteCandidate, updateSettings,
  } = useApp();

  const [activeTab, setActiveTab] = useState('candidates');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', photo: '', visi: '', misi: '', nomorUrut: '',
  });
  const [settingsForm, setSettingsForm] = useState({
    electionTitle: data.settings.electionTitle,
    electionEndTime: new Date(data.settings.electionEndTime).toISOString().slice(0, 16),
    isElectionActive: data.settings.isElectionActive,
  });
  const [showQR, setShowQR] = useState(false);
  const fileInputRef = useRef(null);

  // State form login
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // ✅ Fungsi handle login
  const handleAdminLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    const success = loginAdmin(loginForm.username, loginForm.password);
    if (!success) {
      setLoginError('Username atau password salah.');
    }
  };

  // ========== JIKA BELUM LOGIN, TAMPILKAN FORM LOGIN ==========
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 animate-fade-in">
        <div className="glass rounded-3xl p-8 max-w-md w-full shadow-2xl border border-emerald-700/30">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🔐</div>
            <h2 className="text-2xl font-bold text-white">Login Admin</h2>
            <p className="text-gray-400 text-sm mt-1">Masuk untuk mengelola sistem</p>
          </div>

          {loginError && (
            <div className="bg-red-900/30 border border-red-600 text-red-300 px-4 py-3 rounded-xl text-sm mb-4">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={e => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 bg-dark-800 border border-emerald-600/30 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-400"
                placeholder="username_admin"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={e => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 bg-dark-800 border border-emerald-600/30 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-400"
                placeholder="password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
            >
              Masuk
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ========== JIKA SUDAH LOGIN, TAMPILKAN PANEL ADMIN ==========
  // Fungsi kandidat
  const handleAddCandidate = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.visi || !formData.misi) {
      alert('Mohon lengkapi data kandidat.');
      return;
    }
    addCandidate({
      name: formData.name,
      photo: formData.photo || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(formData.name)}&backgroundColor=b6e3f4`,
      visi: formData.visi,
      misi: formData.misi,
      nomorUrut: parseInt(formData.nomorUrut) || data.candidates.length + 1,
    });
    setFormData({ name: '', photo: '', visi: '', misi: '', nomorUrut: '' });
    setShowAddForm(false);
  };

  const handleUpdateCandidate = (e) => {
    e.preventDefault();
    updateCandidate(editingId, {
      name: formData.name,
      photo: formData.photo,
      visi: formData.visi,
      misi: formData.misi,
      nomorUrut: parseInt(formData.nomorUrut),
    });
    setEditingId(null);
    setFormData({ name: '', photo: '', visi: '', misi: '', nomorUrut: '' });
    setShowAddForm(false);
  };

  const handleEdit = (candidate) => {
    setEditingId(candidate.id);
    setFormData({
      name: candidate.name,
      photo: candidate.photo,
      visi: candidate.visi,
      misi: candidate.misi,
      nomorUrut: candidate.nomorUrut.toString(),
    });
    setShowAddForm(true);
  };

  const handleSettingsSave = (e) => {
    e.preventDefault();
    updateSettings(settingsForm);
    alert('✅ Pengaturan berhasil disimpan!');
  };

  const handleStopElection = () => {
    if (confirm('🛑 Hentikan pemilihan sekarang juga?')) {
      updateSettings({
        ...settingsForm,
        electionEndTime: new Date().toISOString(),
        isElectionActive: false,
      });
      setSettingsForm(prev => ({
        ...prev,
        electionEndTime: new Date().toISOString().slice(0, 16),
        isElectionActive: false,
      }));
      alert('✅ Pemilihan telah dihentikan.');
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, photo: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">
            ⚙️ Panel <span className="gradient-text">Admin</span>
          </h1>
          <p className="text-gray-400 text-sm">Kelola kandidat & pengaturan</p>
        </div>
        <button
          onClick={() => setShowQR(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all"
        >
          📱 QR Code
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-dark-800/50 rounded-2xl p-1.5 shadow-sm">
        {[
          { key: 'candidates', label: '👥 Kandidat', count: data.candidates.length },
          { key: 'settings', label: '⚙️ Pengaturan', count: null },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-gray-400 hover:bg-emerald-800/30'
            }`}
          >
            {tab.label} {tab.count !== null && `(${tab.count})`}
          </button>
        ))}
      </div>

      {/* Tab Kandidat */}
      {activeTab === 'candidates' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-200">Daftar Kandidat</h3>
            <button
              onClick={() => {
                setShowAddForm(true);
                setEditingId(null);
                setFormData({ name: '', photo: '', visi: '', misi: '', nomorUrut: '' });
              }}
              className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-all"
            >
              + Tambah Kandidat
            </button>
          </div>

          {showAddForm && (
            <div className="glass rounded-2xl p-6 animate-slide-down">
              <h4 className="font-bold text-white mb-4">
                {editingId ? '✏️ Edit Kandidat' : '➕ Tambah Kandidat Baru'}
              </h4>
              <form onSubmit={editingId ? handleUpdateCandidate : handleAddCandidate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nama Kandidat *</label>
                    <input type="text" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-2.5 bg-dark-800 border border-emerald-600/30 rounded-xl text-white placeholder-gray-500" placeholder="Nama lengkap" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nomor Urut</label>
                    <input type="number" value={formData.nomorUrut} onChange={e => setFormData(prev => ({ ...prev, nomorUrut: e.target.value }))} className="w-full px-4 py-2.5 bg-dark-800 border border-emerald-600/30 rounded-xl text-white" placeholder="1" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Foto Kandidat</label>
                  <div className="flex items-center gap-3">
                    <input type="text" value={formData.photo} onChange={e => setFormData(prev => ({ ...prev, photo: e.target.value }))} className="flex-1 px-4 py-2.5 bg-dark-800 border border-emerald-600/30 rounded-xl text-white" placeholder="URL foto atau upload" />
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2.5 border-2 border-dashed border-emerald-600/30 rounded-xl text-sm text-gray-300 hover:border-emerald-400 transition-all">
                      📁 Upload
                    </button>
                  </div>
                  {formData.photo && (
                    <img src={formData.photo} alt="Preview" className="w-20 h-20 rounded-full object-cover mt-2 border-2 border-emerald-600/30" onError={(e) => { e.target.style.display = 'none'; }} />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Visi *</label>
                  <textarea value={formData.visi} onChange={e => setFormData(prev => ({ ...prev, visi: e.target.value }))} className="w-full px-4 py-2.5 bg-dark-800 border border-emerald-600/30 rounded-xl text-white" rows="2" placeholder="Visi kandidat"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Misi *</label>
                  <textarea value={formData.misi} onChange={e => setFormData(prev => ({ ...prev, misi: e.target.value }))} className="w-full px-4 py-2.5 bg-dark-800 border border-emerald-600/30 rounded-xl text-white" rows="3" placeholder="Misi kandidat"></textarea>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-emerald-600 transition-all">
                    {editingId ? '💾 Simpan Perubahan' : '➕ Tambahkan'}
                  </button>
                  <button type="button" onClick={() => { setShowAddForm(false); setEditingId(null); }} className="px-6 py-2.5 border-2 border-dark-600 rounded-xl font-semibold text-gray-300 hover:bg-dark-700 transition-all">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid gap-4">
            {data.candidates.map(candidate => (
              <div key={candidate.id} className="glass rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 glow-card">
                <span className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-lg shrink-0">{candidate.nomorUrut}</span>
                <img src={candidate.photo} alt={candidate.name} className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500/30 shrink-0" onError={(e) => { e.target.src = 'https://api.dicebear.com/9.x/avataaars/svg?seed=default'; }} />
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="font-bold text-gray-200">{candidate.name}</h4>
                  <p className="text-sm text-gray-400 line-clamp-1">{candidate.visi}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(candidate)} className="px-3 py-1.5 bg-blue-900/30 text-blue-300 rounded-lg text-sm hover:bg-blue-800/40 transition-all">✏️ Edit</button>
                  <button onClick={() => { if (confirm('Hapus kandidat ini?')) deleteCandidate(candidate.id); }} className="px-3 py-1.5 bg-red-900/30 text-red-300 rounded-lg text-sm hover:bg-red-800/40 transition-all">🗑️ Hapus</button>
                </div>
              </div>
            ))}
            {data.candidates.length === 0 && (
              <div className="text-center py-10 glass rounded-2xl">
                <p className="text-gray-400">Belum ada kandidat. Tambahkan sekarang!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Pengaturan */}
      {activeTab === 'settings' && (
        <div className="glass rounded-2xl p-6 animate-slide-up">
          <h3 className="text-lg font-bold text-gray-200 mb-4">⚙️ Pengaturan</h3>
          <form onSubmit={handleSettingsSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Judul Pemilihan</label>
              <input type="text" value={settingsForm.electionTitle} onChange={e => setSettingsForm(prev => ({ ...prev, electionTitle: e.target.value }))} className="w-full px-4 py-2.5 bg-dark-800 border border-emerald-600/30 rounded-xl text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Waktu Berakhir</label>
              <input type="datetime-local" value={settingsForm.electionEndTime} onChange={e => setSettingsForm(prev => ({ ...prev, electionEndTime: e.target.value }))} className="w-full px-4 py-2.5 bg-dark-800 border border-emerald-600/30 rounded-xl text-white" />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isActive" checked={settingsForm.isElectionActive} onChange={e => setSettingsForm(prev => ({ ...prev, isElectionActive: e.target.checked }))} className="w-5 h-5 text-emerald-500 rounded" />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-300">Pemilihan Aktif</label>
            </div>
            <div className="mt-4">
              <button type="button" onClick={handleStopElection} className="w-full sm:w-auto bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-red-700 transition-all">
                🛑 Stop Pemilihan Sekarang
              </button>
            </div>
            <button type="submit" className="bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-emerald-600 transition-all">
              💾 Simpan Pengaturan
            </button>
          </form>
        </div>
      )}

      {/* Modal QR Code */}
      {showQR && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowQR(false)}></div>
          <div className="relative bg-dark-800 rounded-3xl p-8 max-w-sm w-full text-center animate-bounce-in shadow-2xl border border-emerald-700/30">
            <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 w-8 h-8 bg-dark-700 rounded-full flex items-center justify-center text-gray-400 hover:bg-dark-600">✕</button>
            <h3 className="text-xl font-bold text-white mb-4">📱 Scan QR Code</h3>
            <p className="text-gray-400 text-sm mb-6">Pindai untuk melihat daftar kandidat</p>
            <div className="bg-white p-4 rounded-2xl inline-block">
              <QRCode value={`${window.location.origin}/scan`} size={200} bgColor="#ffffff" fgColor="#064e3b" level="H" />
            </div>
            <p className="text-gray-500 text-xs mt-4">URL: {window.location.origin}/scan</p>
            <button onClick={() => setShowQR(false)} className="mt-4 bg-emerald-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-emerald-600 transition-all">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}