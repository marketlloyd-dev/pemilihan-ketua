import { kv } from '@vercel/kv';

// Kunci untuk menyimpan state aplikasi
const STATE_KEY = 'app_state';

// State default
const defaultState = {
  candidates: [],
  settings: {
    electionTitle: 'Pemilihan Ketua Umum 2025',
    isElectionActive: true,
    electionEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  votes: [], // { candidateId, ip, timestamp }
  nextCandidateId: 1,
};

export default async function handler(req, res) {
  // Baca state
  if (req.method === 'GET') {
    try {
      const state = await kv.get(STATE_KEY);
      if (!state) {
        await kv.set(STATE_KEY, JSON.stringify(defaultState));
        return res.status(200).json(defaultState);
      }
      return res.status(200).json(typeof state === 'string' ? JSON.parse(state) : state);
    } catch (error) {
      return res.status(500).json({ error: 'Gagal membaca data' });
    }
  }

  // Simpan state (hanya dari admin)
  if (req.method === 'POST') {
    // Otorisasi sederhana: cek header token (admin)
    const authToken = req.headers['x-admin-token'];
    if (authToken !== 'admin123') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const newState = req.body;
      await kv.set(STATE_KEY, JSON.stringify(newState));
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Gagal menyimpan data' });
    }
  }

  // Voting (POST /api/data?action=vote)
  if (req.method === 'POST' && req.query.action === 'vote') {
    try {
      const state = await kv.get(STATE_KEY);
      if (!state) {
        return res.status(400).json({ error: 'Belum ada data' });
      }
      const parsed = typeof state === 'string' ? JSON.parse(state) : state;

      // Cek apakah pemilihan aktif
      if (!parsed.settings.isElectionActive || new Date(parsed.settings.electionEndTime) < new Date()) {
        return res.status(400).json({ error: 'Pemilihan sudah ditutup' });
      }

      // Ambil IP dari header
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

      // Cek IP sudah pernah vote?
      const alreadyVoted = parsed.votes.some(v => v.ip === ip);
      if (alreadyVoted) {
        return res.status(400).json({ error: 'IP ini sudah memberikan suara' });
      }

      const { candidateId } = req.body;
      if (!candidateId) {
        return res.status(400).json({ error: 'ID kandidat diperlukan' });
      }

      // Tambahkan suara
      parsed.candidates = parsed.candidates.map(c =>
        c.id === candidateId ? { ...c, voteCount: (c.voteCount || 0) + 1 } : c
      );
      parsed.votes.push({ candidateId, ip, timestamp: new Date().toISOString() });

      await kv.set(STATE_KEY, JSON.stringify(parsed));
      return res.status(200).json({ success: true, message: 'Suara berhasil!' });
    } catch (error) {
      return res.status(500).json({ error: 'Gagal memproses suara' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}