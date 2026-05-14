import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const defaultCandidates = [
  {
    id: 1, name: 'Andi Pratama',
    photo: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Andi&backgroundColor=b6e3f4',
    visi: 'Mewujudkan organisasi yang transparan, inovatif, dan berdaya saing tinggi.',
    misi: '1. Meningkatkan kualitas program kerja.\n2. Membangun komunikasi dua arah.\n3. Mengembangkan potensi anggota.\n4. Menjalin kerjasama strategis.',
    voteCount: 0, nomorUrut: 1
  },
  {
    id: 2, name: 'Siti Rahayu',
    photo: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Siti&backgroundColor=c0aede',
    visi: 'Menjadikan organisasi sebagai wadah pengembangan diri yang inklusif dan progresif.',
    misi: '1. Program mentoring berkelanjutan.\n2. Digitalisasi sistem organisasi.\n3. Kegiatan sosial kemasyarakatan.\n4. Peningkatan kesejahteraan anggota.',
    voteCount: 0, nomorUrut: 2
  },
  {
    id: 3, name: 'Budi Santoso',
    photo: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Budi&backgroundColor=d1d4f9',
    visi: 'Membangun organisasi yang solid, kreatif, dan responsif terhadap perubahan.',
    misi: '1. Reformasi struktur organisasi.\n2. Program inkubasi ide kreatif.\n3. Penguatan branding organisasi.\n4. Kolaborasi lintas komunitas.',
    voteCount: 0, nomorUrut: 3
  }
];

const getInitialData = () => {
  try {
    const saved = localStorage.getItem('evoting_data');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return {
    candidates: defaultCandidates,
    settings: {
      electionTitle: 'Pemilihan Ketua Umum 2025',
      isElectionActive: true,
      electionEndTime: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
    },
    nextCandidateId: 4,
  };
};

export function AppProvider({ children }) {
  const [data, setData] = useState(getInitialData);
  const [currentUser, setCurrentUser] = useState(null); // ✅ tidak pakai sessionStorage

  useEffect(() => {
    localStorage.setItem('evoting_data', JSON.stringify(data));
  }, [data]);

  // ✅ Fungsi login admin (simpan ke state)
  const loginAdmin = (username, password) => {
    if (username === 'admin' && password === 'admin123') {
      setCurrentUser({ id: 'admin', name: 'Administrator', role: 'admin' });
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  const addCandidate = (candidate) => {
    setData(prev => ({
      ...prev,
      candidates: [...prev.candidates, { ...candidate, id: prev.nextCandidateId, voteCount: 0 }],
      nextCandidateId: prev.nextCandidateId + 1
    }));
  };

  const updateCandidate = (id, updates) => {
    setData(prev => ({
      ...prev,
      candidates: prev.candidates.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  };

  const deleteCandidate = (id) => {
    setData(prev => ({
      ...prev,
      candidates: prev.candidates.filter(c => c.id !== id)
    }));
  };

  const updateSettings = (newSettings) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  };

  const value = {
    data,
    currentUser,
    loginAdmin,
    logout,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    updateSettings,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};