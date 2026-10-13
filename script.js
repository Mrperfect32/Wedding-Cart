'use strict';

// === EDIT YOUR WEDDING SETTINGS HERE ===
const WEDDING = {
  date: '2027-06-12T16:00:00' // Demo date/time in visitor's local timezone
};

const openingScreen = document.getElementById('openingScreen');
const openButton = document.getElementById('openButton');
const weddingSite = document.getElementById('weddingSite');
const butterflyField = document.getElementById('butterflyField');
const sparkleField = document.getElementById('sparkleField');

function releaseButterflies(count = 20) {
  for (let i = 0; i < count; i++) {
    const butterfly = document.createElement('div');
    butterfly.className = 'butterfly';
    const angle = ((Math.PI * 2) * i / count) + (Math.random() - .5) * .6;
    const distance = 115 + Math.random() * 250;
    butterfly.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
    butterfly.style.setProperty('--ty', `${Math.sin(angle) * distance - 80}px`);
    butterfly.style.setProperty('--rot', `${(Math.random() - .5) * 95}deg`);
    butterfly.style.animationDelay = `${Math.random() * .85}s`;
    butterfly.innerHTML = '<span class="wing left"></span><span class="wing right"></span><span class="body"></span>';
    butterflyField.appendChild(butterfly);
    butterfly.addEventListener('animationend', () => butterfly.remove(), { once: true });
  }
}
function releaseSparkles(count = 46) {
  for (let i = 0; i < count; i++) {
    const spark = document.createElement('span');
    spark.className = 'spark';
    spark.style.setProperty('--tx', `${(Math.random() - .5) * 550}px`);
    spark.style.setProperty('--ty', `${(Math.random() - .5) * 460}px`);
    spark.style.animationDelay = `${Math.random() * .8}s`;
    sparkleField.appendChild(spark);
    spark.addEventListener('animationend', () => spark.remove(), { once: true });
  }
}

openButton.addEventListener('click', () => {
  if (openingScreen.classList.contains('opening')) return;
  openButton.disabled = true;
  openingScreen.classList.add('opening');
  releaseButterflies();
  releaseSparkles();
  // Let both hinged envelope doors fully open before revealing the webpage.
  setTimeout(() => {
    document.body.classList.remove('locked');
    weddingSite.classList.add('visible');
    weddingSite.setAttribute('aria-hidden', 'false');
    openingScreen.classList.add('dismissed');
  }, 3300);
});

function updateCountdown() {
  const remainder = Math.max(0, new Date(WEDDING.date).getTime() - Date.now());
  const totalSeconds = Math.floor(remainder / 1000);
  const parts = {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor(totalSeconds % 86400 / 3600),
    minutes: Math.floor(totalSeconds % 3600 / 60),
    seconds: totalSeconds % 60
  };
  for (const [name, value] of Object.entries(parts)) {
    document.getElementById(name).textContent = String(value).padStart(2, '0');
  }
}
updateCountdown();
setInterval(updateCountdown, 1000);

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  }
}, { threshold: 0.13 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Gallery with keyboard-accessible lightbox
const galleryButtons = [...document.querySelectorAll('.gallery-photo')];
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
let currentPhoto = 0;
let lastFocused = null;
function showPhoto(index) {
  currentPhoto = (index + galleryButtons.length) % galleryButtons.length;
  lightboxImage.src = galleryButtons[currentPhoto].dataset.full;
  lightboxImage.alt = galleryButtons[currentPhoto].querySelector('img').alt;
}
function openPhoto(index) {
  lastFocused = document.activeElement;
  showPhoto(index);
  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
  document.getElementById('closeLightbox').focus();
}
function closePhoto() {
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden','true');
  lightboxImage.removeAttribute('src');
  document.body.style.overflow = '';
  lastFocused?.focus();
}
galleryButtons.forEach((button,i)=>button.addEventListener('click',()=>openPhoto(i)));
document.getElementById('closeLightbox').addEventListener('click',closePhoto);
document.getElementById('prevPhoto').addEventListener('click',()=>showPhoto(currentPhoto-1));
document.getElementById('nextPhoto').addEventListener('click',()=>showPhoto(currentPhoto+1));
lightbox.addEventListener('click',e=>{if(e.target===lightbox) closePhoto()});

// Film modal — insert your actual video at assets/wedding-film.mp4
const videoModal = document.getElementById('videoModal');
const weddingVideo = document.getElementById('weddingVideo');
const videoNotice = document.getElementById('videoNotice');
document.getElementById('playFilm').addEventListener('click',()=>{
  lastFocused = document.activeElement;
  videoModal.classList.add('active');
  videoModal.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  document.getElementById('closeVideo').focus();
  weddingVideo.play().then(()=>videoNotice.hidden=true).catch(()=>videoNotice.hidden=false);
});
function closeFilm(){
  weddingVideo.pause();
  videoModal.classList.remove('active');
  videoModal.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
  lastFocused?.focus();
}
document.getElementById('closeVideo').addEventListener('click',closeFilm);
videoModal.addEventListener('click',e=>{if(e.target===videoModal)closeFilm()});
weddingVideo.addEventListener('error',()=>{videoNotice.hidden=false});
weddingVideo.addEventListener('playing',()=>{videoNotice.hidden=true});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){
    if(lightbox.classList.contains('active'))closePhoto();
    if(videoModal.classList.contains('active'))closeFilm();
  }
  if(lightbox.classList.contains('active')&&event.key==='ArrowRight')showPhoto(currentPhoto+1);
  if(lightbox.classList.contains('active')&&event.key==='ArrowLeft')showPhoto(currentPhoto-1);
});
