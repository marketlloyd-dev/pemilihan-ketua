import * as XLSX from 'xlsx';

/**
 * Export hasil pemilihan ke file Excel (.xlsx)
 * Format rapi dengan Ringkasan, Hasil Kandidat (progress bar visual), dan Detail Suara
 * @param {Object} data - Data dari API
 * @param {Array} data.candidates - Array kandidat
 * @param {Object} data.settings - Pengaturan pemilihan
 * @param {Array} data.votes - Data suara
 */
export function exportToExcel(data) {
  if (!data || !data.candidates) return;

  const { candidates, settings, votes } = data;
  const totalVotes = candidates.reduce((sum, c) => sum + (c.voteCount || 0), 0);
  const totalCandidates = candidates.length;

  // Urutkan berdasarkan suara terbanyak
  const sorted = [...candidates].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
  const maxVotes = Math.max(...candidates.map(c => c.voteCount || 0), 1);

  // ==================== SHEET 1: RINGKASAN ====================
  const summaryData = [
    ['📊 HASIL PEMILIHAN'],
    [''],
    ['Judul Pemilihan', settings?.electionTitle || '-'],
    ['Tanggal Export', new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'long' })],
    ['Status', settings?.isElectionActive ? '🟢 Sedang Berlangsung' : '🔴 Telah Ditutup'],
    ['Waktu Berakhir', new Date(settings?.electionEndTime).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'long' })],
    [''],
    ['📈 STATISTIK'],
    ['Total Kandidat', totalCandidates],
    ['Total Suara Masuk', totalVotes],
    ['Total Pemilih Terdaftar', votes?.length || 0],
    ['Partisipasi', votes?.length > 0 ? `${((totalVotes / votes.length) * 100).toFixed(1)}%` : '0%'],
    [''],
    ['🏆 PERINGKAT KANDIDAT'],
    ['Peringkat', 'Nama Kandidat', 'Nomor Urut', 'Jumlah Suara', 'Persentase'],
  ];

  sorted.forEach((c, i) => {
    const percentage = totalVotes > 0 ? ((c.voteCount || 0) / totalVotes) * 100 : 0;
    summaryData.push([
      `#${i + 1}`,
      c.name,
      c.nomorUrut,
      c.voteCount || 0,
      `${percentage.toFixed(1)}%`,
    ]);
  });

  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);

  // Styling lebar kolom
  ws1['!cols'] = [
    { wch: 20 },
    { wch: 35 },
    { wch: 15 },
    { wch: 18 },
    { wch: 15 },
  ];

  // Merge cells untuk judul
  ws1['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // Judul
  ];

  // ==================== SHEET 2: HASIL KANDIDAT (DENGAN VISUAL) ====================
  const candidateData = [
    ['📋 DETAIL HASIL PER KANDIDAT'],
    [''],
    ['Peringkat', 'Nama Kandidat', 'No Urut', 'Visi', 'Misi', 'Suara', 'Persentase', 'Progress Bar'],
  ];

  sorted.forEach((c, i) => {
    const suara = c.voteCount || 0;
    const percentage = totalVotes > 0 ? Math.round((suara / totalVotes) * 100) : 0;

    // Buat progress bar visual menggunakan karakter █
    const barLength = 20;
    const filled = Math.round((suara / maxVotes) * barLength);
    const empty = barLength - filled;
    const progressBar = '█'.repeat(filled) + '░'.repeat(empty) + ` ${suara} suara`;

    candidateData.push([
      `#${i + 1}`,
      c.name,
      c.nomorUrut || '-',
      c.visi?.substring(0, 50) || '-',
      c.misi?.replace(/\n/g, ' | ').substring(0, 50) || '-',
      suara,
      `${percentage}%`,
      progressBar,
    ]);
  });

  const ws2 = XLSX.utils.aoa_to_sheet(candidateData);
  ws2['!cols'] = [
    { wch: 10 },
    { wch: 25 },
    { wch: 10 },
    { wch: 35 },
    { wch: 35 },
    { wch: 12 },
    { wch: 12 },
    { wch: 40 },
  ];

  // ==================== SHEET 3: DETAIL SUARA (AUDIT) ====================
  const voteData = [
    ['🕐 DETAIL SUARA MASUK'],
    [''],
    ['No', 'Kandidat ID', 'Waktu', 'Token/IP'],
  ];

  if (votes && votes.length > 0) {
    votes.forEach((v, i) => {
      const candidate = candidates.find(c => c.id === v.candidateId);
      voteData.push([
        i + 1,
        candidate ? `${candidate.name} (No. ${candidate.nomorUrut})` : `ID: ${v.candidateId}`,
        new Date(v.timestamp).toLocaleString('id-ID'),
        v.token ? '✅ Cookie' : v.ip || '-',
      ]);
    });
  } else {
    voteData.push(['-', 'Belum ada suara masuk', '-', '-']);
  }

  const ws3 = XLSX.utils.aoa_to_sheet(voteData);
  ws3['!cols'] = [
    { wch: 8 },
    { wch: 30 },
    { wch: 25 },
    { wch: 20 },
  ];

  // ==================== GABUNGKAN WORKBOOK ====================
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, '📊 Ringkasan');
  XLSX.utils.book_append_sheet(wb, ws2, '👥 Hasil Kandidat');
  XLSX.utils.book_append_sheet(wb, ws3, '🕐 Detail Suara');

  // ==================== DOWNLOAD ====================
  const fileName = `Hasil-Pemilihan-${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}