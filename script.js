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

function accountRow(bank, number, holder){
  return `<div class="account-item"><div><b>${bank}</b><span>${number}</span><small>a/n ${holder}</small></div><button class="copy-btn" data-copy="${number}" aria-label="Salin nomor rekening ${bank}">Salin</button></div>`;
}
function popupTitle(image, alt, title){
  return `<div class="popup-title-art"><img src="assets/${image}" alt="${alt}"></div><h1 class="visual-title">${title}</h1>`;
}

const content = {
  about: () => `<div class="story-popup">${popupTitle("ABOUT-US.png","Cerita Kami","Cerita Kami")}<p>${W.aboutUs}</p></div>`,
  couple: () => `<div class="couple-popup">${popupTitle("YHOLA-ARDAN.png","Yhola & Ardan","Yhola & Ardan")}<p>Hai, ${guest}.</p><p>Kami ingin berbagi kabar bahagia bahwa kami akan melangsungkan pernikahan. Dengan penuh kebahagiaan, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir dan turut memberikan doa restu pada acara pernikahan kami.</p><div class="info-grid"><div class="info-item"><b>Syahfardan Al Hilal Havi</b><span>Putra dari Bapak Hadi Wijanarko & Ibu Vinie Nurwachjunie</span></div><div class="info-item"><b>Yholanda Regita Hariyanto</b><span>Putri dari Bapak Sugeng Hariyanto & Ibu Anik Rahayu</span></div></div></div>`,
  gallery: () => `<div class="gallery-popup">${popupTitle("GALLERY.png","Gallery","Gallery")}<div class="gallery-empty"><strong>Foto menyusul 🤍</strong><span>Tempat gallery sudah disiapkan. Nanti foto dapat ditambahkan ke folder <b>gallery/</b>.</span></div></div>`,
  date: () => `<div class="date-popup">${popupTitle("DATE-VENUE.png","Date & Venue","Date & Venue")}<div class="info-grid"><div class="info-item"><b>Tanggal</b><span>${W.date}</span></div><div class="info-item"><b>Akad Nikah</b><span>${W.akad}</span></div><div class="info-item"><b>Resepsi</b><span>${W.reception}</span></div><div class="info-item"><b>Tempat</b><span>${W.venue}<br>${W.address}</span></div><div class="info-item"><b>Dress Code</b><span>Pakaian Ternyaman, Versi Terbaikmu</span></div></div><a class="primary maps-button" href="${W.maps}" target="_blank" rel="noopener">Buka Google Maps ↗</a></div>`,
  gift: () => `<div class="gift-popup">${popupTitle("GIFT.png","Gift","Gift")}<p>Doa dan kehadiranmu sudah menjadi hadiah yang sangat berarti. Jika berkenan memberikan tanda kasih, berikut pilihannya:</p><div class="accounts">${accountRow("BRI", W.bri, W.briHolder)}${accountRow("Mandiri", W.mandiri, W.mandiriHolder)}${accountRow("BCA", W.bca, W.bcaHolder)}</div><div class="info-item gift-address"><b>Kirim Hadiah</b><span>${W.giftAddress}</span></div></div>`,
  rsvp: () => `<div class="rsvp-popup">${popupTitle("RSVP.png","RSVP","RSVP")}<form id="rsvpForm"><label>Nama<input id="rsvpName" required value="${guest!==W.openingGuest?guest:""}" placeholder="Nama lengkap"></label><label>Konfirmasi Kehadiran<div class="radio-row"><label class="choice"><input type="radio" name="attendance" value="Hadir" required> Hadir</label><label class="choice"><input type="radio" name="attendance" value="Tidak Hadir"> Tidak Hadir</label></div></label><label id="guestCountWrap">Jumlah tamu<input id="rsvpCount" type="number" min="1" max="10" value="1"></label><label>Pesan (opsional)<textarea id="rsvpMessage" rows="3" maxlength="180" placeholder="Pesan untuk Yhola & Ardan"></textarea></label><button class="primary" type="submit">Kirim RSVP</button></form></div>`
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
    setTimeout(()=>{
      const form=$("#rsvpForm");
      form.addEventListener("change",e=>{ if(e.target.name==="attendance") $("#guestCountWrap").style.display=e.target.value==="Tidak Hadir"?"none":"block"; });
      form.addEventListener("submit",e=>{
      e.preventDefault();
      const checked=document.querySelector('input[name="attendance"]:checked');
      const data={name:$("#rsvpName").value,attendance:checked?checked.value:"",count:$("#rsvpCount").value,message:$("#rsvpMessage").value};
      localStorage.setItem("yha_rsvp",JSON.stringify(data));
      $("#modalContent").innerHTML=`<div class="kicker">RSVP Tersimpan</div><h1>Terima kasih, ${data.name} 🤍</h1><div class="rsvp-result">Kehadiranmu sudah dicatat sebagai <b>${data.attendance}</b> untuk ${data.count} orang.</div><p>${data.message||"Sampai bertemu di hari bahagia kami."}</p>`;
      tone("success");
    });
  },0);
  }
}));

