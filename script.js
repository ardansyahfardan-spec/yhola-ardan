const $=id=>document.getElementById(id);
const guestRaw=new URLSearchParams(location.search).get('to')||'Tamu Undangan';
const guest=guestRaw.replace(/\+/g,' ').trim()||'Tamu Undangan';
const audioCtx=window.AudioContext?new AudioContext():null;
let audioUnlocked=false, musicOn=true, currentTrack=1, lampOn=true, lampTutorialDone=false;

$('startGuest').textContent=guest;

function sfx(type='click'){
  if(!audioCtx)return;
  if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});
  const now=audioCtx.currentTime;
  if(type==='creak'){
    [0,0.22,0.46].forEach((d,i)=>{
      const o=audioCtx.createOscillator(),g=audioCtx.createGain();
      o.type='sine';o.frequency.setValueAtTime(155-i*14,now+d);o.frequency.exponentialRampToValueAtTime(72-i*5,now+d+.18);
      g.gain.setValueAtTime(.0001,now+d);g.gain.exponentialRampToValueAtTime(.16,now+d+.02);g.gain.exponentialRampToValueAtTime(.0001,now+d+.2);
      o.connect(g).connect(audioCtx.destination);o.start(now+d);o.stop(now+d+.22);
    });return;
  }
  const o=audioCtx.createOscillator(),g=audioCtx.createGain();
  o.type=type==='lamp'?'sine':'triangle';o.frequency.setValueAtTime(type==='lamp'?520:660,now);o.frequency.exponentialRampToValueAtTime(type==='lamp'?300:420,now+.09);
  g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(type==='lamp'?.11:.08,now+.01);g.gain.exponentialRampToValueAtTime(.0001,now+.11);
  o.connect(g).connect(audioCtx.destination);o.start();o.stop(now+.12);
}
function unlockAudio(){
  if(!audioCtx)return;
  audioCtx.resume().catch(()=>{});audioUnlocked=true;
}
window.addEventListener('pointerdown',unlockAudio,{once:true,passive:true});

/* loading */
const loadSteps=['LOADING KOSONG.png','LOADING 25%.png','LOADIING 50%.png','LOADING 80%.png','LOADING FULL.png'];
let li=0;
const loadTimer=setInterval(()=>{
  li++;$('loadingBar').src='assets/'+loadSteps[Math.min(li,loadSteps.length-1)];
  if(li>=loadSteps.length-1){clearInterval(loadTimer);setTimeout(()=>{
    $('loadingStage').classList.add('open');
    setTimeout(()=>{$('loading').classList.add('hidden');$('start').classList.remove('hidden')},1150);
  },250)}
},500);

$('startBtn').addEventListener('click',()=>{
  unlockAudio();sfx('start');
  $('start').classList.add('hidden');$('tutorial').classList.remove('hidden');
});
$('tutorialClose').addEventListener('click',()=>{sfx();$('tutorial').classList.add('hidden');$('scene').classList.remove('hidden');startExperience()});
$('continueBtn').addEventListener('click',()=>{
  unlockAudio();sfx();$('tutorial').classList.add('hidden');$('scene').classList.remove('hidden');startExperience();
});

const m1=$('m1'),m2=$('m2'),vn=$('vn');
function startMusic(){
  musicOn=true;currentTrack=1;m1.currentTime=0;m2.pause();m1.volume=.78;m2.volume=.78;
  m1.play().catch(()=>{});updateMusicIcon();
  m1.onended=()=>{if(!musicOn)return;currentTrack=2;m2.currentTime=0;m2.play().catch(()=>{});updateMusicIcon()};
  m2.onended=()=>{if(!musicOn)return;currentTrack=1;m1.currentTime=0;m1.play().catch(()=>{});updateMusicIcon()};
}
function updateMusicIcon(){$('musicIcon').src=musicOn?'assets/MUSIC.png':'assets/MUTE.png'}
$('musicBtn').addEventListener('click',()=>{unlockAudio();sfx();const a=currentTrack===1?m1:m2;if(musicOn){a.pause();musicOn=false}else{musicOn=true;a.play().catch(()=>{});}updateMusicIcon()});
function duckMusic(v=.08){m1.volume=v;m2.volume=v}
function restoreMusic(){m1.volume=musicOn?.78:0;m2.volume=musicOn?.78:0}

