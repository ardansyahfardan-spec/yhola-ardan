# YHOLA & ARDAN — Interactive Wedding Invitation

Versi awal siap dipakai dan dikembangkan.

## Cara menjalankan
Buka `index.html` melalui hosting (GitHub Pages/Netlify/Vercel). Untuk pengujian lokal, sebaiknya gunakan server lokal karena beberapa browser membatasi audio/file lokal.

## Yang bisa diganti sendiri
### 1. Musik
Ganti:
`music/wedding.mp3`
dengan lagu lain menggunakan nama file yang sama. Tidak perlu mengubah kode.

### 2. Data undangan
Edit `config.js` untuk nama, tanggal, venue, rekening, Love Story, teks opening, dan lain-lain.

### 3. Nama tamu
URL mendukung:
`?to=Rizky`
Contoh:
`index.html?to=Rizky`

Nanti daftar tamu bisa diintegrasikan saat Excel/CSV sudah siap.

### 4. Gallery
Masukkan foto ke folder `gallery/`. Versi awal sudah menyediakan area gallery; tahap berikutnya bisa dibuat otomatis membaca semua foto.

## Catatan
- Musik mulai setelah tombol BUKA UNDANGAN ditekan agar kompatibel dengan kebijakan autoplay browser.
- Efek click sound dibuat dengan Web Audio sehingga tidak membutuhkan file SFX tambahan.
- RSVP dan ucapan pada versi awal tersimpan di browser (localStorage), sehingga belum menjadi database online. Untuk RSVP/ucapan yang benar-benar terkumpul dari semua tamu, tahap berikutnya perlu backend/database.
- Background asli tidak diubah; animasi kupu-kupu, kunang-kunang, sparkle, popup, dan hotspot ditambahkan sebagai layer.