$("#openInvitation").addEventListener("click", async ()=>{
  tone("open");
  try{await audio.play(); playing=true; $("#musicIcon").src="assets/MUSIK.png"}catch(e){}
  $("#opening").classList.add("hide");
  setTimeout(()=>{
    $("#tutorialModal").classList.remove("is-hidden");
    $("#tutorialModal").setAttribute("aria-hidden","false");
  }, 450);
});

function finishTutorial(){
  $("#tutorialModal").classList.add("is-hidden");
  $("#tutorialModal").setAttribute("aria-hidden","true");
  tone("success");
}
$("#startExplore").addEventListener("click", finishTutorial);
$("#tutorialClose").addEventListener("click", finishTutorial);

window.addEventListener("resize",()=>{});
$("#musicBtn").addEventListener("click", async ()=>{
  if(playing){audio.pause();playing=false;$("#musicIcon").src="assets/MUTE.png";tone("click")}
  else{try{await audio.play();playing=true;$("#musicIcon").src="assets/MUSIK.png";tone("click")}catch(e){showToast("Musik belum bisa diputar.")}}
});

// Tombol i tetap khusus untuk petunjuk/cara menjelajah.
$("#infoBtn").addEventListener("click",()=>openModal(`<div class="info-popup"><div class="kicker">Cara Menjelajah</div><h1>👋 Hai!</h1><p>Bingung mulai dari mana?<br>Di halaman ini ada beberapa bagian yang bisa kamu klik untuk melihat cerita kami.<br>Coba aja eksplor satu-satu. Siapa tahu ada cerita kecil yang kamu temukan 🤍<br>Selamat menjelajah!</p><div class="explore-list"><span>1. <b>YHOLA & ARDAN</b> — tentang kami</span><span>2. <b>Cerita Kami</b> — cerita kita</span><span>3. <b>Date & Venue</b> — hari dan tempat untuk merayakan cinta kami</span><span>4. <b>Gallery</b> — potret kecil cerita kami 📷</span><span>5. <b>Gift</b> — tanda kasihmu</span><span>6. <b>RSVP</b> — sampai jumpa di hari bahagia kami 🤍</span></div></div>`));

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
// Loading screen: only the hanging wooden board moves. START remains completely static.
(function initOpening(){
  const bar=$("#loadingBar");
  let progress=0;
  const timer=setInterval(()=>{
    progress+=Math.floor(Math.random()*9)+7;
    if(progress>=100){progress=100;clearInterval(timer);setTimeout(()=>{
      $("#loadingScreen").classList.add("is-hidden");
      $("#startScreen").classList.remove("is-hidden");
    },280);}
    bar.style.width=progress+"%";
  },120);
})();

renderComment();
