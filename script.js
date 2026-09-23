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
$$('.modal-close').forEach(b=>b.addEventListener('click',()=>{b.closest('.modal').classList.remove('open');tone('click')}));
$$('.modal-backdrop').forEach(b=>b.addEventListener('click',()=>{b.closest('.modal').classList.remove('open');tone('click')}));

function accountRow(bank, number){
  const id = `acct-${bank.toLowerCase()}`;
  return `<div class="account-item"><div><b>${bank}</b><span>${number}</span><small>a/n ${W.accountHolder}</small></div><button class="copy-btn" data-copy="${number}" aria-label="Salin nomor rekening ${bank}">Salin</button></div>`;
}

const content = {
  about: () => `<div class="story-popup"><div class="kicker">Cerita Kami</div><h1>Yhola & Ardan</h1><p>${W.aboutUs}</p></div>`,
  couple: () => `<div class="couple-popup"><div class="kicker">Tentang Mempelai</div><h1>Yhola & Ardan</h1><div class="info-grid">
    <div class="info-item"><b>Mempelai Pria</b><strong>${W.groom}</strong><span>Ardan</span></div>
    <div class="info-item"><b>Mempelai Wanita</b><strong>${W.bride}</strong><span>Yhola</span></div>
    <div class="info-item"><b>Orang Tua Mempelai Pria</b><span>${W.groomParents}</span></div>
    <div class="info-item"><b>Orang Tua Mempelai Wanita</b><span>${W.brideParents}</span></div>
  </div></div>`,
  gallery: () => `<div class="gallery-popup"><div class="kicker">Cerita Dalam Foto</div><h1>Gallery</h1><div class="gallery-empty"><strong>Foto menyusul 🤍</strong><span>Tempat gallery sudah disiapkan. Nanti foto dapat ditambahkan ke folder <b>gallery/</b>.</span></div></div>`,
  date: () => `<div class="date-popup"><div class="kicker">Hari Bahagia</div><h1>Date & Venue</h1><div class="info-grid">
    <div class="info-item"><b>Tanggal</b><span>${W.date}</span></div>
    <div class="info-item"><b>Akad Nikah</b><span>${W.akad}</span></div>
    <div class="info-item"><b>Resepsi</b><span>${W.reception}</span></div>
    <div class="info-item"><b>Tempat</b><span>${W.venue}<br>${W.address}</span></div>
  </div><a class="primary maps-button" href="${W.maps}" target="_blank" rel="noopener">Buka Google Maps ↗</a></div>`,
  gift: () => `<div class="gift-popup"><div class="kicker">Wedding Gift</div><h1>Tanda Kasih</h1><p>Doa dan kehadiranmu sudah menjadi hadiah yang sangat berarti. Jika berkenan memberikan tanda kasih, berikut pilihannya:</p><div class="accounts">
    ${accountRow("BRI", W.bri)}
    ${accountRow("Mandiri", W.mandiri)}
    ${accountRow("BCA", W.bca)}
  </div><div class="info-item gift-address"><b>Kirim Hadiah</b><span>${W.giftAddress}</span></div></div>`,
  rsvp: () => `<div class="rsvp-popup"><div class="kicker">Konfirmasi Kehadiran</div><h1>RSVP</h1><form id="rsvpForm">
    <label>Nama<input id="rsvpName" required value="${guest!==W.openingGuest?guest:""}" placeholder="Nama lengkap"></label>
    <label>Konfirmasi Kehadiran<div class="radio-row">
      <label class="choice"><input type="radio" name="attendance" value="Hadir" required> Hadir</label>
      <label class="choice"><input type="radio" name="attendance" value="Tidak Hadir"> Tidak Hadir</label>
    </div></label>
    <label>Jumlah tamu<input id="rsvpCount" type="number" min="1" max="10" value="1"></label>
    <label>Pesan (opsional)<textarea id="rsvpMessage" rows="3" maxlength="180" placeholder="Pesan untuk Yhola & Ardan"></textarea></label>
    <button class="primary" type="submit">Kirim RSVP</button>
  </form></div>`
};

function bindCopyButtons(){
  $$('.copy-btn').forEach(btn=>btn.addEventListener('click', async ()=>{
    try{
      await navigator.clipboard.writeText(btn.dataset.copy);
      btn.textContent='Tersalin';
      tone('success'); showToast(`Nomor rekening ${btn.parentElement.querySelector('b').textContent} tersalin.`);
      setTimeout(()=>btn.textContent='Salin',1500);
    }catch(e){
      showToast('Nomor rekening: '+btn.dataset.copy);
    }
  }));
}

$$('.hotspot').forEach(btn=>btn.addEventListener('click',()=>{
  openModal(content[btn.dataset.popup]());
  bindCopyButtons();
  if(btn.dataset.popup==="rsvp"){
    setTimeout(()=>$("#rsvpForm").addEventListener("submit",e=>{
      e.preventDefault();
      const checked=document.querySelector('input[name="attendance"]:checked');
      const data={name:$("#rsvpName").value,attendance:checked?checked.value:"",count:$("#rsvpCount").value,message:$("#rsvpMessage").value};
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

// Tombol i tetap khusus untuk petunjuk/cara menjelajah.
$("#infoBtn").addEventListener("click",()=>openModal(`<div class="info-popup"><div class="kicker">Cara Menjelajah</div><h1>Selamat Datang 🤍</h1><p>Klik objek di sekitar untuk menjelajahi cerita kami.</p><div class="explore-list"><span>🌿 <b>Gallery</b> — cerita dalam foto</span><span>📖 <b>Love Story</b> — perjalanan Yhola & Ardan</span><span>💌 <b>RSVP</b> — konfirmasi kehadiran</span><span>📍 <b>Date & Venue</b> — waktu & lokasi</span><span>🎁 <b>Gift</b> — tanda kasih</span><span>🪧 <b>YHOLA & ARDAN</b> — data pengantin</span></div><p class="info-note">Musik dapat dinyalakan atau dimatikan melalui tombol di pojok kanan atas.</p></div>`));

function renderComment(){
  if(!comments.length){$("#commentText").textContent="Tuliskan doa dan ucapan terbaik untuk Yhola & Ardan 🤍";return}
  const c=comments[commentIndex%comments.length]; $("#commentText").textContent=c.message;
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
