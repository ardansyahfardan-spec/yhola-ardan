const $=id=>document.getElementById(id);
const guest=new URLSearchParams(location.search).get('to')||'Tamu Undangan';
const loading=$('loading'), loadingStage=document.querySelector('.loading-stage'), start=$('start'), scene=$('scene'), sceneStage=$('sceneStage');
const m1=$('m1'),m2=$('m2'),vn=$('vn');
let lampOn=true,playing=1,progress=0;

const loadSteps=['LOADING KOSONG.png','LOADING 25%.png','LOADIING 50%.png','LOADING 80%.png','LOADING FULL.png'];
let step=0;
const loadTimer=setInterval(()=>{
  step++;
  const idx=Math.min(step,loadSteps.length-1);
  $('loadingBar').src='assets/'+loadSteps[idx];
  if(idx===loadSteps.length-1){
    clearInterval(loadTimer);
    setTimeout(()=>{loadingStage.classList.add('open');setTimeout(()=>{loading.classList.add('hidden');start.classList.remove('hidden')},1250)},420);
  }
},520);

const objects=[
 ['couple','YHOLA & ARDAN OBJEK INTERAKTIF.png','YHOLA & ARDAN glow.png','642,341,870,763'],
 ['story','LOVE STORY OBJEK INTERAKTIF.png','love story glow.png','197,755,381,981'],
 ['gallery','GALLERY OBJEK INTERAKTIF.png','GALLERY glow.png','166,326,298,391'],
 ['rsvp','RSVP UTK OBJEK INTERAKTIF.png','rsvp glow.png','704,941,1037,1138'],
 ['date','DATE & VENUE OBJEK INTERAKTIF.png','date venue glow.png','799,1217,1081,1487'],
 ['gift','GIFT OBJEK INTERAKTIF.png','gift glow.png','756,1504,1036,1887'],
 ['chair','KURSI BERGERAK.png',null,'305,1104,820,1782']
];
function canvasBox(v){const a=v.split(',').map(Number);return{x:a[0]/1081*100,y:a[1]/1920*100,w:(a[2]-a[0])/1081*100,h:(a[3]-a[1])/1920*100}}
function addSceneObjects(){
 const layer=$('objectLayers'),hs=$('hotspots');
 for(const [id,file,glow,b] of objects){
   if(glow){const g=document.createElement('img');g.className='canvas-asset glow-layer';g.src='assets/'+glow;g.alt='';g.dataset.id=id+'-glow';layer.appendChild(g)}
   const im=document.createElement('img');im.className='canvas-asset object-layer';im.src='assets/'+file;im.alt='';im.dataset.id=id;layer.appendChild(im);
   const box=canvasBox(b);const h=document.createElement('button');h.className='hot';h.dataset.id=id;h.style.left=box.x+'%';h.style.top=box.y+'%';h.style.width=box.w+'%';h.style.height=box.h+'%';
   h.addEventListener('click',()=>{h.classList.remove('bump');void h.offsetWidth;h.classList.add('bump');setTimeout(()=>act(id),160)});hs.appendChild(h);
 }
}
addSceneObjects();

$('startBtn').onclick=()=>{start.classList.add('hidden');scene.classList.remove('hidden');playMusic();runLampTutorial()};
function playMusic(){m1.volume=m2.volume=1;playing=1;m1.currentTime=0;m1.play().catch(()=>{});m1.onended=()=>{playing=2;m2.currentTime=0;m2.play().catch(()=>{})};m2.onended=()=>{playing=1;m1.currentTime=0;m1.play().catch(()=>{})}}
$('musicBtn').onclick=()=>{const a=playing===1?m1:m2;if(a.paused)a.play().catch(()=>{});else a.pause()};

function runLampTutorial(){
 const hand=$('hand');
 setTimeout(()=>{toggleLamp();setTimeout(()=>toggleLamp(),900)},650);
 setTimeout(()=>hand.classList.add('hidden'),3400);
}
function toggleLamp(){lampOn=!lampOn;$('lampImg').src=lampOn?'assets/LAMPU DEKOR UTAMA.png':'assets/LAMPU DEKOR MATI.png';$('lampGlow').classList.toggle('lamp-off',!lampOn)}

