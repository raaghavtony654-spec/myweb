// ── CURSOR ──
const cur = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.transform = `translate(${mx - 6}px, ${my - 6}px)`;
  
  // Update spotlight position
  document.documentElement.style.setProperty('--mouse-x', `${mx}px`);
  document.documentElement.style.setProperty('--mouse-y', `${my}px`);
});

function animateRing() {
  rx += (mx - rx - 20) * 0.15;
  ry += (my - ry - 20) * 0.15;
  ring.style.transform = `translate(${rx}px, ${ry}px)`;
  requestAnimationFrame(animateRing);
}
animateRing();

document.querySelectorAll('a, button, .project-card, .skill-card, .about-card, .service-item').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});

// ── SCROLL REVEAL ──
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
revealEls.forEach(el => observer.observe(el));

// ── 3D TILT ──
document.querySelectorAll('.tilt').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    // Combine the vertical lift (var(--lift)) with the 3D rotation
    card.style.transform = `translateY(var(--lift, 0px)) perspective(1000px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(20px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = `translateY(var(--lift, 0px)) perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0px)`;
    card.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
  });
  card.addEventListener('mouseenter', () => { card.style.transition = 'none'; });
});

// ── NAV ACTIVE + SHRINK ──
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  if (window.scrollY > 80) {
    nav.style.padding = '1rem 3rem';
  } else {
    nav.style.padding = '1.5rem 3rem';
  }

  const sections = document.querySelectorAll('section[id]');
  sections.forEach(sec => {
    const top = sec.offsetTop - 100;
    const bottom = top + sec.offsetHeight;
    if (window.scrollY >= top && window.scrollY < bottom) {
      document.querySelectorAll('.nav-links a').forEach(a => {
        a.style.color = '';
        if (a.getAttribute('href') === '#' + sec.id) a.style.color = 'var(--accent)';
      });
    }
  });
});

// ── MAGNETIC BUTTONS ──
document.querySelectorAll('.btn-primary, .btn-ghost').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.25;
    const y = (e.clientY - r.top - r.height / 2) * 0.25;
    btn.style.transform = `translate(${x}px, ${y}px) translateY(-2px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

// ── PAGE LOAD FLASH ──
document.body.style.opacity = '0';
window.addEventListener('load', () => {
  document.body.style.transition = 'opacity 0.5s ease';
  document.body.style.opacity = '1';
});

// ── NAVIGATION & PORTAL TRIGGER ──
document.querySelectorAll('.nav-links a, .btn-primary').forEach(link => {
  link.addEventListener('click', (e) => {
    const viewportHeight = window.innerHeight;
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;

    // Only intercept if we are still on the hero/portal phase
    if (window.scrollY < viewportHeight - 10) {
      e.preventDefault();
      
      // 1. Smooth scroll to trigger the portal reveal
      window.scrollTo({
        top: viewportHeight + 2,
        behavior: 'smooth'
      });

      // 2. After portal zoom completes, navigate to specific section
      // If it was just "Know More", we stop at the start of 'About'
      if (targetId !== '#about' && targetId !== '#hero') {
        setTimeout(() => {
          const targetSec = document.querySelector(targetId);
          if (targetSec) {
            const scrollTarget = viewportHeight + targetSec.offsetTop;
            window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
          }
        }, 800); // Duration roughly matches smooth scroll + zoom
      }
    }
  });
});

// ── PORTAL ZOOM EFFECT ──
const heroWrapper = document.getElementById('hero-wrapper');
const hero = document.getElementById('hero');
const heroContent = document.querySelector('.hero-content');
const portalO = document.getElementById('portal-o');
const heroName = document.querySelector('.hero-name');

const heroGlows = document.querySelectorAll('.hero-glow');
const heroGrid = document.querySelector('.hero-grid-bg');
const heroStats = document.querySelector('.hero-stats');
const scrollHint = document.querySelector('.scroll-hint');
const navInstaBtn = document.querySelector('.nav-insta-btn');

let viewportCx = 0;
let viewportCy = 0;
let baseRx = 0;
let baseRy = 0;

function updateOrigin() {
  if (!portalO || !heroContent) return;
  
  const oldTransform = heroContent.style.transform;
  const oldOpacity = heroContent.style.opacity;
  heroContent.style.transform = 'none';
  heroContent.style.opacity = '1';

  const cRect = heroContent.getBoundingClientRect();
  const oRect = portalO.getBoundingClientRect();
  
  heroContent.style.transform = oldTransform;
  heroContent.style.opacity = oldOpacity;

  const originX = (oRect.left + oRect.width / 2) - cRect.left;
  const originY = (oRect.top + oRect.height / 2) - cRect.top;
  
  heroContent.style.transformOrigin = `${originX}px ${originY}px`;
  
  viewportCx = oRect.left + oRect.width / 2;
  viewportCy = oRect.top + oRect.height / 2;
  // Bebas Neue 'O' inner hole is roughly 40% width and 70% height of the glyph bounds
  baseRx = oRect.width * 0.22; 
  baseRy = oRect.height * 0.35;
}

// Calculate after intro animation completes
setTimeout(updateOrigin, 1500);
window.addEventListener('resize', updateOrigin);

let ticking = false;

let isAutoScrolling = false;
let lastScrollY = 0;

function handleScroll() {
  if (!heroWrapper) return;
  
  const scrollY = window.scrollY;
  const viewportHeight = window.innerHeight;
  const zoomDuration = 100 * (viewportHeight / 100); // Further reduced to 100vh
  
  const restOfSite = document.getElementById('rest-of-site');
  if (!restOfSite) return;

  if (scrollY < zoomDuration) {
    const progress = Math.max(0, scrollY / zoomDuration);
    
    // AUTO-FINISH: If we've zoomed past 15%, auto-scroll to the finish line to complete the portal reveal
    if (progress > 0.15 && !isAutoScrolling && scrollY > lastScrollY) {
      isAutoScrolling = true;
      window.scrollTo({ top: zoomDuration, behavior: 'smooth' });
    }
    
    // AUTO-REVERSE: If we're scrolling back up and have entered the portal zone (< 85%), auto-scroll back to top
    if (progress < 0.85 && !isAutoScrolling && scrollY < lastScrollY && scrollY > 0) {
      isAutoScrolling = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Reset auto-scrolling flag if we reach the boundaries
    if (scrollY <= 0 || scrollY >= zoomDuration) {
      isAutoScrolling = false;
    }

    // Phase 1: Zooming (Fixed positions)
    let scale = 1 + (Math.pow(100, progress) - 1);
    heroContent.style.transform = `scale(${scale}) translateZ(0)`;
    
    // Fade out peripheral hero elements
    let fade = Math.max(0, 1 - progress * 3);
    heroGlows.forEach(g => g.style.opacity = fade);
    heroGrid.style.opacity = fade;
    if (heroStats) heroStats.style.opacity = fade;
    if (scrollHint) scrollHint.style.opacity = fade;

    // Website reveal through the 'O'
    const restRect = restOfSite.getBoundingClientRect();
    const localCx = viewportCx - restRect.left;
    const localCy = viewportCy - restRect.top;
    const rx = baseRx * scale;
    const ry = baseRy * scale;
    
    restOfSite.style.position = 'fixed';
    restOfSite.style.top = '0';
    restOfSite.style.opacity = progress > 0.01 ? 1 : 0;
    restOfSite.style.clipPath = `ellipse(${rx}px ${ry}px at ${localCx}px ${localCy}px)`;
    restOfSite.style.pointerEvents = 'none';

    hero.style.display = 'flex';
    heroWrapper.style.pointerEvents = 'auto';
    hero.style.pointerEvents = 'auto';
    
    if (progress > 0.85) {
      hero.style.opacity = Math.max(0, 1 - ((progress - 0.85) / 0.15));
    } else {
      hero.style.opacity = 1;
    }

    if (navInstaBtn) {
      navInstaBtn.style.opacity = '0';
      navInstaBtn.style.pointerEvents = 'none';
    }
  } else {
    // PHASE 2: SCROLLING (Natural movement)
    isAutoScrolling = false;
    hero.style.display = 'none';
    heroWrapper.style.pointerEvents = 'none'; // Prevent blocking the rest of the site
    
    if (navInstaBtn) {
      navInstaBtn.style.opacity = '1';
      navInstaBtn.style.pointerEvents = 'auto';
    }
    
    restOfSite.style.position = 'absolute';
    restOfSite.style.top = `${zoomDuration}px`;
    restOfSite.style.clipPath = 'none';
    restOfSite.style.opacity = 1;
    restOfSite.style.pointerEvents = 'auto';
  }
  
  lastScrollY = scrollY;
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(handleScroll);
    ticking = true;
  }
});

