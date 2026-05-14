// api/data.js
let db = {
  candidates: [
    {
      id: 1,
      name: 'MOH. Hadissibyan',
      photo: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Andi&backgroundColor=b6e3f4',
      visi: 'Mewujudkan organisasi yang transparan, inovatif, dan berdaya saing tinggi.',
      misi: '1. Meningkatkan kualitas program kerja.\n2. Membangun komunikasi dua arah.\n3. Mengembangkan potensi anggota.\n4. Menjalin kerjasama strategis.',
      voteCount: 0,
      nomorUrut: 1
    }
  ],
  settings: {
    electionTitle: 'Pemilihan Ketua Komisariat 2026',
    isElectionActive: true,
    electionEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    electionId: 'default'
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

    const oldActive = db.settings.isElectionActive;
    db = req.body;

    // Jika pemilihan berubah dari tidak aktif menjadi aktif → reset electionId
    if (!oldActive && db.settings.isElectionActive) {
      db.settings.electionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    return json(res, 200, { success: true });
  }

  // POST /api/data?action=vote
  if (req.method === 'POST' && req.query.action === 'vote') {
    const now = new Date();
    const endTime = new Date(db.settings.electionEndTime);
    const isActive = db.settings.isElectionActive && now < endTime;

    if (!isActive) return json(res, 400, { error: 'Pemilihan sudah ditutup' });

    // Baca cookie
    const cookieHeader = req.headers.cookie || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => c.split('='))
    );

    // Cek cookie voted_token, bandingkan dengan electionId saat ini
    if (cookies.voted_token) {
      const [votedElectionId] = cookies.voted_token.split(':'); // format: electionId:1
      if (votedElectionId === db.settings.electionId) {
        return json(res, 400, { error: 'Anda sudah memberikan suara pada pemilihan ini' });
      }
      // Jika electionId berbeda (pemilihan sudah direset), abaikan cookie → boleh vote lagi
    }

    const { candidateId } = req.body || {};
    if (!candidateId) return json(res, 400, { error: 'ID kandidat diperlukan' });

    const idx = db.candidates.findIndex(c => c.id === candidateId);
    if (idx === -1) return json(res, 400, { error: 'Kandidat tidak ditemukan' });

    // Catat suara
    db.candidates[idx].voteCount = (db.candidates[idx].voteCount || 0) + 1;
    db.votes.push({
      candidateId,
      timestamp: now.toISOString()
    });

    // Set cookie: voted_token = electionId:1
    const cookieValue = `${db.settings.electionId}:1`;
    const remainingSeconds = Math.max(0, Math.floor((endTime - now) / 1000));
    res.setHeader(
      'Set-Cookie',
      `voted_token=${cookieValue}; Path=/; Max-Age=${remainingSeconds}; SameSite=Lax; Secure; HttpOnly`
    );

    return json(res, 200, { success: true, message: 'Suara berhasil!' });
  }

  return json(res, 405, { error: 'Method not allowed' });
}