function toggleLamp(){
  lampOn=!lampOn;$('lampImg').src=lampOn?'assets/LAMPU DEKOR UTAMA.png':'assets/LAMPU DEKOR MATI.png';$('lampGlow').classList.toggle('lamp-off',!lampOn);sfx('lamp');
}
$('lampHit').addEventListener('click',toggleLamp);$('lampHit').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleLamp()}});
function runLampTutorial(){
  if(lampTutorialDone)return;lampTutorialDone=true;
  const h=$('hand');h.classList.remove('hidden');h.classList.add('tap');
  setTimeout(()=>{if(lampOn)toggleLamp()},720);
  setTimeout(()=>{if(!lampOn)toggleLamp()},1850);
  setTimeout(()=>{h.classList.remove('tap');h.classList.add('hidden')},3000);
}

const objects=[
 ['couple','YHOLA & ARDAN OBJEK INTERAKTIF.png','YHOLA & ARDAN glow.png',[642,341,870,763]],
 ['story','LOVE STORY OBJEK INTERAKTIF.png','love story glow.png',[197,755,381,981]],
 ['gallery','GALLERY OBJEK INTERAKTIF.png','GALLERY glow.png',[166,326,298,391]],
 ['rsvp','RSVP UTK OBJEK INTERAKTIF.png','rsvp glow.png',[704,941,1037,1138]],
 ['date','DATE & VENUE OBJEK INTERAKTIF.png','date venue glow.png',[799,1217,1080,1487]],
 ['gift','GIFT OBJEK INTERAKTIF.png','gift glow.png',[756,1504,1036,1887]],
 ['chair','KURSI BERGERAK.png',null,[305,1104,820,1782]],
 ['people','KARAKTER ORANG OBJEK INTERAKTIF.png','KARAKTER ORANG glow.png',[354,520,673,807]]
];
function pct(v,total){return v/total*100}
function addLayer(id,file,glow){
  if(glow){const g=document.createElement('img');g.className='scene-layer scene-glow';g.src='assets/'+glow;g.alt='';g.style.setProperty('--dur',(5.1+(id.length%3)*.55)+'s');g.style.setProperty('--delay',((id.length%4)*-.6)+'s');$('objectLayers').appendChild(g)}
  const im=document.createElement('img');im.className='scene-layer scene-object';im.src='assets/'+file;im.alt='';im.dataset.id=id;im.style.setProperty('--dur',(4.6+(id.length%4)*.65)+'s');im.style.setProperty('--delay',((id.length%5)*-.7)+'s');$('objectLayers').appendChild(im);
}
function addHot(id,rect){const [x1,y1,x2,y2]=rect;const h=document.createElement('button');h.className='hot';h.setAttribute('aria-label',id);h.style.left=pct(x1,1080)+'%';h.style.top=pct(y1,1920)+'%';h.style.width=pct(x2-x1,1080)+'%';h.style.height=pct(y2-y1,1920)+'%';h.addEventListener('click',()=>{sfx();h.classList.remove('bump');void h.offsetWidth;h.classList.add('bump');setTimeout(()=>openPopup(id),180)});$('hotspots').appendChild(h)}
objects.forEach(([id,file,glow,rect])=>{addLayer(id,file,glow);addHot(id,rect)});

function chairJolt(){
  const chair=document.querySelector('[data-id="chair"]');if(!chair)return;
  chair.animate([{transform:'translateY(0) scale(1)'},{transform:'translateY(-5px) scale(1.006)'},{transform:'translateY(1px) scale(.998)'},{transform:'translateY(0) scale(1)'}],{duration:520,easing:'cubic-bezier(.2,.8,.2,1)'});sfx('creak');
}
let chairTimer;function scheduleChair(){clearTimeout(chairTimer);chairTimer=setTimeout(()=>{chairJolt();scheduleChair()},(6500+Math.random()*5500));}

