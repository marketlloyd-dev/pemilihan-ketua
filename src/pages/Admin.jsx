import { useState, useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';
import { exportToExcel } from '../utils/excelExport';

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('candidates');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', photo: '', visi: '', misi: '', nomorUrut: '' });
  const [showQR, setShowQR] = useState(false);
  const [photoSource, setPhotoSource] = useState('url');
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [settingsForm, setSettingsForm] = useState({
    electionTitle: '',
    isElectionActive: true,
    electionEndDate: '',
    electionEndTime: '',
    electionEndAmPm: 'AM',
  });

  const fetchData = () => {
    fetch('/api/data')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        const end = new Date(json.settings.electionEndTime);
        const hours = end.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        setSettingsForm({
          electionTitle: json.settings.electionTitle,
          isElectionActive: json.settings.isElectionActive,
          electionEndDate: end.toISOString().slice(0, 10),
          electionEndTime: `${String(displayHours).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`,
          electionEndAmPm: ampm,
        });
      })
      .catch(() => {});
  };

  useEffect(() => { if (loggedIn) fetchData(); }, [loggedIn]);

  const saveToServer = (newData) => {
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': 'admin123' },
      body: JSON.stringify(newData),
    }).then(fetchData);
  };

  // ---- File upload ----
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData((p) => ({ ...p, photo: ev.target.result }));
      setImagePreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormData({ name: '', photo: '', visi: '', misi: '', nomorUrut: '' });
    setImagePreview(null);
    setPhotoSource('url');
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const newC = {
      id: data.nextCandidateId,
      name: formData.name,
      photo: formData.photo || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(formData.name)}&backgroundColor=b6e3f4`,
      visi: formData.visi,
      misi: formData.misi,
      nomorUrut: parseInt(formData.nomorUrut) || data.candidates.length + 1,
      voteCount: 0,
    };
    saveToServer({ ...data, candidates: [...data.candidates, newC], nextCandidateId: data.nextCandidateId + 1 });
    resetForm();
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    const updated = data.candidates.map((c) =>
      c.id === editingId ? { ...c, name: formData.name, photo: formData.photo || c.photo, visi: formData.visi, misi: formData.misi, nomorUrut: parseInt(formData.nomorUrut) } : c
    );
    saveToServer({ ...data, candidates: updated });
    resetForm();
  };

  const handleDelete = (id) => {
    if (!confirm('Hapus?')) return;
    saveToServer({ ...data, candidates: data.candidates.filter((c) => c.id !== id) });
  };

  // ---- Pengaturan waktu ----
  const handleStart = () => {
    if (!confirm('Mulai?')) return;
    const end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    saveToServer({ ...data, settings: { ...data.settings, isElectionActive: true, electionEndTime: end.toISOString() } });
    setSettingsForm((p) => ({ ...p, isElectionActive: true, electionEndDate: end.toISOString().slice(0, 10), electionEndTime: '12:00', electionEndAmPm: 'PM' }));
  };

  const handlePause = () => {
    if (!confirm('Jeda?')) return;
    saveToServer({ ...data, settings: { ...data.settings, isElectionActive: false } });
    setSettingsForm((p) => ({ ...p, isElectionActive: false }));
  };

  const handleStop = () => {
    if (!confirm('Stop?')) return;
    const now = new Date();
    saveToServer({ ...data, settings: { ...data.settings, isElectionActive: false, electionEndTime: now.toISOString() } });
    const h = now.getHours() % 12 || 12;
    setSettingsForm((p) => ({
      ...p,
      isElectionActive: false,
      electionEndDate: now.toISOString().slice(0, 10),
      electionEndTime: `${String(h).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      electionEndAmPm: now.getHours() >= 12 ? 'PM' : 'AM',
    }));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    const [y, m, d] = settingsForm.electionEndDate.split('-');
    let hour = parseInt(settingsForm.electionEndTime.split(':')[0]);
    if (settingsForm.electionEndAmPm === 'PM' && hour !== 12) hour += 12;
    if (settingsForm.electionEndAmPm === 'AM' && hour === 12) hour = 0;
    const end = new Date(y, m - 1, d, hour, parseInt(settingsForm.electionEndTime.split(':')[1] || 0));
    saveToServer({ ...data, settings: { ...data.settings, electionTitle: settingsForm.electionTitle, electionEndTime: end.toISOString(), isElectionActive: settingsForm.isElectionActive } });
    alert('Pengaturan disimpan');
  };

  // Login form
  if (!loggedIn) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <form onSubmit={(e) => { e.preventDefault(); if (username === 'admin' && password === 'admin123') setLoggedIn(true); else alert('Salah'); }}
          className="bg-gray-800 p-6 sm:p-8 rounded-2xl w-full max-w-sm border border-emerald-700/30">
          <h2 className="text-white text-xl sm:text-2xl font-bold mb-6 text-center">🔐 Login Admin</h2>
          <input className="w-full mb-4 px-4 py-3 bg-gray-700 text-white rounded-xl" placeholder="admin" value={username} onChange={e => setUsername(e.target.value)} />
          <input type="password" className="w-full mb-6 px-4 py-3 bg-gray-700 text-white rounded-xl" placeholder="admin123" value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit" className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold">Masuk</button>
        </form>
      </div>
    );
  }

  if (!data) return <div className="text-white text-center pt-20">Memuat...</div>;

  return (
    <div className="pb-12 px-2 sm:px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">⚙️ Panel Admin</h1>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { resetForm(); setShowAddForm(true); }} className="bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold">+ Tambah</button>
            <button onClick={() => exportToExcel(data)} className="bg-green-600 text-white px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold">📥 Excel</button>
            <button onClick={() => setShowQR(true)} className="bg-blue-600 text-white px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold">📱 QR</button>
            <button onClick={() => setLoggedIn(false)} className="bg-red-500 text-white px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold">Logout</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-gray-800/80 rounded-xl p-1.5">
          <button onClick={() => setActiveTab('candidates')} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${activeTab === 'candidates' ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}>👥 Kandidat</button>
          <button onClick={() => setActiveTab('settings')} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${activeTab === 'settings' ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}>⚙️ Pengaturan</button>
        </div>

        {/* Tab Kandidat */}
        {activeTab === 'candidates' && (
          <>
            {showAddForm && (
              <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 mb-6 border border-emerald-700/30">
                <h3 className="text-lg font-bold text-white mb-4">{editingId ? 'Edit' : 'Tambah'} Kandidat</h3>
                <form onSubmit={editingId ? handleUpdate : handleAdd} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input className="w-full px-4 py-2.5 bg-gray-700 text-white rounded-xl" placeholder="Nama" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} required />
                    <input type="number" className="w-full px-4 py-2.5 bg-gray-700 text-white rounded-xl" placeholder="No Urut" value={formData.nomorUrut} onChange={e => setFormData(p => ({ ...p, nomorUrut: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-gray-300 text-sm block mb-2">Foto</label>
                    <div className="flex gap-2 mb-2">
                      <button type="button" onClick={() => setPhotoSource('url')} className={`px-3 py-1.5 rounded-lg text-xs ${photoSource === 'url' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300'}`}>🔗 URL</button>
                      <button type="button" onClick={() => setPhotoSource('upload')} className={`px-3 py-1.5 rounded-lg text-xs ${photoSource === 'upload' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300'}`}>📁 Upload</button>
                    </div>
                    {photoSource === 'url' && <input className="w-full px-4 py-2.5 bg-gray-700 text-white rounded-xl" placeholder="URL foto" value={formData.photo} onChange={e => { setFormData(p => ({ ...p, photo: e.target.value })); setImagePreview(e.target.value); }} />}
                    {photoSource === 'upload' && (
                      <div>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-gray-700 text-white rounded-xl border border-dashed border-gray-500">📁 Pilih File</button>
                        {formData.photo && <span className="text-emerald-400 text-sm ml-2">✅</span>}
                      </div>
                    )}
                    {(imagePreview || formData.photo) && <img src={imagePreview || formData.photo} className="w-20 h-20 rounded-full object-cover mt-2 border-2 border-emerald-500/30" />}
                  </div>
                  <textarea className="w-full px-4 py-2.5 bg-gray-700 text-white rounded-xl" rows={2} placeholder="Visi" value={formData.visi} onChange={e => setFormData(p => ({ ...p, visi: e.target.value }))} required />
                  <textarea className="w-full px-4 py-2.5 bg-gray-700 text-white rounded-xl" rows={3} placeholder="Misi" value={formData.misi} onChange={e => setFormData(p => ({ ...p, misi: e.target.value }))} required />
                  <div className="flex gap-3">
                    <button type="submit" className="bg-emerald-500 text-white px-6 py-2.5 rounded-xl">{editingId ? 'Simpan' : 'Tambah'}</button>
                    <button type="button" onClick={resetForm} className="bg-gray-600 text-white px-6 py-2.5 rounded-xl">Batal</button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 border border-emerald-700/30">
              <h2 className="text-lg font-bold text-white mb-4">👥 Daftar Kandidat</h2>
              {data.candidates.map(c => (
                <div key={c.id} className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-gray-700/50 p-3 rounded-xl mb-2">
                  <span className="text-xl font-bold text-emerald-400">#{c.nomorUrut}</span>
                  <img src={c.photo} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1 min-w-[150px]">
                    <p className="font-semibold text-white text-sm">{c.name}</p>
                    <p className="text-gray-400 text-xs line-clamp-1">{c.visi}</p>
                  </div>
                  <span className="text-emerald-400 font-bold text-sm">{c.voteCount || 0} suara</span>
                  <div className="flex gap-2 ml-auto">
                    <button onClick={() => { setEditingId(c.id); setFormData({ name: c.name, photo: c.photo, visi: c.visi, misi: c.misi, nomorUrut: c.nomorUrut.toString() }); setImagePreview(c.photo); setShowAddForm(true); }} className="text-blue-400 text-sm">✏️</button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-400 text-sm">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Tab Pengaturan */}
        {activeTab === 'settings' && (
          <div className="bg-gray-800 rounded-2xl p-4 sm:p-6 border border-emerald-700/30">
            <h2 className="text-lg font-bold text-white mb-4">⚙️ Pengaturan Pemilihan</h2>
            <div className="bg-gray-700/50 rounded-xl p-4 mb-6">
              <p className="text-gray-300">Status: <span className={data.settings.isElectionActive ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{data.settings.isElectionActive ? '🟢 Aktif' : '🔴 Tidak Aktif'}</span></p>
              <p className="text-gray-300 mt-1">Berakhir: {new Date(data.settings.electionEndTime).toLocaleString('id-ID')}</p>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <button onClick={handleStart} className="bg-green-600 text-white px-4 py-2 rounded-xl font-semibold text-sm">▶️ Mulai</button>
              <button onClick={handlePause} className="bg-yellow-600 text-white px-4 py-2 rounded-xl font-semibold text-sm">⏸️ Jeda</button>
              <button onClick={handleStop} className="bg-red-600 text-white px-4 py-2 rounded-xl font-semibold text-sm">⏹️ Stop</button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm">Judul Pemilihan</label>
                <input className="w-full mt-1 px-4 py-2.5 bg-gray-700 text-white rounded-xl" value={settingsForm.electionTitle} onChange={e => setSettingsForm(p => ({ ...p, electionTitle: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 text-sm">Tanggal Berakhir</label>
                  <input type="date" className="w-full mt-1 px-4 py-2.5 bg-gray-700 text-white rounded-xl" value={settingsForm.electionEndDate} onChange={e => setSettingsForm(p => ({ ...p, electionEndDate: e.target.value }))} />
                </div>
                <div>
                  <label className="text-gray-300 text-sm">Jam</label>
                  <div className="flex gap-2 mt-1">
                    <input type="text" className="w-20 px-2 py-2.5 bg-gray-700 text-white rounded-xl text-center" value={settingsForm.electionEndTime} onChange={e => setSettingsForm(p => ({ ...p, electionEndTime: e.target.value }))} />
                    <select className="bg-gray-700 text-white rounded-xl px-2" value={settingsForm.electionEndAmPm} onChange={e => setSettingsForm(p => ({ ...p, electionEndAmPm: e.target.value }))}>
                      <option>AM</option>
                      <option>PM</option>
                    </select>
                  </div>
                </div>
              </div>
              <button type="submit" className="bg-emerald-500 text-white px-6 py-2.5 rounded-xl">💾 Simpan</button>
            </form>
          </div>
        )}
      </div>

      {/* Modal QR */}
      {showQR && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowQR(false)}>
          <div className="bg-gray-800 rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center border border-emerald-700/30 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">✕</button>
            <h3 className="text-xl font-bold text-white mb-4">📱 Scan QR</h3>
            <div className="bg-white p-4 rounded-2xl inline-block">
              <QRCode value={`${window.location.origin}/scan`} size={200} bgColor="#ffffff" fgColor="#064e3b" level="H" />
            </div>
            <p className="text-gray-500 text-xs mt-4">{window.location.origin}/scan</p>
            <button onClick={() => setShowQR(false)} className="mt-4 bg-emerald-500 text-white px-6 py-2 rounded-xl">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}