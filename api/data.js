import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const dbPath = path.join(process.cwd(), 'api', 'database.json');

  const readDB = async () => {
    try {
      const raw = await fs.readFile(dbPath, 'utf-8');
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const writeDB = async (data) => {
    try {
      await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
      return true;
    } catch {
      return false;
    }
  };

  // GET
  if (req.method === 'GET') {
    const db = await readDB();
    if (!db) return res.status(500).json({ error: 'Database tidak ditemukan' });
    return res.status(200).json(db);
  }

  // POST (simpan data)
  if (req.method === 'POST' && !req.query.action) {
    const token = req.headers['x-admin-token'];
    if (token !== 'admin123') return res.status(401).json({ error: 'Unauthorized' });
    const success = await writeDB(req.body);
    if (!success) return res.status(500).json({ error: 'Gagal menyimpan' });
    return res.status(200).json({ success: true });
  }

  // Vote
  if (req.method === 'POST' && req.query.action === 'vote') {
    const db = await readDB();
    if (!db) return res.status(500).json({ error: 'Database tidak tersedia' });
    
    if (!db.settings.isElectionActive || new Date(db.settings.electionEndTime) < new Date()) {
      return res.status(400).json({ error: 'Pemilihan sudah ditutup' });
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    if (db.votes.some(v => v.ip === ip)) {
      return res.status(400).json({ error: 'IP sudah memberikan suara' });
    }

    const { candidateId } = req.body;
    const candidate = db.candidates.find(c => c.id === candidateId);
    if (!candidate) return res.status(400).json({ error: 'Kandidat tidak ditemukan' });

    candidate.voteCount = (candidate.voteCount || 0) + 1;
    db.votes.push({ candidateId, ip, timestamp: new Date().toISOString() });

    const success = await writeDB(db);
    if (!success) return res.status(500).json({ error: 'Gagal menyimpan suara' });
    return res.status(200).json({ success: true, message: 'Suara berhasil!' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}