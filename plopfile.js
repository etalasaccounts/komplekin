const path = require('path');
const fs = require('fs'); // Untuk memeriksa keberadaan file

module.exports = function (plop) {
  // Pesan debug ini akan muncul jika file ini berhasil dijalankan oleh plop.load()
  console.log('[DEBUG] Mengeksekusi plopfile.js dari root paket etalas-plop-monorepo.');

  // Path ke file index.js yang berisi definisi generator Anda
  const generatorsIndexPath = path.join(__dirname, 'packages', 'plop-templates', 'generators', 'index.js');
  console.log(`[DEBUG] Path yang akan di-require untuk konfigurasi generator: ${generatorsIndexPath}`);

  // Periksa apakah file tersebut ada sebelum mencoba me-require-nya
  if (fs.existsSync(generatorsIndexPath)) {
    try {
      const generatorsConfigFunction = require(generatorsIndexPath); // Me-require file index.js tersebut

      if (typeof generatorsConfigFunction === 'function') {
        console.log('[DEBUG] Menjalankan fungsi konfigurasi generator dari .../generators/index.js.');
        generatorsConfigFunction(plop); // Menjalankan fungsi tersebut dan memberikan 'plop' instance
      } else {
        console.error(`[ERROR] File ${generatorsIndexPath} tidak mengekspor sebuah fungsi. Diterima: ${typeof generatorsConfigFunction}`);
      }
    } catch (error) {
      console.error(`[ERROR] Gagal saat me-require atau menjalankan ${generatorsIndexPath}:`, error);
    }
  } else {
    console.error(`[ERROR] File konfigurasi generator (${generatorsIndexPath}) tidak ditemukan.`);
  }

  // Logging akhir untuk melihat status generator
  if (plop.getGeneratorList().length > 0) {
    console.log('[INFO] Generator yang berhasil terdaftar oleh etalas-plop-monorepo:', plop.getGeneratorList().map(g => g.name).join(', '));
  } else {
    console.warn('[WARN] Tidak ada generator yang terdaftar oleh etalas-plop-monorepo setelah semua proses.');
  }
};
