const W = window.WEDDING;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const params = new URLSearchParams(location.search);
const guest = params.get("to") ? decodeURIComponent(params.get("to")).replace(/\+/g," ") : W.openingGuest;
$("#guestName").textContent = guest;

const audio = $("#bgMusic");
audio.src = W.musicFile;
let playing = false;
let comments = JSON.parse(localStorage.getItem("yha_comments") || "[]");
let commentIndex = 0;

function tone(kind="click"){
  try{
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    const now = ctx.currentTime;
    const freq = kind==="open" ? 520 : kind==="success" ? 740 : 380;
    o.type = "sine"; o.frequency.setValueAtTime(freq,now);
    o.frequency.exponentialRampToValueAtTime(freq*1.45, now+.12);
    g.gain.setValueAtTime(.0001,now); g.gain.exponentialRampToValueAtTime(.07,now+.015); g.gain.exponentialRampToValueAtTime(.0001,now+.18);
    o.connect(g).connect(ctx.destination); o.start(now); o.stop(now+.2);
  }catch(e){}
}

function showToast(text){
  const t=$("#toast"); t.textContent=text; t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),2200);
}

function openModal(html){
  $("#modalContent").innerHTML=html;
  $("#modal").classList.add("open"); $("#modal").setAttribute("aria-hidden","false"); tone("click");
}
function closeModal(){
  $("#modal").classList.remove("open"); $("#modal").setAttribute("aria-hidden","true");
}
$$(".modal-close").forEach(b=>b.addEventListener("click",()=>{b.closest(".modal").classList.remove("open");tone("click")}));
$$(".modal-backdrop").forEach(b=>b.addEventListener("click",()=>{b.closest(".modal").classList.remove("open");tone("click")}));

const content = {
  about: () => `<div class="kicker">Tentang Kami</div><h1>Yhola & Ardan</h1><p>${W.aboutUs}</p><div class="quote">“${W.quote}”</div><div class="quote-source">${W.quoteSource}</div>`,
  gallery: () => `<div class="kicker">Cerita Dalam Foto</div><h1>Gallery</h1><div class="gallery-empty"><strong>Foto prewedding menyusul 🤍</strong><span>Tempat gallery sudah disiapkan. Nanti kamu cukup menambahkan foto ke folder <b>gallery/</b>.</span></div>`,
  date: () => `<div class="kicker">Hari Bahagia</div><h1>Date & Venue</h1><div class="info-grid">
    <div class="info-item"><b>Tanggal</b>${W.date}</div>
    <div class="info-item"><b>Akad Nikah</b>${W.akad}</div>
    <div class="info-item"><b>Resepsi</b>${W.reception}</div>
    <div class="info-item"><b>Tempat</b>${W.venue}<br>${W.address}</div>
  </div><a class="maps" href="${W.maps}" target="_blank" rel="noopener">Buka Google Maps ↗</a>`,
  gift: () => `<div class="kicker">Wedding Gift</div><h1>Tanda Kasih</h1><p>Doa dan kehadiranmu sudah menjadi hadiah yang sangat berarti. Jika berkenan memberikan tanda kasih, berikut pilihannya:</p><div class="info-grid">
    <div class="info-item"><b>BRI — ${W.bride}</b>${W.bri}</div>
    <div class="info-item"><b>Mandiri — ${W.bride}</b>${W.mandiri}</div>
    <div class="info-item"><b>Kirim Hadiah</b>${W.giftAddress}</div>
  </div>`,
  rsvp: () => `<div class="kicker">Konfirmasi Kehadiran</div><h1>RSVP</h1><form id="rsvpForm">
    <label>Nama<input id="rsvpName" required value="${guest!==W.openingGuest?guest:""}" placeholder="Nama lengkap"></label>
    <label>Konfirmasi Kehadiran<div class="radio-row">
      <label class="choice"><input type="radio" name="attendance" value="Hadir" required> Hadir</label>
      <label class="choice"><input type="radio" name="attendance" value="Tidak Hadir"> Tidak Hadir</label>
    </div></label>
    <label>Jumlah tamu<input id="rsvpCount" type="number" min="1" max="10" value="1"></label>
    <label>Pesan (opsional)<textarea id="rsvpMessage" rows="3" maxlength="180" placeholder="Pesan untuk Yhola & Ardan"></textarea></label>
    <button class="primary" type="submit">Kirim RSVP</button>
  </form>`
};

