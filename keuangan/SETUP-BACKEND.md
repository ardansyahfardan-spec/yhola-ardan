# Setup backend Buku Sumbangan

Backend ini khusus untuk halaman `/keuangan/` dan TIDAK menggunakan Apps Script RSVP/UCAPAN.

## Langkah setup

1. Buka https://script.google.com/ lalu pilih **New project**.
2. Buka file `Code.gs` pada folder ini di GitHub, salin seluruh isinya ke editor Apps Script.
3. Simpan, pilih fungsi `setup`, lalu klik **Run**. Berikan izin Google yang diminta.
4. Buka **Execution log** untuk mendapatkan URL spreadsheet baru yang dibuat otomatis.
5. Pilih **Deploy → New deployment → Web app**.
6. Set **Execute as: Me** dan **Who has access: Anyone**, lalu Deploy dan salin URL yang berakhiran `/exec`.
7. URL deployment itu nanti dipasang pada halaman website keuangan.

## Penting tentang akses

Konfigurasi di atas sengaja tidak meminta login, sesuai pilihan pemilik. Konsekuensinya, siapa pun yang mengetahui URL Web App dapat membaca, menambah, mengedit, atau menghapus catatan. Jangan menaruh data sensitif di sana. Jangan pernah membagikan URL deployment secara terbuka.

Spreadsheet yang dibuat oleh `setup()` tetap berada di Google Drive pemilik; jangan ubah sharing spreadsheet menjadi publik.

## Pemisahan

- Tidak mengubah spreadsheet RSVP.
- Tidak mengubah Apps Script RSVP/UCAPAN.
- Membuat spreadsheet baru bernama **Buku Sumbangan — Ardan & Yhola**.
- Endpoint Web App ini hanya untuk halaman keuangan.

## Catatan integrasi

File `index.html` perlu dihubungkan ke URL `/exec` hasil deployment sebelum pencatatan online aktif. Jangan masukkan data asli sampai pengujian tambah, edit, hapus, dan muat ulang berhasil.
