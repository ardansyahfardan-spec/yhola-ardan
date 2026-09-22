# Undangan Yhola & Ardan — V4

Versi V4 mempertahankan ilustrasi/background tetap diam. Label interaktif dibuat lebih hidup dengan:
- teks label bergerak naik-turun secara lembut;
- aura/sinar pink lembut di belakang teks;
- sparkle kecil dengan timing berbeda;
- efek hover/touch berupa sedikit pembesaran dan glow lebih kuat;
- INFO dan MUSIC tetap menjadi tombol kontrol di kanan atas dan tidak ikut animasi dekoratif.

## Struktur editable
- `data/undangan.js` — data acara, orang tua, rekening, RSVP, teks undangan, dan gallery.
- `assets/background.png` — background asli.
- `assets/background-layered.png` — background yang sudah dilapisi artwork label yang selaras dengan background untuk mencegah efek dobel.
- `assets/text-*.png` — layer teks transparan yang dianimasikan.
- `assets/music.mp3` — musik.

Untuk menambahkan foto gallery, masukkan file ke `assets/gallery/` lalu isi daftar `gallery.photos` di `data/undangan.js`.
