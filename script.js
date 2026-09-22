(() => {
  const data = window.INVITATION;
  const layer = document.getElementById('modalLayer');
  const content = document.getElementById('modalContent');
  const music = document.getElementById('bgMusic');
  const musicToggle = document.getElementById('musicToggle');
  music.src = data.music.file || 'assets/music.mp3';
  const musicIcon = document.getElementById('musicIcon');
  let selectedAttendance = '';

  const esc = (s='') => String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const params = new URLSearchParams(location.search);
  const guest = params.get('to') || params.get('guest') || '';

  function openModal(templateId) {
    const template = document.getElementById(templateId.replace('Modal','Template'));
    if (!template) return;
    content.innerHTML = template.innerHTML;
    fillContent(templateId);
    layer.classList.add('open');
    layer.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
  }
  function closeModal(){layer.classList.remove('open');layer.setAttribute('aria-hidden','true');document.body.style.overflow='';}

  function setText(key, value){const el=content.querySelector(`[data-copy="${key}"]`);if(el)el.textContent=value||'';}
  function fillContent(id){
    if(id==='aboutModal'){
      setText('aboutStory',data.about.story);
      setText('groomParents',data.groom.parents); setText('brideParents',data.bride.parents);
      const items=[['Pertama bertemu',data.about.firstMeet],['Mulai bersama',data.about.relationship],['Lamaran',data.about.proposal],['Hari pernikahan',data.about.wedding]].filter(x=>x[1]);
      const tl=content.querySelector('#aboutTimeline');
      tl.innerHTML=items.length?items.map(([a,b])=>`<div><strong>${esc(a)}</strong><span>${esc(b)}</span></div>`).join(''):'';
    }
    if(id==='dateModal'){
      setText('ceremony',data.event.ceremony);setText('reception',data.event.reception);setText('venue',data.event.venue);setText('address',data.event.address);
      const m=content.querySelector('#mapsLink');m.href=data.event.maps;
    }
    if(id==='giftModal'){
      setText('bank',data.gift.bank);setText('recipient',data.gift.recipient);content.querySelector('#accountNumber').textContent=data.gift.account;
      content.querySelector('#copyAccount').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(data.gift.account);toast('Nomor rekening berhasil disalin');}catch{toast('Silakan salin nomor rekening secara manual');}});
    }
    if(id==='galleryModal'){
      const grid=content.querySelector('#galleryGrid');const empty=content.querySelector('#galleryEmpty');
      if(data.gallery.photos.length){empty.style.display='none';grid.innerHTML=data.gallery.photos.map((src,i)=>`<img src="${esc(src)}" alt="Foto ${i+1}" loading="lazy">`).join('');} else {grid.innerHTML='';}
    }
    if(id==='rsvpModal'){
      const link=content.querySelector('#rsvpLink');
      content.querySelectorAll('[data-attend]').forEach(btn=>btn.addEventListener('click',()=>{selectedAttendance=btn.dataset.attend;content.querySelectorAll('[data-attend]').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');updateRsvp();}));
      content.querySelector('#guestName').value=guest;content.querySelector('#guestName').addEventListener('input',updateRsvp);updateRsvp();
      function updateRsvp(){const name=content.querySelector('#guestName').value.trim()||guest||'tamu undangan';const status=selectedAttendance?`\nKonfirmasi: ${selectedAttendance}`:'';const msg=`Halo ${esc(data.rsvp.contactName)}, saya ${name} ingin memberikan konfirmasi untuk acara pernikahan Yhola & Ardan pada ${data.event.date}.${status}`;link.href=`https://wa.me/${data.rsvp.whatsapp}?text=${encodeURIComponent(msg)}`;}
    }
    if(id==='infoModal'){
      const greeting=content.querySelector('#personalGreeting');greeting.innerHTML=guest?`Kepada Yth.<br><strong>${esc(guest)}</strong>`:`Kepada Yth. Bapak/Ibu/Saudara/i`;
      setText('intro',data.copy.intro);setText('verse',data.copy.verse);setText('verseRef',data.copy.verseRef);setText('closing',data.copy.closing);setText('inviter',data.copy.inviter);
    }
  }

  document.addEventListener('click',e=>{const trigger=e.target.closest('[data-modal]');if(trigger){e.preventDefault();openModal(trigger.dataset.modal);}});
  document.getElementById('closeModal').addEventListener('click',closeModal);
  layer.addEventListener('click',e=>{if(e.target===layer)closeModal();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});

  let playing=false;
  function updateMusicIcon(){musicIcon.src=playing?'assets/music.png':'assets/mute.png';musicIcon.alt=playing?'Musik aktif':'Musik mati';musicToggle.setAttribute('aria-label',playing?'Matikan musik':'Nyalakan musik');}
  async function startMusic(){if(!data.music.enabled)return;try{await music.play();playing=true;updateMusicIcon();}catch{/* Browser autoplay policy may block sound until interaction. */}}
  musicToggle.addEventListener('click',async()=>{if(music.paused){await startMusic();}else{music.pause();playing=false;updateMusicIcon();}});
  ['pointerdown','touchstart','keydown'].forEach(evt=>window.addEventListener(evt,()=>{if(music.paused&&!playing)startMusic();},{once:true,passive:true}));
  updateMusicIcon();
  window.addEventListener('load',()=>{setTimeout(startMusic,250);});

  function toast(message){const t=document.createElement('div');t.className='toast';t.textContent=message;document.body.appendChild(t);setTimeout(()=>t.remove(),2200)}
})();
