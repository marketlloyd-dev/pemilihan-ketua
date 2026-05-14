// api/data.js
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

function json(res, statusCode, data) {
  res.status(statusCode).json(data);
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET
  if (req.method === 'GET') {
    return json(res, 200, db);
  }

  // POST (simpan state, admin)
  if (req.method === 'POST' && !req.query.action) {
    const token = req.headers['x-admin-token'];
    if (token !== 'admin123') return json(res, 401, { error: 'Unauthorized' });
    if (!req.body || !req.body.candidates) return json(res, 400, { error: 'Invalid' });
    db = req.body;
    return json(res, 200, { success: true });
  }

  // POST /api/data?action=vote
  if (req.method === 'POST' && req.query.action === 'vote') {
    const now = new Date();
    const endTime = new Date(db.settings.electionEndTime);
    const isActive = db.settings.isElectionActive && now < endTime;

    // 1. Cek apakah pemilihan aktif
    if (!isActive) {
      // Jika pemilihan tidak aktif, hapus cookie voted_token agar tidak memblokir
      res.setHeader(
        'Set-Cookie',
        'voted_token=; Path=/; Max-Age=0; SameSite=Lax; Secure; HttpOnly'
      );
      return json(res, 400, { error: 'Pemilihan sudah ditutup' });
    }

    // 2. Baca cookie voted_token dari header
    const cookieHeader = req.headers.cookie || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => c.split('='))
    );

    // 3. Jika cookie voted_token sudah ada, tolak
    if (cookies.voted_token) {
      return json(res, 400, { error: 'Anda sudah memberikan suara (terdeteksi dari cookie)' });
    }

    const { candidateId } = req.body || {};
    if (!candidateId) return json(res, 400, { error: 'ID kandidat diperlukan' });

    const idx = db.candidates.findIndex(c => c.id === candidateId);
    if (idx === -1) return json(res, 400, { error: 'Kandidat tidak ditemukan' });

    // 4. Catat suara
    db.candidates[idx].voteCount = (db.candidates[idx].voteCount || 0) + 1;
    db.votes.push({
      candidateId,
      timestamp: now.toISOString()
    });

    // 5. Set cookie tahan 1 tahun (hanya berlaku selama pemilihan masih berjalan)
    res.setHeader(
      'Set-Cookie',
      'voted_token=1; Path=/; Max-Age=31536000; SameSite=Lax; Secure; HttpOnly'
    );

    return json(res, 200, { success: true, message: 'Suara berhasil!' });
  }

  return json(res, 405, { error: 'Method not allowed' });
}