// Initial origin calculation
window.addEventListener('DOMContentLoaded', updateOrigin);
window.addEventListener('load', updateOrigin);
setTimeout(updateOrigin, 500);
setTimeout(updateOrigin, 1500);
setTimeout(updateOrigin, 3000); 

// ── HERO PARTICLES ──
const canvas = document.getElementById('hero-particles');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  const symbols = ['$', '⌘', '∫', '∆', '∑', '💪', '⚡', '⚙', '📊', '📉', '🚀'];
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() {
      this.init();
    }
    init() {
      this.x = Math.random() * canvas.width;
      this.y = -20 - Math.random() * 100;
      this.size = 10 + Math.random() * 12;
      this.symbol = symbols[Math.floor(Math.random() * symbols.length)];
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = 0.5 + Math.random() * 0.8;
      this.opacity = 0.02 + Math.random() * 0.08;
      this.color = Math.random() > 0.5 ? '#00f5c4' : '#00d4ff';
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Mouse Interaction (Radius tuned to cursor-ring + 3px)
      const dx = mx - this.x;
      const dy = my - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const repulsionRadius = 23; 
      
      if (dist < repulsionRadius) {
        const force = (repulsionRadius - dist) / repulsionRadius;
        this.vx -= (dx / dist) * force * 8;
        this.vy -= (dy / dist) * force * 8;
      } else {
        // Friction / Return to normal
        this.vx *= 0.95;
        if (this.vy < 0.5) this.vy += 0.05;
        if (this.vy > 1.5) this.vy *= 0.95;
      }

      if (this.y > canvas.height + 20) this.init();
      if (this.x < -20) this.x = canvas.width + 20;
      if (this.x > canvas.width + 20) this.x = -20;
    }
    draw() {
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.font = `${this.size}px Outfit, sans-serif`;
      ctx.fillText(this.symbol, this.x, this.y);
    }
  }

  for (let i = 0; i < 30; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Only animate if hero is visible (opacity > 0)
    if (parseFloat(getComputedStyle(hero).opacity) > 0.01) {
      particles.forEach(p => {
        p.update();
        p.draw();
      });
    }
    requestAnimationFrame(animate);
  }
  animate();
}