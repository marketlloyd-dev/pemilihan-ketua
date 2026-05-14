import { useState, useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [data, setData] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    photo: '',   // akan diisi URL atau base64
    visi: '',
    misi: '',
    nomorUrut: '',
  });
  const [showQR, setShowQR] = useState(false);
  const [photoSource, setPhotoSource] = useState('url'); // 'url' atau 'upload'
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchData = () => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData)
      .catch(() => console.log('Gagal fetch'));
  };

  useEffect(() => {
    if (loggedIn) fetchData();
  }, [loggedIn]);

  const saveToServer = (newData) => {
    fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': 'admin123',
      },
      body: JSON.stringify(newData),
    }).then(fetchData);
  };

  // Handler upload file -> base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result; // data:image/png;base64,...
      setFormData(prev => ({ ...prev, photo: base64 }));
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  // Reset form
  const resetForm = () => {
    setFormData({ name: '', photo: '', visi: '', misi: '', nomorUrut: '' });
    setImagePreview(null);
    setPhotoSource('url');
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.visi || !formData.misi) {
      alert('Nama, Visi, dan Misi wajib diisi');
      return;
    }

    const newCandidate = {
      id: data.nextCandidateId,
      name: formData.name,
      photo: formData.photo || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(formData.name)}&backgroundColor=b6e3f4`,
      visi: formData.visi,
      misi: formData.misi,
      nomorUrut: parseInt(formData.nomorUrut) || data.candidates.length + 1,
      voteCount: 0,
    };

    const newData = {
      ...data,
      candidates: [...data.candidates, newCandidate],
      nextCandidateId: data.nextCandidateId + 1,
    };
    saveToServer(newData);
    resetForm();
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
    setImagePreview(candidate.photo);
    setPhotoSource('url'); // asumsikan dari URL saat edit, bisa disesuaikan
    setShowAddForm(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    const newData = {
      ...data,
      candidates: data.candidates.map(c =>
        c.id === editingId
          ? {
              ...c,
              name: formData.name,
              photo: formData.photo || c.photo,
              visi: formData.visi,
              misi: formData.misi,
              nomorUrut: parseInt(formData.nomorUrut) || c.nomorUrut,
            }
          : c
      ),
    };
    saveToServer(newData);
    resetForm();
  };

  const handleDelete = (id) => {
    if (!confirm('Hapus kandidat ini?')) return;
    const newData = {
      ...data,
      candidates: data.candidates.filter(c => c.id !== id),
    };
    saveToServer(newData);
  };

  // Jika belum login, tampilkan form login
  if (!loggedIn) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (username === 'admin' && password === 'admin123') setLoggedIn(true);
            else alert('Username atau password salah');
          }}
          className="bg-gray-800 p-8 rounded-2xl max-w-sm w-full border border-emerald-700/30"
        >
          <h2 className="text-white text-2xl font-bold mb-6 text-center">🔐 Login Admin</h2>
          <input
            className="w-full mb-4 px-4 py-3 bg-gray-700 text-white rounded-xl"
            placeholder="admin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            className="w-full mb-6 px-4 py-3 bg-gray-700 text-white rounded-xl"
            placeholder="admin123"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold">
            Masuk
          </button>
        </form>
      </div>
    );
  }

  if (!data) return <div className="text-white text-center pt-20">Memuat data...</div>;

  return (
    <div className="pb-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">⚙️ Panel Admin</h1>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowAddForm(true);
                resetForm();
              }}
              className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold"
            >
              + Tambah Kandidat
            </button>
            <button
              onClick={() => setShowQR(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold"
            >
              📱 QR Code
            </button>
            <button
              onClick={() => setLoggedIn(false)}
              className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-semibold"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Form Tambah / Edit Kandidat */}
        {showAddForm && (
          <div className="bg-gray-800 rounded-2xl p-6 mb-6 border border-emerald-700/30">
            <h3 className="text-white text-xl font-bold mb-4">
              {editingId ? '✏️ Edit Kandidat' : '➕ Tambah Kandidat'}
            </h3>
            <form onSubmit={editingId ? handleUpdate : handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 text-sm block mb-1">Nama Kandidat *</label>
                  <input
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-xl"
                    placeholder="Nama lengkap"
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm block mb-1">Nomor Urut</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-xl"
                    placeholder="1"
                    value={formData.nomorUrut}
                    onChange={(e) => setFormData(p => ({ ...p, nomorUrut: e.target.value }))}
                  />
                </div>
              </div>

              {/* ====== BAGIAN FOTO DIPERBAIKI ====== */}
              <div>
                <label className="text-gray-300 text-sm block mb-2">Foto Kandidat</label>

                {/* Pilihan sumber foto */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setPhotoSource('url')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      photoSource === 'url' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    🔗 URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoSource('upload')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      photoSource === 'upload' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    📁 Upload
                  </button>
                </div>

                {/* Input URL */}
                {photoSource === 'url' && (
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-xl"
                    placeholder="https://example.com/foto.jpg"
                    value={formData.photo}
                    onChange={(e) => {
                      setFormData(p => ({ ...p, photo: e.target.value }));
                      setImagePreview(e.target.value);
                    }}
                  />
                )}

                {/* Input Upload */}
                {photoSource === 'upload' && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-gray-700 text-white rounded-xl border border-dashed border-gray-500 hover:border-emerald-400 transition"
                    >
                      📁 Pilih File Gambar
                    </button>
                    {formData.photo && photoSource === 'upload' && (
                      <span className="text-emerald-400 text-sm ml-3">✅ Gambar dipilih</span>
                    )}
                  </div>
                )}

                {/* Preview Foto */}
                {(imagePreview || formData.photo) && (
                  <div className="mt-3">
                    <img
                      src={imagePreview || formData.photo}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-emerald-500/30"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>
              {/* ====== AKHIR BAGIAN FOTO ====== */}

              <div>
                <label className="text-gray-300 text-sm block mb-1">Visi *</label>
                <textarea
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-xl"
                  rows="2"
                  placeholder="Visi kandidat"
                  value={formData.visi}
                  onChange={(e) => setFormData(p => ({ ...p, visi: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-gray-300 text-sm block mb-1">Misi *</label>
                <textarea
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-xl"
                  rows="3"
                  placeholder="Misi kandidat (pisahkan dengan baris baru)"
                  value={formData.misi}
                  onChange={(e) => setFormData(p => ({ ...p, misi: e.target.value }))}
                  required
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-semibold">
                  {editingId ? '💾 Simpan Perubahan' : '➕ Tambahkan'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-600 text-white px-6 py-2 rounded-xl font-semibold"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Daftar Kandidat */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-emerald-700/30">
          <h2 className="text-xl font-bold text-white mb-4">
            👥 Daftar Kandidat ({data.candidates.length})
          </h2>
          {data.candidates.map(c => (
            <div
              key={c.id}
              className="flex items-center gap-4 bg-gray-700/50 p-3 rounded-xl mb-2"
            >
              <span className="text-2xl font-bold text-emerald-400">#{c.nomorUrut}</span>
              <img
                src={c.photo}
                alt={c.name}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => { e.target.src = 'https://api.dicebear.com/9.x/avataaars/svg?seed=default'; }}
              />
              <div className="flex-1">
                <p className="font-bold text-white">{c.name}</p>
                <p className="text-gray-400 text-sm line-clamp-1">{c.visi}</p>
              </div>
              <p className="text-emerald-400 font-bold">{c.voteCount || 0} suara</p>
              <button onClick={() => handleEdit(c)} className="text-blue-400 hover:underline text-sm">✏️</button>
              <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:underline text-sm">🗑️</button>
            </div>
          ))}
          {data.candidates.length === 0 && (
            <p className="text-gray-500 text-center py-4">Belum ada kandidat</p>
          )}
        </div>
      </div>

      {/* Modal QR Code */}
      {showQR && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowQR(false)}
        >
          <div
            className="bg-gray-800 rounded-2xl p-8 max-w-sm w-full text-center border border-emerald-700/30 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-white mb-4">📱 Scan QR Code</h3>
            <p className="text-gray-400 text-sm mb-6">Pindai untuk langsung memilih kandidat</p>
            <div className="bg-white p-4 rounded-2xl inline-block">
              <QRCode
                value={`${window.location.origin}/scan`}
                size={200}
                bgColor="#ffffff"
                fgColor="#064e3b"
                level="H"
              />
            </div>
            <p className="text-gray-500 text-xs mt-4">{window.location.origin}/scan</p>
            <button
              onClick={() => setShowQR(false)}
              className="mt-4 bg-emerald-500 text-white px-6 py-2 rounded-xl font-semibold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}