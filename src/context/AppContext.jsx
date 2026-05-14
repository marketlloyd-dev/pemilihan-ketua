import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext();

const API_BASE = '/api/data';

export function AppProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch data awal
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(API_BASE);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Gagal fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Polling setiap 5 detik untuk real-time
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Simpan data (admin)
  const saveData = async (newData) => {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'admin123', // sederhana
        },
        body: JSON.stringify(newData),
      });
      if (res.ok) {
        setData(newData); // optimis update
      }
    } catch (err) {
      console.error('Gagal menyimpan:', err);
    }
  };

  // Login admin (hanya cek username/password statis)
  const loginAdmin = (username, password) => {
    if (username === 'admin' && password === 'admin123') {
      setCurrentUser({ role: 'admin' });
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  // CRUD kandidat dengan save ke server
  const addCandidate = (candidate) => {
    const newData = {
      ...data,
      candidates: [...data.candidates, { ...candidate, id: data.nextCandidateId, voteCount: 0 }],
      nextCandidateId: data.nextCandidateId + 1,
    };
    saveData(newData);
  };

  const updateCandidate = (id, updates) => {
    const newData = {
      ...data,
      candidates: data.candidates.map(c => c.id === id ? { ...c, ...updates } : c),
    };
    saveData(newData);
  };

  const deleteCandidate = (id) => {
    const newData = {
      ...data,
      candidates: data.candidates.filter(c => c.id !== id),
    };
    saveData(newData);
  };

  const updateSettings = (newSettings) => {
    const newData = {
      ...data,
      settings: { ...data.settings, ...newSettings },
    };
    saveData(newData);
  };

  // Voting (dari halaman scan)
  const castVote = async (candidateId) => {
    try {
      const res = await fetch(`${API_BASE}?action=vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId }),
      });
      const result = await res.json();
      if (res.ok) {
        // Refresh data
        await fetchData();
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.error || 'Gagal vote' };
      }
    } catch (err) {
      return { success: false, message: 'Koneksi gagal' };
    }
  };

  const value = {
    data,
    loading,
    currentUser,
    loginAdmin,
    logout,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    updateSettings,
    castVote,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};