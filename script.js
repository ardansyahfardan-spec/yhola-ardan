const $=id=>document.getElementById(id);
const guestRaw=new URLSearchParams(location.search).get('to')||'Tamu Undangan';
const guest=decodeURIComponent(guestRaw.replace(/\+/g,' ')).trim()||'Tamu Undangan';
$('startGuest').textContent=guest;
let audioCtx=null,musicOn=true,currentTrack=1,lampOn=true,started=false,commentIndex=0,commentTimer=null;
function unlockAudio(){if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)(); if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});}
const sfxAudio={
  chair:document.getElementById('sfxChair'),
  lamp:document.getElementById('sfxLamp'),
  object:document.getElementById('sfxObject'),
  start:document.getElementById('sfxStart'),
  popup:document.getElementById('sfxPopup')
};
function sfx(type='object'){unlockAudio();const a=sfxAudio[type];if(!a)return;try{a.currentTime=0;a.play().catch(()=>{})}catch(e){}}
window.addEventListener('pointerdown',unlockAudio,{once:true,passive:true});

/* Ambient butterflies + slow natural roaming fireflies */
function initAmbient(){
  document.querySelectorAll('.ambient-layer').forEach((layer,idx)=>{
    if(layer.dataset.ready)return;
    layer.dataset.ready='1';

    const roam=(el,points,duration,delay)=>{
      el.animate(points.map(p=>({left:p[0]+'%',top:p[1]+'%',transform:p[2]||'translate3d(0,0,0)'})),{
        duration,delay,easing:'ease-in-out',iterations:Infinity,direction:'alternate'
      });
    };

    // Exactly 3 fireflies: small, visible, and very slow.
    const fireflyPaths=[
      [[12,72],[22,55],[39,63],[53,42],[70,55],[84,38],[68,21],[45,31],[26,18]],
      [[78,78],[67,61],[52,70],[35,51],[20,62],[15,39],[34,25],[58,18],[81,31]],
      [[47,84],[58,70],[73,76],[87,61],[76,46],[61,54],[48,39],[31,48],[18,34]]
    ];
    fireflyPaths.forEach((path,i)=>{
      const f=document.createElement('span');
      f.className='firefly';
      layer.appendChild(f);
      const points=path.map(([x,y],n)=>[x,y,`scale(${n%3===0?.78:1})`]);
      roam(f,points,56000+i*9000,-i*9000-idx*2500);
    });

    // Exactly 2 butterflies: modest size, very slow, exploring the full screen.
    const butterflyPaths=[
      [[5,78],[16,63],[31,70],[48,52],[69,64],[88,48],[77,27],[56,18],[35,31],[17,17]],
      [[90,76],[79,60],[63,69],[45,56],[26,65],[10,47],[22,29],[43,20],[66,30],[82,14]]
    ];
    butterflyPaths.forEach((path,i)=>{
      const b=document.createElement('span');
      b.className='butterfly';
      b.textContent='🦋';
      layer.appendChild(b);
      const points=path.map(([x,y],n)=>[x,y,`rotate(${n%2?-6:6}deg) scale(${n%3===0?.9:1})`]);
      roam(b,points,72000+i*11000,-i*17000-idx*4000);
    });
  });
}
initAmbient();

