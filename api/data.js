// In-memory database (akan reset setelah fungsi cold start)
let db = {
  candidates: [
    {
      id: 1,
      name: 'Andi Pratama',
      photo: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Andi&backgroundColor=b6e3f4',
      visi: 'Mewujudkan organisasi yang transparan, inovatif, dan berdaya saing tinggi.',
      misi: '1. Meningkatkan kualitas program kerja.\n2. Membangun komunikasi dua arah.\n3. Mengembangkan potensi anggota.\n4. Menjalin kerjasama strategis.',
      voteCount: 0,
      nomorUrut: 1
    }
  ],
  settings: {
    electionTitle: 'Pemilihan Ketua Umum 2025',
    isElectionActive: true,
    electionEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  votes: [],
  nextCandidateId: 2
};

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ----- GET: Ambil data -----
  if (req.method === 'GET') {
    return res.status(200).json(db);
  }

  // ----- POST: Simpan data (admin) -----
  if (req.method === 'POST' && !req.query.action) {
    const token = req.headers['x-admin-token'];
    if (token !== 'admin123') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const newData = req.body;
    if (!newData || !newData.candidates) {
      return res.status(400).json({ error: 'Data tidak valid' });
    }
    db = newData;
    return res.status(200).json({ success: true });
  }

  // ----- POST /api/data?action=vote -----
  if (req.method === 'POST' && req.query.action === 'vote') {
    const isActive = db.settings.isElectionActive && new Date(db.settings.electionEndTime) > new Date();
    if (!isActive) {
      return res.status(400).json({ error: 'Pemilihan sudah ditutup' });
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    const alreadyVoted = db.votes.some(v => v.ip === ip);
    if (alreadyVoted) {
      return res.status(400).json({ error: 'IP ini sudah memberikan suara' });
    }

    const { candidateId } = req.body;
    if (!candidateId) {
      return res.status(400).json({ error: 'ID kandidat diperlukan' });
    }

    const candidateIndex = db.candidates.findIndex(c => c.id === candidateId);
    if (candidateIndex === -1) {
      return res.status(400).json({ error: 'Kandidat tidak ditemukan' });
    }

    db.candidates[candidateIndex].voteCount = (db.candidates[candidateIndex].voteCount || 0) + 1;
    db.votes.push({ candidateId, ip, timestamp: new Date().toISOString() });

    return res.status(200).json({ success: true, message: 'Suara berhasil!' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}