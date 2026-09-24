const W = window.WEDDING;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const params = new URLSearchParams(location.search);
const guest = params.get("to") ? decodeURIComponent(params.get("to")).replace(/\+/g," ") : W.openingGuest;

const audio = $("#bgMusic");
let trackIndex = 0;
let playing = false;
audio.src = W.musicFiles[trackIndex];

audio.addEventListener("ended", async () => {
  trackIndex = (trackIndex + 1) % W.musicFiles.length;
  audio.src = W.musicFiles[trackIndex];
  try { await audio.play(); playing = true; $("#musicIcon").src = "assets/MUSIK.png"; } catch(e) {}
});

let comments = JSON.parse(localStorage.getItem("yha_comments") || "[]");
let commentIndex = 0;
let commentTimer = null;

function tone(kind="click"){
  try{
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    const now = ctx.currentTime;
    const freq = kind === "open" ? 520 : kind === "success" ? 740 : 380;
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

function openModal(html, options={}){
  const decor = options.decor ? `<div class="popup-decor"><img src="${options.decor}" alt=""></div>` : "";
  $("#modalContent").innerHTML = decor + html;
  $("#modal").classList.add("open");
  $("#modal").setAttribute("aria-hidden","false");
  tone("click");
}
function closeModal(modal){
  modal.classList.remove("open"); modal.setAttribute("aria-hidden","true");
}

$$('.modal-close').forEach(b=>b.addEventListener('click',()=>{closeModal(b.closest('.modal'));tone('click')}));
$$('.modal-backdrop').forEach(b=>b.addEventListener('click',()=>{closeModal(b.closest('.modal'));tone('click')}));

function accountRow(bank, number, holder){
  return `<div class="account-item"><div><b>${bank}</b><span>${number}</span><small>a/n ${holder}</small></div><button class="copy-btn" data-copy="${number}" aria-label="Salin nomor rekening ${bank}">Salin</button></div>`;
}

const content = {
  about: () => `<div class="story-popup"><div class="kicker">Cerita Kami</div><h1>Cerita Kami</h1><p>${W.aboutUs}</p></div>`,
  couple: () => `<div class="couple-popup"><div class="kicker">Tentang Kami</div><h1>Yhola & Ardan</h1><p>Hai, ${guest}.</p><p>Kami ingin berbagi kabar bahagia bahwa kami akan melangsungkan pernikahan. Dengan penuh kebahagiaan, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir dan turut memberikan doa restu pada acara pernikahan kami.</p><div class="names-detail"><strong>${W.groom}</strong><span>Putra dari Bapak ${W.groomParents.replace(" & "," & Ibu ")}</span><i>&</i><strong>${W.bride}</strong><span>Putri dari Bapak ${W.brideParents.replace(" & "," & Ibu ")}</span></div></div>`,
  gallery: () => `<div class="gallery-popup"><div class="kicker">Potret Kecil</div><h1>Gallery</h1><div class="carousel" id="galleryCarousel"><div class="slides"><div class="slide active"><div class="photo-placeholder">📷<strong>Foto 1</strong><span>Foto akan ditambahkan nanti</span></div></div><div class="slide"><div class="photo-placeholder">📷<strong>Foto 2</strong><span>Foto akan ditambahkan nanti</span></div></div><div class="slide"><div class="photo-placeholder">📷<strong>Foto 3</strong><span>Foto akan ditambahkan nanti</span></div></div></div><button class="carousel-prev" aria-label="Foto sebelumnya">‹</button><button class="carousel-next" aria-label="Foto berikutnya">›</button><div class="dots"><button class="dot active" data-index="0"></button><button class="dot" data-index="1"></button><button class="dot" data-index="2"></button></div></div></div>`,
  date: () => `<div class="date-popup"><div class="kicker">Hari Bahagia</div><h1>Date & Venue</h1><div class="date-box"><div><small>AKAD</small><strong>${W.akad}</strong></div><div><small>RESEPSI</small><strong>${W.reception}</strong></div></div><h2>${W.venue}</h2><p>${W.address}</p><a class="primary maps-button" href="${W.maps}" target="_blank" rel="noopener">Buka Google Maps</a><div class="dress-code"><small>DRESS CODE</small><strong>${W.dressCode}</strong></div></div>`,
  gift: () => `<div class="gift-popup"><div class="kicker">Wedding Gift</div><h1>Gift</h1><p>Doa dan kehadiranmu sudah menjadi hadiah yang sangat berarti. Jika berkenan memberikan tanda kasih, berikut pilihannya:</p><div class="accounts">${accountRow("BRI", W.bri, W.briHolder)}${accountRow("Mandiri", W.mandiri, W.mandiriHolder)}${accountRow("BCA", W.bca, W.bcaHolder)}</div><div class="info-item gift-address"><b>Kirim Hadiah</b><span>${W.giftAddress}</span></div></div>`,
  rsvp: () => `<div class="rsvp-popup"><div class="kicker">Konfirmasi Kehadiran</div><h1>RSVP</h1><form id="rsvpForm"><label>Nama<input id="rsvpName" required value="${guest!==W.openingGuest?guest:""}" placeholder="Nama lengkap"></label><label>Konfirmasi Kehadiran<div class="radio-row"><label class="choice"><input type="radio" name="attendance" value="Hadir" required> Hadir</label><label class="choice"><input type="radio" name="attendance" value="Tidak Hadir"> Tidak Hadir</label></div></label><label>Jumlah tamu<input id="rsvpCount" type="number" min="1" max="10" value="1"></label><label>Pesan (opsional)<textarea id="rsvpMessage" rows="3" maxlength="180" placeholder="Pesan untuk Yhola & Ardan"></textarea></label><button class="primary" type="submit">Kirim RSVP</button></form></div>`
};

const decorations = {
  couple: "assets/YHOLA-ARDAN.png",
  about: "assets/ABOUT-US.png",
  date: "assets/DATE-VENUE.png",
  gallery: "assets/GALLERY.png",
  gift: "assets/GIFT.png",
  rsvp: "assets/RSVP.png"
};

function bindCopyButtons(){
  $$('.copy-btn').forEach(btn=>btn.addEventListener('click', async ()=>{
    try{ await navigator.clipboard.writeText(btn.dataset.copy); btn.textContent='Tersalin'; tone('success'); showToast(`Nomor rekening ${btn.parentElement.querySelector('b').textContent} tersalin.`); setTimeout(()=>btn.textContent='Salin',1500); }
    catch(e){ showToast('Nomor rekening: '+btn.dataset.copy); }
  }));
}

function bindGallery(){
  const slides=$$("#galleryCarousel .slide"), dots=$$("#galleryCarousel .dot");
  let i=0;
  const go=n=>{i=(n+slides.length)%slides.length;slides.forEach((s,j)=>s.classList.toggle('active',j===i));dots.forEach((d,j)=>d.classList.toggle('active',j===i));};
  $("#galleryCarousel .carousel-prev").addEventListener('click',()=>{go(i-1);tone('click')});
  $("#galleryCarousel .carousel-next").addEventListener('click',()=>{go(i+1);tone('click')});
  dots.forEach(d=>d.addEventListener('click',()=>{go(Number(d.dataset.index));tone('click')}));
}

function bindRSVP(){
  const form=$("#rsvpForm");
  if(!form)return;
  form.addEventListener("submit",e=>{
    e.preventDefault();
    const checked=document.querySelector('input[name="attendance"]:checked');
    const data={name:$("#rsvpName").value,attendance:checked?checked.value:"",count:$("#rsvpCount").value,message:$("#rsvpMessage").value};
    localStorage.setItem("yha_rsvp",JSON.stringify(data));
    $("#modalContent").innerHTML=`<div class="popup-decor"><img src="assets/RSVP.png" alt=""></div><div class="kicker">RSVP Tersimpan</div><h1>Terima kasih, ${data.name} 🤍</h1><div class="rsvp-result">Kehadiranmu sudah dicatat sebagai <b>${data.attendance}</b> untuk ${data.count} orang.</div><p>${data.message||"Sampai bertemu di hari bahagia kami."}</p>`;
    tone("success");
  });
}

$$('.hotspot').forEach(btn=>btn.addEventListener('click',()=>{
  const type=btn.dataset.popup;
  openModal(content[type](),{decor:decorations[type]});
  bindCopyButtons();
  if(type==='gallery')bindGallery();
  if(type==='rsvp')bindRSVP();
}));

function showTutorial(){
  openModal(`<div class="tutorial-popup"><h1>🌿 Yuk, jelajahi cerita kami!</h1><p>Coba klik tulisan dan objek di sekitar untuk melihat ceritanya.</p><p>Selamat menjelajah 🤍</p><button id="startExplore" class="primary">Mulai Menjelajah</button></div>`);
  $("#startExplore").addEventListener('click',()=>{closeModal($("#modal"));tone('success')});
}

function showStartScreen(){
  $("#loadingScreen").classList.add("loading-open");
  setTimeout(()=>$("#startScreen").classList.add("visible"),700);
}

function enterInvitation(){
  tone("open");
  const start=$("#startScreen");
  start.classList.add("entering");
  document.body.classList.add("entering-world");
  setTimeout(()=>{
    start.classList.add("done");
    document.querySelector(".scene").classList.add("scene-visible");
    audio.play().then(()=>{playing=true;$("#musicIcon").src="assets/MUSIK.png";}).catch(()=>showToast("Ketuk tombol musik jika browser menahan autoplay."));
    setTimeout(showTutorial,650);
  },900);
}

$("#startButton").addEventListener("click",enterInvitation);

(function runLoading(){
  const fill=$("#loadingFill"), pct=$("#loadingPercent");
  let n=0;
  const timer=setInterval(()=>{
    n+=Math.max(1,Math.round((100-n)*0.075));
    if(n>=100){n=100;clearInterval(timer);setTimeout(showStartScreen,350);}
    fill.style.width=n+"%"; pct.textContent=n+"%";
  },55);
})();

$("#musicBtn").addEventListener("click", async ()=>{
  if(playing){audio.pause();playing=false;$("#musicIcon").src="assets/MUTE.png";tone("click");}
  else{try{await audio.play();playing=true;$("#musicIcon").src="assets/MUSIK.png";tone("click");}catch(e){showToast("Musik belum bisa diputar.");}}
});

$("#infoBtn").addEventListener("click",()=>openModal(`<div class="info-popup"><h1>👋 Hai!</h1><p>Bingung mulai dari mana?</p><p>Di halaman ini ada beberapa bagian yang bisa kamu klik untuk melihat cerita kami. Coba aja eksplor satu-satu. Siapa tahu ada cerita kecil yang kamu temukan 🤍</p><p>Selamat menjelajah!</p><div class="explore-list"><span><b>YHOLA & ARDAN</b> — tentang kami</span><span><b>Cerita Kami</b> — cerita kita</span><span><b>Date & Venue</b> — hari dan tempat untuk merayakan cinta kami</span><span><b>Gallery</b> — potret kecil cerita kami 📷</span><span><b>Gift</b> — tanda kasihmu</span><span><b>RSVP</b> — sampai jumpa di hari bahagia kami 🤍</span></div></div>`));

function renderComment(){
  if(!comments.length){$("#commentText").innerHTML='<b>Yhola & Ardan</b><span> Tuliskan doa dan ucapan terbaik untuk kami 🤍</span>';return;}
  const c=comments[commentIndex%comments.length];
  $("#commentText").innerHTML=`<b>${escapeHTML(c.name)}</b><span>${escapeHTML(c.message)}</span>`;
}
function escapeHTML(s){return String(s).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));}
function startCommentRotation(){
  clearInterval(commentTimer);
  commentTimer=setInterval(()=>{if(comments.length>1){commentIndex=(commentIndex+1)%comments.length;renderComment();}},6000);
}

$("#addComment").addEventListener("click",()=>{$("#commentModal").classList.add("open");tone("click")});
$("#nextComment").addEventListener("click",()=>{if(comments.length){commentIndex=(commentIndex+1)%comments.length;renderComment();tone("click")}});
$("#hideComments").addEventListener("click",()=>{$("#commentsBox").style.display="none";$("#showComments").style.display="block";tone("click")});
$("#showComments").addEventListener("click",()=>{$("#commentsBox").style.display="block";$("#showComments").style.display="none";tone("click")});
$("#commentForm").addEventListener("submit",e=>{
  e.preventDefault();
  comments.push({name:$("#commentAuthor").value.trim(),message:$("#commentMessage").value.trim()});
  localStorage.setItem("yha_comments",JSON.stringify(comments));
  $("#commentAuthor").value="";$("#commentMessage").value="";$("#commentModal").classList.remove("open");
  commentIndex=comments.length-1;renderComment();startCommentRotation();tone("success");showToast("Ucapan berhasil ditambahkan 🤍");
});

renderComment();startCommentRotation();