function popup(title,body,art='POP UP PENDEK SESUAI KANVAS.png',long=false,titleArt='',artClass=''){
 $('popupFrame').src='assets/'+art;
 $('popupContent').className='popup-content'+(long?' long':'');
 const ta=titleArt?`<img class="popup-title-art ${artClass}" src="assets/${titleArt}" alt="">`:'';
 $('popupContent').innerHTML=ta+'<h2>'+title+'</h2>'+body;
 $('backdrop').classList.remove('hidden');$('backdrop').setAttribute('aria-hidden','false');
}
$('close').onclick=closePopup;$('backdrop').addEventListener('click',e=>{if(e.target===e.currentTarget)closePopup()});
function closePopup(){$('backdrop').classList.add('hidden');$('backdrop').setAttribute('aria-hidden','true');vn.pause();m1.volume=m2.volume=1}
function acc(bank,num,name){return `<div class="account"><button onclick="navigator.clipboard&&navigator.clipboard.writeText('${num}')">Copy</button><b>${bank}</b><br>${num}<br>a/n ${name}</div>`}

function act(id){
 if(id==='couple')popup('Hai, '+guest,`<p>Kami ingin berbagi kabar bahagia bahwa kami akan melangsungkan pernikahan. Dengan penuh kebahagiaan, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk hadir dan turut memberikan doa restu pada acara pernikahan kami.</p><p><b>Syahfardan Al Hilal Havi</b><br>Putra dari Bapak Hadi Wijanarko & Ibu Vinie Nurwachjunie</p><p class="center"><b>&amp;</b></p><p><b>Yholanda Regita Hariyanto</b><br>Putri dari Bapak Sugeng Hariyanto & Ibu Anik Rahayu</p><button class="pill" onclick="window.open('https://instagram.com/','_blank')">Instagram</button>`,'POP UP PENDEK SESUAI KANVAS.png',false,'YHOLA & ARDAN UTK POP UP.png','medium');
 else if(id==='story')popup('Cerita Kami',`<img class="hero-photo" src="gallery/story.jpg"><p>Berawal dari sebuah pertemuan di tahun 2018, di kampus yang sama, tanpa pernah menyangka bahwa pertemuan sederhana itu akan membawa kami sampai sejauh ini.</p><p>Di penghujung tahun 2019, kami memutuskan untuk melangkah bersama dan mulai berkomitmen untuk saling menemani.</p><p>Kami adalah dua pribadi dengan karakter yang cukup berbeda. Yhola yang cerewet, aktif, dan selalu menyukai keramaian, sementara Ardan lebih menyukai ketenangan. Namun, justru dari perbedaan itulah kami belajar untuk saling memahami, melengkapi, dan menikmati setiap perjalanan bersama.</p><p>Selama tujuh tahun, Ardan cukup sabar menghadapi segala tingkah kesayangannya ini. Ada banyak cerita, tawa, perbedaan, dan momen sederhana yang akhirnya menjadi bagian dari perjalanan kami.</p><p>Kini, kami berharap cerita ini tidak berhenti sampai di sini. Semoga romansa yang telah kami bangun terus membara, dipenuhi canda tawa, kasih sayang, dan kebahagiaan dalam setiap langkah yang akan kami jalani bersama.</p>`,'POP UP PANJANG SESUAI KANVAS.png',true,'LOVE STORY UTK POP UP.png','tall');
 else if(id==='date')popup('Date & Venue',`<img class="map-photo" src="gallery/venue.jpg"><p class="center"><b>22 November 2026</b></p><p><b>Akad</b> · 08:00–09:00 WIB<br><b>Resepsi</b> · 10:00–12:00 WIB</p><p><b>Estusae Cafe, Trawas, Mojokerto</b><br>Sendang, Penanggungan, Kec. Trawas, Kabupaten Mojokerto, Jawa Timur 61375</p><p><b>Dress Code</b><br>Pakaian Ternyaman, Versi Terbaikmu</p><img class="maps-btn" src="assets/BUKA MAPS.png" alt="Google Maps" onclick="window.open('https://maps.app.goo.gl/j8p8AiPEjb7ygjZT6','_blank')">`,'POP UP PENDEK SESUAI KANVAS.png',false,'DATE & VENUE UTK POP UP.png','wide');
 else if(id==='gallery')popup('Gallery',`<div class="gallery"><img src="gallery/C0009T01.JPG"><img src="gallery/C0006T01.JPG"><img src="gallery/C0007T01.JPG"><img src="gallery/C0005T01.JPG"></div>`,'POP UP PANJANG SESUAI KANVAS.png',true,'GALLERY UTK POP UP.png','wide');
 else if(id==='gift')popup('Gift',`<p>Kehadiran dan doa restumu sudah menjadi hadiah yang sangat berarti bagi kami. Jika berkenan memberikan tanda kasih, berikut rekening yang dapat digunakan:</p><div class="accounts">${acc('BRI','067101498677509','Yholanda Regita Hariyanto')}${acc('MANDIRI','1400022970561','Yholanda Regita Hariyanto')}${acc('BCA','6155469025','Syahfardan Al Hilal Havi')}</div><p><b>Kirim hadiah</b><br>Dsn. Ketok Ds. Tunggalpager RT.02 RW.05 Kec. Pungging Kab. Mojokerto 61384<br>(Pagar Kipas Hitam)</p>`,'POP UP PANJANG SESUAI KANVAS.png',true,'GIFT UTK POP UP.png','tall');
 else if(id==='rsvp')popup('RSVP',`<div class="form"><input id="rn" placeholder="Nama"><div class="choices"><button id="ry" onclick="choice(true)">Hadir</button><button id="rn2" onclick="choice(false)">Tidak Hadir</button></div><div id="count"><input type="number" min="1" max="10" placeholder="Jumlah tamu"></div><textarea rows="3" placeholder="Ucapan (opsional)"></textarea><button class="pill" onclick="alert('RSVP demo tersimpan.')">Kirim RSVP</button></div>`,'POP UP PANJANG SESUAI KANVAS.png',true,'RSVP UTK POP UP.png','wide');
 else if(id==='chair'){
   const chair=document.querySelector('[data-id="chair"]');chair.animate([{transform:'translateY(0)'},{transform:'translateY(7px)'},{transform:'translateY(0)'}],{duration:420,iterations:2});
   popup('Pesan Kecil untukmu',`<p><b>Hai! 🤍</b></p><p>Terima kasih ya sudah jadi salah satu orang baik yang kami kenal.</p><p>Senang pernah dipertemukan dan berbagi cerita denganmu.</p><p>Sampai ketemu di hari bahagia kami!</p>`,'POP UP PENDEK SESUAI KANVAS.png',false,'','');
 }
}
window.choice=v=>{$('ry').classList.toggle('on',v);$('rn2').classList.toggle('on',!v);$('count').style.display=v?'block':'none'};
$('infoBtn').onclick=()=>popup('Cara Menjelajah',`<p>👋 Hai, <b>${guest}</b>!</p><p>Bingung mulai dari mana? Di halaman ini ada beberapa bagian yang bisa kamu klik untuk melihat cerita kami. Coba eksplor satu-satu. Siapa tahu ada cerita kecil yang kamu temukan 🤍</p><p><b>YHOLA &amp; ARDAN</b> — tentang kami</p><p><b>Cerita Kami</b> — cerita kita</p><p><b>Date &amp; Venue</b> — hari dan tempat untuk merayakan cinta kami</p><p><b>Gallery</b> — potret kecil cerita kami 📷</p><p><b>Gift</b> — tanda kasihmu</p><p><b>RSVP</b> — sampai jumpa di hari bahagia kami 🤍</p>`,'POP UP PANJANG SESUAI KANVAS.png',true);
