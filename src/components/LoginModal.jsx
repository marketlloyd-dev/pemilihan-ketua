import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function LoginModal() {
  const {
    showLoginModal, setShowLoginModal, loginMode, setLoginMode,
    registerVoter, loginVoter, loginAdmin, login
  } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    uniqueId: '',
    password: '',
    adminUsername: '',
    adminPassword: '',
  });
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  if (!showLoginModal) return null;

  const handleClose = () => {
    setShowLoginModal(false);
    setError('');
    setFormData({ name: '', uniqueId: '', password: '', adminUsername: '', adminPassword: '' });
    setIsRegistering(false);
  };

  const handleVoterSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.uniqueId || !formData.password) {
      setError('Mohon lengkapi semua field.');
      return;
    }

    if (isRegistering) {
      if (!formData.name) {
        setError('Mohon isi nama lengkap.');
        return;
      }
      const result = registerVoter(formData.name, formData.uniqueId, formData.password);
      if (result.success) {
        login({ id: result.voter.id, name: result.voter.name, role: 'voter', hasVoted: false });
        handleClose();
      } else {
        setError(result.message);
      }
    } else {
      const result = loginVoter(formData.uniqueId, formData.password);
      if (result.success) {
        login({ id: result.voter.id, name: result.voter.name, role: 'voter', hasVoted: result.voter.hasVoted });
        handleClose();
      } else {
        setError(result.message);
      }
    }
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.adminUsername || !formData.adminPassword) {
      setError('Mohon lengkapi username dan password admin.');
      return;
    }

    const result = loginAdmin(formData.adminUsername, formData.adminPassword);
    if (result.success) {
      login({ id: 'admin', name: 'Administrator', role: 'admin', hasVoted: false });
      handleClose();
    } else {
      setError(result.message);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose}></div>

      {/* Modal */}
      <div className="relative bg-dark-800 rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 animate-bounce-in overflow-hidden border border-emerald-700/30">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600"></div>
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-dark-700 hover:bg-dark-600 text-gray-300 transition-all"
        >
          ✕
        </button>

        <div className="flex gap-1 bg-dark-700 rounded-full p-1 mb-6 mt-2">
          <button
            onClick={() => { setLoginMode('voter'); setError(''); }}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              loginMode === 'voter' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            🗳️ Pemilih
          </button>
          <button
            onClick={() => { setLoginMode('admin'); setError(''); }}
            className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              loginMode === 'admin' ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            ⚙️ Admin
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-xl text-sm mb-4 animate-shake">
            ⚠️ {error}
          </div>
        )}

        {loginMode === 'voter' && (
          <form onSubmit={handleVoterSubmit} className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-white">
                {isRegistering ? '📝 Daftar Pemilih' : '🔐 Login Pemilih'}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {isRegistering ? 'Buat akun untuk memberikan suara' : 'Masuk untuk memberikan suara'}
              </p>
            </div>

            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => updateField('name', e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="w-full px-4 py-3 bg-dark-700 border border-emerald-600/30 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-400 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">NIM / ID Unik</label>
              <input
                type="text"
                value={formData.uniqueId}
                onChange={e => updateField('uniqueId', e.target.value)}
                placeholder="Masukkan NIM atau ID"
                className="w-full px-4 py-3 bg-dark-700 border border-emerald-600/30 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={e => updateField('password', e.target.value)}
                placeholder="Masukkan password"
                className="w-full px-4 py-3 bg-dark-700 border border-emerald-600/30 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-400 transition-all"
              />
            </div>

            <button
              type="submit"
              className="btn-ripple w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
            >
              {isRegistering ? '📝 Daftar & Login' : '🔐 Masuk'}
            </button>

            <p className="text-center text-sm text-gray-400">
              {isRegistering ? 'Sudah punya akun? ' : 'Belum punya akun? '}
              <button
                type="button"
                onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                className="text-emerald-400 font-semibold hover:underline"
              >
                {isRegistering ? 'Login di sini' : 'Daftar di sini'}
              </button>
            </p>
          </form>
        )}

        {loginMode === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-white">⚙️ Login Admin</h3>
              <p className="text-sm text-gray-400 mt-1">Masuk ke panel administrasi</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
              <input
                type="text"
                value={formData.adminUsername}
                onChange={e => updateField('adminUsername', e.target.value)}
                placeholder="Username admin"
                className="w-full px-4 py-3 bg-dark-700 border border-emerald-600/30 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={formData.adminPassword}
                onChange={e => updateField('adminPassword', e.target.value)}
                placeholder="Password admin"
                className="w-full px-4 py-3 bg-dark-700 border border-emerald-600/30 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-400 transition-all"
              />
            </div>

            <button
              type="submit"
              className="btn-ripple w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300"
            >
              ⚙️ Masuk Admin
            </button>

            <p className="text-xs text-gray-500 text-center">
              Default: admin / admin123
            </p>
          </form>
        )}
      </div>
    </div>
  );
}