function startExperience(){startMusic();runLampTutorial();scheduleChair();showComment(0);setInterval(()=>{if(!document.getElementById('commentBubble').classList.contains('hidden'))nextComment()},7000)}

const popupData={
 couple:{title:'Hai, '+guest,art:'YHOLA & ARDAN UTK POP UP.png',body:`<p>Kami ingin berbagi kabar bahagia bahwa kami akan melangsungkan pernikahan. Dengan penuh kebahagiaan, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir dan turut memberikan doa restu pada acara pernikahan kami.</p><p><b>Syahfardan Al Hilal Havi</b><br>Putra dari Bapak Hadi Wijanarko &amp; Ibu Vinie Nurwachjunie</p><p class="center">&amp;</p><p><b>Yholanda Regita Hariyanto</b><br>Putri dari Bapak Sugeng Hariyanto &amp; Ibu Anik Rahayu</p><div class="instagram-row"><button class="ig-btn" disabled>Instagram Yhola</button><button class="ig-btn" disabled>Instagram Ardan</button></div>`,long:false},
 story:{title:'Cerita Kami',art:'LOVE STORY UTK POP UP.png',body:`<img class="hero-photo" src="gallery/story.jpg" alt="Cerita Kami"><p>Berawal dari sebuah pertemuan di tahun 2018, di kampus yang sama, tanpa pernah menyangka bahwa pertemuan sederhana itu akan membawa kami sampai sejauh ini.</p><p>Di penghujung tahun 2019, kami memutuskan untuk melangkah bersama dan mulai berkomitmen untuk saling menemani.</p><p>Kami adalah dua pribadi dengan karakter yang cukup berbeda. Yhola yang cerewet, aktif, dan selalu menyukai keramaian, sementara Ardan lebih menyukai ketenangan. Namun, justru dari perbedaan itulah kami belajar untuk saling memahami, melengkapi, dan menikmati setiap perjalanan bersama.</p><p>Selama tujuh tahun, Ardan cukup sabar menghadapi segala tingkah kesayangannya ini. Ada banyak cerita, tawa, perbedaan, dan momen sederhana yang akhirnya menjadi bagian dari perjalanan kami.</p><p>Kini, kami berharap cerita ini tidak berhenti sampai di sini. Semoga romansa yang telah kami bangun terus membara, dipenuhi canda tawa, kasih sayang, dan kebahagiaan dalam setiap langkah yang akan kami jalani bersama.</p>`,long:true},
 date:{title:'Date & Venue',art:'DATE & VENUE UTK POP UP.png',body:`<img class="map-photo" src="gallery/venue.jpg" alt="Estusae Cafe"><p class="center"><b>22 November 2026</b></p><p><b>Akad</b> · 08:00–09:00 WIB<br><b>Resepsi</b> · 10:00–12:00 WIB</p><p><b>Estusae Cafe, Trawas, Mojokerto</b><br>Sendang, Penanggungan, Kec. Trawas, Kabupaten Mojokerto, Jawa Timur 61375</p><p><b>Dress Code</b><br>Pakaian Ternyaman, Versi Terbaikmu</p><button class="maps-image" id="mapsBtn"><img src="assets/BUKA MAPS.png" alt="Buka Maps"></button>`,long:false},
 gallery:{title:'Gallery',art:'GALLERY UTK POP UP.png',body:`<div class="gallery"><img src="gallery/C0009T01.JPG" alt="Gallery 1"><img src="gallery/C0006T01.JPG" alt="Gallery 2"><img src="gallery/C0007T01.JPG" alt="Gallery 3"><img src="gallery/C0005T01.JPG" alt="Gallery 4"></div>`,long:true},
 gift:{title:'Gift',art:'GIFT UTK POP UP.png',body:`<p>Kehadiran dan doa restumu sudah menjadi hadiah yang sangat berarti bagi kami. Jika berkenan memberikan tanda kasih, berikut rekening yang dapat digunakan:</p><div class="accounts"><div class="account"><span class="bank">BRI</span><span><span class="num">067101498677509</span><br>a/n Yholanda Regita Hariyanto</span><button class="copy-btn" data-copy="067101498677509">COPY</button></div><div class="account"><span class="bank">MANDIRI</span><span><span class="num">1400022970561</span><br>a/n Yholanda Regita Hariyanto</span><button class="copy-btn" data-copy="1400022970561">COPY</button></div><div class="account"><span class="bank">BCA</span><span><span class="num">6155469025</span><br>a/n Syahfardan Al Hilal Havi</span><button class="copy-btn" data-copy="6155469025">COPY</button></div></div><div class="address"><b>Kirim hadiah</b><br>Dsn. Ketok Ds. Tunggalpager RT.02 RW.05 Kec. Pungging Kab. Mojokerto 61384<br>(Pagar Kipas Hitam)</div>`,long:true},
 rsvp:{title:'RSVP',art:'RSVP UTK POP UP.png',body:`<div class="form"><input id="rsvpName" placeholder="Nama"><div class="choices"><button id="attYes">Hadir</button><button id="attNo">Tidak Hadir</button></div><div id="count"><input id="guestCount" type="number" min="1" max="10" placeholder="Jumlah tamu"></div><textarea id="rsvpMsg" rows="3" placeholder="Ucapan (opsional)"></textarea><button class="pill" id="rsvpSend">Kirim RSVP</button></div>`,long:true},
 chair:{title:'Pesan Kecil untukmu',body:`<p><b>Hai! 🤍</b></p><p>Terima kasih ya sudah jadi salah satu orang baik yang kami kenal.</p><p>Senang pernah dipertemukan dan berbagi cerita denganmu.</p><p>Sampai ketemu di hari bahagia kami!</p>`,long:false},
 people:{title:'Satu Pesan dari Kami',body:`<p class="center">Dengarkan pesan kecil dari kami 🤍</p><div class="vn-player"><div class="wave"></div><audio id="vnPlayer" controls src="audio/vn.mp3"></audio></div>`,long:false}
};

