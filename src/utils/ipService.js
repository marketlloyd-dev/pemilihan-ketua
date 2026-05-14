/**
 * Mendapatkan IP publik pengguna
 * @returns {Promise<string>} IP address
 */
export async function getIpAddress() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Gagal mendapatkan IP:', error);
    return null;
  }
}