/* loading */
const loadSteps=[0,25,50,80,100];let li=0;$('loadingProgress').style.width='0%';$('loadingLabel').textContent='LOADING 0%';
const lt=setInterval(()=>{li++;$('loadingProgress').style.width=loadSteps[li]+'%';$('loadingLabel').textContent='LOADING '+loadSteps[li]+'%';if(li===4){clearInterval(lt);setTimeout(()=>{const ls=$('loadingStage');ls.classList.add('loading-stage-open');setTimeout(()=>{$('loading').classList.add('hidden');$('start').classList.remove('hidden')},1050)},250)}},650);
$('startBtn').onclick=()=>{unlockAudio();sfx('start');$('start').classList.add('hidden');$('tutorial').classList.remove('hidden')};
$('continueBtn').onclick=()=>{unlockAudio();sfx('start');$('tutorial').classList.add('hidden');$('scene').classList.remove('hidden');startExperience()};
/* music */
const m1=$('m1'),m2=$('m2');
function updateMusicIcon(){$('musicIcon').src=musicOn?'assets/MUSIC.png':'assets/MUTE.png'}
function startMusic(){musicOn=true;currentTrack=2;m1.volume=.78;m2.volume=.78;m1.pause();m2.pause();m1.currentTime=0;m2.currentTime=0;m2.onended=()=>{if(musicOn){currentTrack=1;m1.currentTime=0;m1.play().catch(()=>{});}};m1.onended=()=>{if(musicOn){currentTrack=2;m2.currentTime=0;m2.play().catch(()=>{});}};m2.play().catch(()=>{});updateMusicIcon()}
$('musicBtn').onclick=()=>{unlockAudio();const a=currentTrack===1?m1:m2;if(musicOn){a.pause();musicOn=false}else{musicOn=true;a.play().catch(()=>{});}updateMusicIcon()};
let musicWasPlaying=false;function duckMusic(){musicWasPlaying=musicOn && (!m1.paused || !m2.paused);m1.pause();m2.pause()}function restoreMusic(){if(musicOn && musicWasPlaying){const a=currentTrack===1?m1:m2;a.play().catch(()=>{})}else{m1.pause();m2.pause()};m1.volume=musicOn?.78:0;m2.volume=musicOn?.78:0}
/* lamp controls all interactive glow */
function toggleLamp(){lampOn=!lampOn;$('lampImg').src=lampOn?'assets/LAMPU DEKOR UTAMA.png':'assets/LAMPU DEKOR MATI.png';$('lampGlow').classList.toggle('lamp-off',!lampOn);$('objectLayers').classList.toggle('glow-off',!lampOn);sfx('lamp')}
$('lampHit').onclick=toggleLamp;$('lampHit').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleLamp()}};
/* objects: people BELOW love story */
const objects=[
 ['couple','YHOLA & ARDAN OBJEK INTERAKTIF.png','YHOLA & ARDAN glow.png',[642,341,870,763]],
 ['people','KARAKTER ORANG OBJEK INTERAKTIF.png','KARAKTER ORANG glow.png',[354,520,673,807]],
 ['story','LOVE STORY OBJEK INTERAKTIF.png','love story glow.png',[185,740,395,990]],
 ['gallery','GALLERY OBJEK INTERAKTIF.png','GALLERY glow.png',[155,310,315,405]],
 ['rsvp','RSVP UTK OBJEK INTERAKTIF.png','rsvp glow.png',[700,930,1045,1150]],
 ['date','DATE & VENUE OBJEK INTERAKTIF.png','date venue glow.png',[795,1205,1080,1495]],
 ['gift','GIFT OBJEK INTERAKTIF.png','gift glow.png',[750,1490,1045,1890]],
 ['chair','KURSI BERGERAK.png',null,[300,1100,825,1785]]
];
const pct=(v,total)=>v/total*100;
function addLayer(id,file,glow){if(glow){const g=document.createElement('img');g.className='scene-layer scene-glow';g.src='assets/'+glow;g.dataset.id='glow-'+id;g.style.setProperty('--dur',(5.1+(id.length%3)*.55)+'s');g.style.setProperty('--delay',((id.length%4)*-.6)+'s');$('objectLayers').appendChild(g)}const im=document.createElement('img');im.className='scene-layer scene-object';im.src='assets/'+file;im.dataset.id=id;im.style.setProperty('--dur',(4.6+(id.length%4)*.65)+'s');im.style.setProperty('--delay',((id.length%5)*-.7)+'s');$('objectLayers').appendChild(im)}
function addHot(id,rect){const [x1,y1,x2,y2]=rect,h=document.createElement('button');h.className='hot';h.setAttribute('aria-label',id);h.style.left=pct(x1,1080)+'%';h.style.top=pct(y1,1920)+'%';h.style.width=pct(x2-x1,1080)+'%';h.style.height=pct(y2-y1,1920)+'%';h.onclick=()=>{unlockAudio();if(id==='chair'){sfx('chair')}else{sfx('object')}h.blur();setTimeout(()=>openPopup(id),170)};h.onfocus=()=>h.blur();$('hotspots').appendChild(h)}
objects.forEach(([id,file,glow,rect])=>{addLayer(id,file,glow);addHot(id,rect)});
/* chair */
function chairJolt(){const chair=document.querySelector('[data-id="chair"]');if(!chair)return;chair.animate([{transform:'translateY(0)'},{transform:'translateY(-6px) scale(1.008)'},{transform:'translateY(1px) scale(.997)'},{transform:'translateY(0)'}],{duration:520,easing:'cubic-bezier(.2,.8,.2,1)'})}
function scheduleChair(){setTimeout(()=>{if(!document.hidden){chairJolt();sfx('chair')}scheduleChair()},8000+Math.random()*5000)}
/* popup */
const popupData={
 couple:{art:'YHOLA & ARDAN UTK POP UP.png',body:`<p>Kami ingin berbagi kabar bahagia bahwa kami akan melangsungkan pernikahan. Dengan penuh kebahagiaan, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir dan turut memberikan doa restu pada acara pernikahan kami.</p><div class="person-block"><b>Syahfardan Al Hilal Havi</b><span>Putra dari</span><strong>Bapak Hadi Wijanarko &amp; Ibu Vinie Nurwachjunie</strong></div><div class="couple-separator">&amp;</div><div class="person-block"><b>Yholanda Regita Hariyanto</b><span>Putri dari</span><strong>Bapak Sugeng Hariyanto &amp; Ibu Anik Rahayu</strong></div><div class="instagram-row"><a class="ig-link" href="https://www.instagram.com/yholarh/" target="_blank" rel="noopener"><span>Yhola</span><span class="ig-icon">◎</span></a><a class="ig-link" href="https://www.instagram.com/artdan.al/" target="_blank" rel="noopener"><span>Ardan</span><span class="ig-icon">◎</span></a></div>`},
 people:{body:`<p class="center"><b>Satu Pesan dari Kami</b></p><p class="center">Dengarkan pesan kecil dari kami 🤍</p><div class="vn-player"><div class="wave"></div><audio id="vnPlayer" controls src="audio/vn.mp3"></audio></div>`},
 story:{art:'LOVE STORY UTK POP UP.png',body:`<img class="hero-photo" src="gallery/story.jpg" alt="Cerita Kami"><p>Berawal dari sebuah pertemuan di tahun 2018, di kampus yang sama, tanpa pernah menyangka bahwa pertemuan sederhana itu akan membawa kami sampai sejauh ini.</p><p>Di penghujung tahun 2019, kami memutuskan untuk melangkah bersama dan mulai berkomitmen untuk saling menemani.</p><p>Kami adalah dua pribadi dengan karakter yang cukup berbeda. Yhola yang cerewet, aktif, dan selalu menyukai keramaian, sementara Ardan lebih menyukai ketenangan. Namun, justru dari perbedaan itulah kami belajar untuk saling memahami, melengkapi, dan menikmati setiap perjalanan bersama.</p><p>Selama tujuh tahun, Ardan cukup sabar menghadapi segala tingkah kesayangannya ini. Ada banyak cerita, tawa, perbedaan, dan momen sederhana yang akhirnya menjadi bagian dari perjalanan kami.</p><p>Kini, kami berharap cerita ini tidak berhenti sampai di sini. Semoga romansa yang telah kami bangun terus membara, dipenuhi canda tawa, kasih sayang, dan kebahagiaan dalam setiap langkah yang akan kami jalani bersama.</p>`},
 date:{art:'DATE & VENUE UTK POP UP.png',body:`<div class="date-venue-body"><img class="map-photo" src="gallery/venue.jpg" alt="Estusae Cafe"><div class="date-venue-date">22 November 2026</div><div class="date-venue-divider">✦</div><div class="date-venue-times"><div><span>Akad</span><b>08:00–09:00 WIB</b></div><div><span>Resepsi</span><b>10:00–12:00 WIB</b></div></div><div class="date-venue-divider">✦</div><div class="date-venue-venue"><strong>Estusae Cafe, Trawas, Mojokerto</strong><span>Sendang, Penanggungan, Kec. Trawas,<br>Kabupaten Mojokerto, Jawa Timur 61375</span></div><div class="date-venue-dress"><strong>Dress Code</strong><span>“Pakaian Ternyaman, Versi Terbaikmu”</span></div><button class="maps-image" id="mapsBtn"><img src="assets/BUKA MAPS.png" alt="Buka Maps"></button></div>`},
 gallery:{art:'GALLERY UTK POP UP.png',body:`<div class="gallery"><img src="gallery/C0009T01.JPG" alt="Gallery 1"><img src="gallery/C0006T01.JPG" alt="Gallery 2"><img src="gallery/C0007T01.JPG" alt="Gallery 3"><img src="gallery/C0005T01.JPG" alt="Gallery 4"></div>`},
 gift:{art:'GIFT UTK POP UP.png',body:`<p>Kehadiran dan doa restumu sudah menjadi hadiah yang sangat berarti bagi kami. Jika berkenan memberikan tanda kasih, berikut rekening yang dapat digunakan:</p><div class="accounts"><div class="account"><span class="bank">BRI</span><span><span class="num">067101498677509</span><br>a/n Yholanda Regita Hariyanto</span><button class="copy-btn" data-copy="067101498677509">COPY</button></div><div class="account"><span class="bank">MANDIRI</span><span><span class="num">1400022970561</span><br>a/n Yholanda Regita Hariyanto</span><button class="copy-btn" data-copy="1400022970561">COPY</button></div><div class="account"><span class="bank">BCA</span><span><span class="num">6155469025</span><br>a/n Syahfardan Al Hilal Havi</span><button class="copy-btn" data-copy="6155469025">COPY</button></div></div><div class="address"><b>Kirim hadiah</b><br>Dsn. Ketok Ds. Tunggalpager RT.02 RW.05 Kec. Pungging Kab. Mojokerto 61384<br>(Pagar Kipas Hitam)</div>`},
 rsvp:{art:'RSVP UTK POP UP.png',body:`<div class="form"><input id="rsvpName" placeholder="Nama"><div class="choices"><button id="attYes">Hadir</button><button id="attNo">Tidak Hadir</button></div><div id="count"><input id="guestCount" type="number" min="1" max="10" placeholder="Jumlah tamu"></div><textarea id="rsvpMsg" rows="3" placeholder="Ucapan (opsional)"></textarea><button class="pill" id="rsvpSend">Kirim RSVP</button></div>`},
 chair:{body:`<p><b>Hai! 🤍</b></p><p>Terima kasih ya sudah jadi salah satu orang baik yang kami kenal.</p><p>Senang pernah dipertemukan dan berbagi cerita denganmu.</p><p>Sampai ketemu di hari bahagia kami!</p>`}
};
function openPopup(id){const d=popupData[id];if(!d)return;const pc=$('popupContent');pc.className='popup-content '+(id==='couple'?'couple-popup':'');pc.innerHTML=(d.art?`<img class="popup-art" src="assets/${d.art}" alt="">`:'')+d.body;$('backdrop').classList.remove('hidden');$('backdrop').setAttribute('aria-hidden','false');if(id==='date')$('mapsBtn').onclick=()=>window.open('https://maps.app.goo.gl/j8p8AiPEjb7ygjZT6','_blank');if(id==='gift')document.querySelectorAll('.copy-btn').forEach(b=>b.onclick=()=>copyNumber(b));if(id==='rsvp')wireRsvp();if(id==='people'){const a=$('vnPlayer');duckMusic();a.onplay=duckMusic;a.onpause=restoreMusic;a.onended=restoreMusic}if(id==='chair'){chairJolt();sfx('chair');setTimeout(chairJolt,300)}}
function copyNumber(btn){const n=btn.dataset.copy,done=()=>{btn.textContent='✓';setTimeout(()=>btn.textContent='COPY',1500)};if(navigator.clipboard?.writeText)navigator.clipboard.writeText(n).then(done).catch(()=>fallbackCopy(n,done));else fallbackCopy(n,done)}function fallbackCopy(n,done){const t=document.createElement('textarea');t.value=n;document.body.appendChild(t);t.select();try{document.execCommand('copy');done()}finally{t.remove()}}
function wireRsvp(){const y=$('attYes'),n=$('attNo'),c=$('count');y.onclick=()=>{y.classList.add('on');n.classList.remove('on');c.style.display='block'};n.onclick=()=>{n.classList.add('on');y.classList.remove('on');c.style.display='none'};$('rsvpSend').onclick=()=>{const name=$('rsvpName').value.trim();const msg=$('rsvpMsg').value.trim();if(!name){alert('Silakan isi nama terlebih dahulu.');return}if(!y.classList.contains('on')&&!n.classList.contains('on')){alert('Silakan pilih kehadiran terlebih dahulu.');return}const attendance=y.classList.contains('on')?'Hadir':'Tidak Hadir';const count=attendance==='Hadir'?Math.max(1,parseInt($('guestCount').value||'1',10)):0; if(msg){comments.unshift([name,msg]);commentIndex=0;showComment(0)};alert('RSVP tersimpan. Terima kasih!');closePopup()}}
function closePopup(){const a=$('vnPlayer');if(a){a.pause();restoreMusic()}$('backdrop').classList.add('hidden');$('backdrop').setAttribute('aria-hidden','true')}$('close').onclick=()=>{sfx('popup');closePopup()};$('backdrop').onclick=e=>{if(e.target===e.currentTarget)closePopup()};$('popupContent').addEventListener('click',e=>{const b=e.target.closest('button');if(b)sfx('popup')});
/* info */
const mini={yh:'YHOLA & ARDAN UTK POP UP.png',story:'LOVE STORY UTK POP UP.png',date:'DATE & VENUE UTK POP UP.png',gallery:'GALLERY UTK POP UP.png',gift:'GIFT UTK POP UP.png',rsvp:'RSVP UTK POP UP.png'};function infoMini(file){return `<span class="info-mini"><img src="assets/${file}" alt=""></span>`}
$('infoBtn').onclick=()=>{sfx('popup');$('popupContent').className='popup-content';$('popupContent').innerHTML=`<h2>Yuk, jelajahi cerita kami!</h2><p>👋 Hai, <b>${guest}</b>!</p><p>Bingung mulai dari mana? Coba klik satu-satu objek di sekitar.</p><div class="info-list"><div class="info-row">${infoMini(mini.yh)}<div class="info-label"><b>YHOLA & ARDAN</b><span>Tentang kami</span></div></div><div class="info-row">${infoMini(mini.story)}<div class="info-label"><b>Cerita Kami</b><span>Cerita perjalanan kami</span></div></div><div class="info-row">${infoMini(mini.date)}<div class="info-label"><b>Date & Venue</b><span>Hari dan tempat perayaan</span></div></div><div class="info-row">${infoMini(mini.gallery)}<div class="info-label"><b>Gallery</b><span>Potret kecil cerita kami</span></div></div><div class="info-row">${infoMini(mini.gift)}<div class="info-label"><b>Gift</b><span>Tanda kasihmu</span></div></div><div class="info-row">${infoMini(mini.rsvp)}<div class="info-label"><b>RSVP</b><span>Konfirmasi kehadiran</span></div></div></div><div class="lamp-tip-info">💡 Jika ingin mematikan glow objek interaktif, coba matikan lampunya.</div>`;$('backdrop').classList.remove('hidden');$('backdrop').setAttribute('aria-hidden','false')};
/* comments */
const comments=[['Rizky','Walhii happy banget! 🤍'],['Dina','Semoga lancar sampai hari H!'],['Fajar','Ikut bahagia buat kalian berdua.']];
function showComment(i){const b=$('commentBubble');b.innerHTML=`<b>${comments[i][0]}</b>${comments[i][1]}`;b.classList.remove('hidden')}
function hideComment(){ $('commentBubble').classList.add('hidden') }
function nextComment(){commentIndex=(commentIndex+1)%comments.length;showComment(commentIndex)}
$('commentNext').onclick=()=>{sfx('object');nextComment()};
$('ucapanBtn').onclick=()=>{sfx('object');if($('commentBubble').classList.contains('hidden'))showComment(commentIndex);else hideComment()};
function openUcapanForm(){sfx('object');$('popupContent').innerHTML=`<p class="center"><b>Tulis Ucapan</b></p><div class="form"><input id="ucName" placeholder="Nama"><textarea id="ucMsg" rows="4" placeholder="Tulis ucapan untuk Yhola & Ardan"></textarea><button class="pill" id="ucSend">Kirim Ucapan</button></div>`;$('backdrop').classList.remove('hidden');$('backdrop').setAttribute('aria-hidden','false');$('ucSend').onclick=()=>{const n=$('ucName').value.trim()||'Tamu';const m=$('ucMsg').value.trim();if(!m)return;comments.unshift([n,m]);commentIndex=0;closePopup();showComment(0)}}
$('plusBtn').onclick=openUcapanForm;
function startExperience(){if(started)return;started=true;startMusic();scheduleChair();showComment(0);commentTimer=setInterval(()=>{if(!$('commentBubble').classList.contains('hidden'))nextComment()},7000)}
