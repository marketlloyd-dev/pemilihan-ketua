// api/data.js
// In‑memory database – data akan bertahan selama fungsi serverless tetap hangat.
// Untuk produksi serius, ganti dengan database permanen (KV, PostgreSQL, dll).

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

// Helper sederhana untuk mengirim respons JSON
function json(res, statusCode, data) {
  res.status(statusCode).json(data);
}

export default async function handler(req, res) {
  // ---------- CORS ----------
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ---------- GET /api/data ----------
  if (req.method === 'GET') {
    return json(res, 200, db);
  }

  // ---------- POST /api/data (simpan seluruh state, hanya admin) ----------
  if (req.method === 'POST' && !req.query.action) {
    const token = req.headers['x-admin-token'];
    if (token !== 'admin123') {
      return json(res, 401, { error: 'Unauthorized' });
    }

    if (!req.body || !req.body.candidates) {
      return json(res, 400, { error: 'Data tidak valid' });
    }

    db = req.body;
    return json(res, 200, { success: true });
  }

  // ---------- POST /api/data?action=vote ----------
  if (req.method === 'POST' && req.query.action === 'vote') {
    // 1. Cek apakah pemilihan aktif dan belum berakhir
    const now = new Date();
    const endTime = new Date(db.settings.electionEndTime);
    const isActive = db.settings.isElectionActive && now < endTime;
    if (!isActive) {
      return json(res, 400, { error: 'Pemilihan sudah ditutup' });
    }

    // 2. Dapatkan IP
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    // 3. Ambil token dari body (dikirim oleh frontend)
    const { candidateId, token } = req.body || {};

    // 4. Rate limiting – maks 3 percobaan per 10 detik dari IP yang sama
    const tenSecondsAgo = now.getTime() - 10_000;
    const recentAttempts = db.votes.filter(
      v => v.ip === ip && new Date(v.timestamp).getTime() > tenSecondsAgo
    );
    if (recentAttempts.length >= 3) {
      return json(res, 429, { error: 'Terlalu banyak percobaan. Silakan coba lagi nanti.' });
    }

    // 5. Cek apakah IP sudah pernah vote
    const ipAlreadyVoted = db.votes.some(v => v.ip === ip);
    if (ipAlreadyVoted) {
      return json(res, 400, { error: 'IP ini sudah memberikan suara' });
    }

    // 6. Cek apakah token (perangkat) sudah pernah digunakan
    if (token) {
      const tokenAlreadyVoted = db.votes.some(v => v.token === token);
      if (tokenAlreadyVoted) {
        return json(res, 400, { error: 'Perangkat ini sudah memberikan suara' });
      }
    }

    // 7. Validasi candidateId
    if (!candidateId) {
      return json(res, 400, { error: 'ID kandidat diperlukan' });
    }

    const candidateIndex = db.candidates.findIndex(c => c.id === candidateId);
    if (candidateIndex === -1) {
      return json(res, 400, { error: 'Kandidat tidak ditemukan' });
    }

    // 8. Catat suara
    db.candidates[candidateIndex].voteCount = (db.candidates[candidateIndex].voteCount || 0) + 1;
    db.votes.push({
      candidateId,
      ip,
      token: token || null,
      timestamp: now.toISOString(),
    });

    // 9. Kirim cookie agar token bertahan di sisi klien
    res.setHeader(
      'Set-Cookie',
      `voted_token=${token || 'voted'}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`
    );

    return json(res, 200, { success: true, message: 'Suara berhasil!' });
  }

  // Method tidak diizinkan
  return json(res, 405, { error: 'Method not allowed' });
}