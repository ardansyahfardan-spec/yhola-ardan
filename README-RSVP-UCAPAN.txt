V41 — koneksi UCAPAN Google Sheets

Website ini sekarang:
- tidak memakai ucapan dummy bawaan;
- membaca semua ucapan dari Google Sheets melalui Apps Script JSONP;
- mengganti bubble setiap 7 detik;
- tetap menyimpan semua ucapan di Google Sheets;
- tombol UCAPAN tetap untuk tampil/sembunyikan bubble;
- tombol + mengirim ucapan ke endpoint type=ucapan.

PENTING:
Sebelum V41 bisa membaca data UCAPAN dari Web App, doGet Apps Script harus mengizinkan callback JSONP, dan doPost harus menerima type=ucapan.

Gunakan perubahan Apps Script yang diberikan di chat setelah menerima file V41.
