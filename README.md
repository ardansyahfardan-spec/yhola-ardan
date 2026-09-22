# Undangan Digital Yhola & Ardan — V2

## Perubahan V2
- Area tombol utama sekarang memiliki animasi glow/pulse dan sparkle agar lebih terlihat bisa diklik.
- Tombol INFO dan MUSIK dipindahkan ke pojok kanan atas.
- File musik tetap bisa diganti nanti melalui `data/undangan.js` pada `music.file`.

## Edit musik nanti
1. Masukkan file MP3 baru ke folder `assets/`.
2. Buka `data/undangan.js`.
3. Ubah `music.file`, contoh:
   `file: 'assets/lagu-baru.mp3'`

## Data yang bisa diedit
Buka `data/undangan.js` untuk nama, acara, RSVP, Gift, About Us, Gallery, dan musik.

## Gallery
Tambahkan foto ke folder `assets/gallery/`, lalu isi array `gallery.photos` di `data/undangan.js`, contoh:
`photos: ['assets/gallery/foto-1.jpg', 'assets/gallery/foto-2.jpg']`

## Nama tamu otomatis
Gunakan URL seperti:
`index.html?to=Bapak%20Budi`

Website dibuat mobile-first dan dapat di-host di GitHub Pages, Cloudflare Pages, atau Netlify.
