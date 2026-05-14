import { put, get, list, del } from '@vercel/blob';

const BLOB_PATH = 'data/database.json';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = req.headers['x-admin-token'];

  // ----- POST /api/data (admin) -----
  if (req.method === 'POST' && !req.query.action) {
    if (token !== 'admin123') return res.status(401).json({ error: 'Unauthorized' });
    try {
      const content = JSON.stringify(req.body);
      await put(BLOB_PATH, content, {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false, // timpa file yang sama
      });
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Gagal menyimpan' });
    }
  }

  // ----- POST /api/data?action=vote (voting) -----
  if (req.method === 'POST' && req.query.action === 'vote') {
    try {
      const currentBlob = await get(BLOB_PATH);
      let db = { candidates: [], settings: {}, votes: [] };

      if (currentBlob) {
        const res = await fetch(currentBlob.url);
        const text = await res.text();
        if (text.trim()) db = JSON.parse(text);
      }

      if (!db.settings.isElectionActive || new Date(db.settings.electionEndTime) < new Date()) {
        return res.status(400).json({ error: 'Pemilihan sudah ditutup' });
      }

      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      if (db.votes.some(v => v.ip === ip)) {
        return res.status(400).json({ error: 'IP sudah memberikan suara' });
      }

      const { candidateId } = req.body;
      const idx = db.candidates.findIndex(c => c.id === candidateId);
      if (idx === -1) return res.status(400).json({ error: 'Kandidat tidak ditemukan' });

      db.candidates[idx].voteCount = (db.candidates[idx].voteCount || 0) + 1;
      db.votes.push({ candidateId, ip, timestamp: new Date().toISOString() });

      const content = JSON.stringify(db);
      await put(BLOB_PATH, content, {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
      });

      return res.status(200).json({ success: true, message: 'Suara berhasil' });
    } catch (error) {
      return res.status(500).json({ error: 'Gagal vote' });
    }
  }

  // ----- GET /api/data -----
  if (req.method === 'GET') {
    try {
      const blob = await get(BLOB_PATH);
      if (!blob) {
        // Kembalikan data default jika belum ada
        return res.status(200).json({
          candidates: [],
          settings: {
            electionTitle: 'Pemilihan Ketua Umum 2025',
            isElectionActive: true,
            electionEndTime: new Date(Date.now() + 7*24*60*60*1000).toISOString()
          },
          votes: [],
          nextCandidateId: 1
        });
      }
      const resp = await fetch(blob.url);
      const text = await resp.text();
      return res.status(200).json(text.trim() ? JSON.parse(text) : {});
    } catch (error) {
      return res.status(500).json({ error: 'Gagal membaca data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}