$$(".hotspot").forEach(btn=>btn.addEventListener("click",()=>{
  openModal(content[btn.dataset.popup]());
  if(btn.dataset.popup==="rsvp"){
    setTimeout(()=>$("#rsvpForm").addEventListener("submit",e=>{
      e.preventDefault(); const data={name:$("#rsvpName").value,attendance:document.querySelector('input[name="attendance"]:checked').value,count:$("#rsvpCount").value,message:$("#rsvpMessage").value};
      localStorage.setItem("yha_rsvp",JSON.stringify(data));
      $("#modalContent").innerHTML=`<div class="kicker">RSVP Tersimpan</div><h1>Terima kasih, ${data.name} 🤍</h1><div class="rsvp-result">Kehadiranmu sudah dicatat sebagai <b>${data.attendance}</b> untuk ${data.count} orang.</div><p>${data.message||"Sampai bertemu di hari bahagia kami."}</p>`;
      tone("success");
    }),0);
  }
}));

$("#openInvitation").addEventListener("click", async ()=>{
  tone("open");
  try{await audio.play(); playing=true; $("#musicIcon").src="assets/MUSIK.png"}catch(e){}
  $("#opening").classList.add("hide");
  showToast("Selamat datang di cerita Yhola & Ardan 🤍");
});
$("#musicBtn").addEventListener("click", async ()=>{
  if(playing){audio.pause();playing=false;$("#musicIcon").src="assets/MUTE.png";tone("click")}
  else{try{await audio.play();playing=true;$("#musicIcon").src="assets/MUSIK.png";tone("click")}catch(e){showToast("Musik belum bisa diputar.")}}
});
$("#infoBtn").addEventListener("click",()=>openModal(`<div class="kicker">Cara Menjelajah</div><h1>Selamat Datang 🤍</h1><p>Klik objek di sekitar untuk menjelajahi cerita kami.</p><p>Temukan <b>Gallery</b>, <b>Love Story</b>, <b>RSVP</b>, <b>Date & Venue</b>, dan <b>Gift</b>.</p><p>Musik dapat dinyalakan atau dimatikan melalui tombol di pojok kanan atas.</p>`));

function renderComment(){
  if(!comments.length){$("#commentName").textContent="Ucapan";$("#commentText").textContent="Tuliskan doa dan ucapan terbaik untuk Yhola & Ardan 🤍";return}
  const c=comments[commentIndex%comments.length]; $("#commentName").textContent=c.name;$("#commentText").textContent=c.message;
}
$("#addComment").addEventListener("click",()=>{$("#commentModal").classList.add("open");tone("click")});
$("#nextComment").addEventListener("click",()=>{if(comments.length){commentIndex=(commentIndex+1)%comments.length;renderComment();tone("click")}});
$("#hideComments").addEventListener("click",()=>{$("#commentsBox").style.display="none";$("#showComments").style.display="block";tone("click")});
$("#showComments").addEventListener("click",()=>{$("#commentsBox").style.display="block";$("#showComments").style.display="none";tone("click")});
$("#commentForm").addEventListener("submit",e=>{
  e.preventDefault(); comments.push({name:$("#commentAuthor").value,message:$("#commentMessage").value});localStorage.setItem("yha_comments",JSON.stringify(comments));
  $("#commentAuthor").value="";$("#commentMessage").value="";$("#commentModal").classList.remove("open");commentIndex=comments.length-1;renderComment();tone("success");showToast("Ucapan berhasil ditambahkan 🤍");
});
renderComment();