function openPopup(id){
  sfx();const d=popupData[id];if(!d)return;const pc=$('popupContent');
  pc.innerHTML=`<img class="popup-art ${d.art?.includes('DATE')||d.art?.includes('GALLERY')?'wide':''} ${d.art?.includes('GIFT')?'tall':''}" src="${d.art?`assets/${d.art}`:''}" ${d.art?'':'style="display:none"'} alt="">`+`<h2>${d.title}</h2>`+d.body;
  $('backdrop').classList.remove('hidden');$('backdrop').setAttribute('aria-hidden','false');
  if(id==='date')$('mapsBtn').addEventListener('click',()=>window.open('https://maps.app.goo.gl/j8p8AiPEjb7ygjZT6','_blank'));
  if(id==='gift')document.querySelectorAll('.copy-btn').forEach(btn=>btn.addEventListener('click',()=>copyNumber(btn)));
  if(id==='rsvp')wireRsvp();
  if(id==='people'){const a=$('vnPlayer');duckMusic(.08);a.addEventListener('play',()=>duckMusic(.08));a.addEventListener('pause',()=>restoreMusic());a.addEventListener('ended',()=>restoreMusic())}
  if(id==='chair'){chairJolt();chairJolt()}
}
function copyNumber(btn){const n=btn.dataset.copy;const done=()=>{btn.textContent='TERSALIN ✓';btn.classList.add('copied');setTimeout(()=>{btn.textContent='COPY';btn.classList.remove('copied')},1600)};if(navigator.clipboard?.writeText){navigator.clipboard.writeText(n).then(done).catch(()=>fallbackCopy(n,done))}else fallbackCopy(n,done)}
function fallbackCopy(n,done){const t=document.createElement('textarea');t.value=n;document.body.appendChild(t);t.select();try{document.execCommand('copy');done()}finally{t.remove()}}
function wireRsvp(){const y=$('attYes'),n=$('attNo'),c=$('count');y.onclick=()=>{y.classList.add('on');n.classList.remove('on');c.style.display='block'};n.onclick=()=>{n.classList.add('on');y.classList.remove('on');c.style.display='none'};$('rsvpSend').onclick=()=>{if(!$('rsvpName').value.trim()){alert('Silakan isi nama terlebih dahulu.');return}alert('RSVP tersimpan di demo ini. Integrasi Google Sheets dapat ditambahkan berikutnya.')}}
function closePopup(){const p=$('vnPlayer');if(p)p.pause();restoreMusic();$('backdrop').classList.add('hidden');$('backdrop').setAttribute('aria-hidden','true')}
$('close').addEventListener('click',()=>{sfx();closePopup()});$('backdrop').addEventListener('click',e=>{if(e.target===e.currentTarget)closePopup()});

