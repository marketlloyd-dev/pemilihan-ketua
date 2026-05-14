import * as XLSX from 'xlsx';

/**
 * Export election results to Excel file
 * @param {Array} candidates - Array of candidate objects
 * @param {string} electionTitle - Title of the election
 * @param {number} totalVotes - Total votes cast
 * @param {number} totalVoters - Total registered voters
 */
export function exportToExcel(candidates, electionTitle, totalVotes, totalVoters) {
  // Prepare data for candidates sheet
  const candidateData = candidates
    .sort((a, b) => b.voteCount - a.voteCount)
    .map((c, index) => ({
      'Peringkat': index + 1,
      'Nomor Urut': c.nomorUrut,
      'Nama Kandidat': c.name,
      'Visi': c.visi,
      'Misi': c.misi.replace(/\n/g, ' | '),
      'Jumlah Suara': c.voteCount,
      'Persentase': totalVotes > 0 ? `${((c.voteCount / totalVotes) * 100).toFixed(1)}%` : '0%',
    }));

  // Prepare summary data
  const summaryData = [
    { 'Keterangan': 'Judul Pemilihan', 'Nilai': electionTitle },
    { 'Keterangan': 'Tanggal Export', 'Nilai': new Date().toLocaleString('id-ID') },
    { 'Keterangan': 'Total Kandidat', 'Nilai': candidates.length },
    { 'Keterangan': 'Total Pemilih Terdaftar', 'Nilai': totalVoters },
    { 'Keterangan': 'Total Suara Masuk', 'Nilai': totalVotes },
    { 'Keterangan': 'Partisipasi', 'Nilai': totalVoters > 0 ? `${((totalVotes / totalVoters) * 100).toFixed(1)}%` : '0%' },
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Ringkasan');

  // Candidates sheet
  const candidatesWs = XLSX.utils.json_to_sheet(candidateData);
  // Set column widths
  candidatesWs['!cols'] = [
    { wch: 8 },   // Peringkat
    { wch: 12 },  // Nomor Urut
    { wch: 25 },  // Nama
    { wch: 40 },  // Visi
    { wch: 50 },  // Misi
    { wch: 15 },  // Suara
    { wch: 12 },  // Persentase
  ];
  XLSX.utils.book_append_sheet(wb, candidatesWs, 'Hasil Kandidat');

  // Generate filename
  const filename = `Hasil-Pemilihan-${new Date().toISOString().slice(0, 10)}.xlsx`;

  // Download
  XLSX.writeFile(wb, filename);
}