/* info */
function infoMini(cls){return `<span class="info-mini ${cls}"></span>`}
$('infoBtn').addEventListener('click',()=>{sfx();const pc=$('popupContent');pc.innerHTML=`<h2>Yuk, jelajahi cerita kami!</h2><p>👋 Hai, <b>${guest}</b>!</p><p>Bingung mulai dari mana? Coba klik satu-satu objek di sekitar.</p><div class="info-list"><div class="info-row">${infoMini('mini-yh')}<div class="info-label"><b>YHOLA & ARDAN</b><span>Tentang kami</span></div></div><div class="info-row">${infoMini('mini-story')}<div class="info-label"><b>Cerita Kami</b><span>Cerita perjalanan kami</span></div></div><div class="info-row">${infoMini('mini-date')}<div class="info-label"><b>Date & Venue</b><span>Hari dan tempat perayaan</span></div></div><div class="info-row">${infoMini('mini-gallery')}<div class="info-label"><b>Gallery</b><span>Potret kecil cerita kami</span></div></div><div class="info-row">${infoMini('mini-gift')}<div class="info-label"><b>Gift</b><span>Tanda kasihmu</span></div></div><div class="info-row">${infoMini('mini-rsvp')}<div class="info-label"><b>RSVP</b><span>Konfirmasi kehadiran</span></div></div></div>`;$('backdrop').classList.remove('hidden');$('backdrop').setAttribute('aria-hidden','false')});

/* comments */
const comments=[['Rizky','Walhii happy banget! 🤍'],['Dina','Semoga lancar sampai hari H!'],['Fajar','Ikut bahagia buat kalian berdua.']];let commentIndex=0;
function showComment(i){const b=$('commentBubble');b.innerHTML=`<b>${comments[i][0]}</b>${comments[i][1]}`;b.classList.remove('hidden');$('commentNext').classList.remove('hidden');$('commentHide').classList.remove('hidden')}
function nextComment(){commentIndex=(commentIndex+1)%comments.length;showComment(commentIndex)}
$('commentNext').addEventListener('click',()=>{sfx();nextComment()});$('commentHide').addEventListener('click',()=>{$('commentBubble').classList.add('hidden');$('commentNext').classList.add('hidden');$('commentHide').classList.add('hidden')});
$('ucapanBtn').addEventListener('click',()=>{sfx();const pc=$('popupContent');pc.innerHTML=`<h2>Ucapan</h2><div class="form"><input id="ucName" placeholder="Nama"><textarea id="ucMsg" rows="4" placeholder="Tulis ucapan untuk Yhola & Ardan"></textarea><button class="pill" id="ucSend">Tampilkan Ucapan</button></div>`;$('backdrop').classList.remove('hidden');$('backdrop').setAttribute('aria-hidden','false');$('ucSend').onclick=()=>{const n=$('ucName').value.trim()||'Tamu';const m=$('ucMsg').value.trim();if(!m)return;comments.unshift([n,m]);commentIndex=0;closePopup();showComment(0)}});
