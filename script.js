// ── SPLASH SCREEN LOGIC ──
function startSplash() {
  const splash = document.getElementById('splash-screen');
  const main = document.getElementById('main-content');
  const typedEl = document.querySelector('.splash-name-typed');
  const splashContent = document.querySelector('.splash-content');
  const fullText = "TONY";
  const root = document.documentElement;
  
  // Disable scroll during splash
  document.body.style.overflow = 'hidden';
  
  const startTime = Date.now();
  const duration = 3000; // Total 3 seconds
  
  function update() {
    const elapsed = Date.now() - startTime;
    let progress = (elapsed / duration) * 100;
    
    if (progress >= 100) {
      progress = 100;
      root.style.setProperty("--splash-progress", "100%");
      if (typedEl) typedEl.textContent = fullText;
      
      // START SEAMLESS TRANSITION
      const heroLine2 = document.querySelector('.hero-name .line2');
      
      // 1. Prepare the Hero (Make it visible but keep line2 hidden)
      main.style.visibility = 'visible';
      main.style.opacity = '1';
      gsap.set(heroLine2, { opacity: 0 }); 

      // 2. Capture absolute positions
      const splashRect = typedEl.getBoundingClientRect();
      const originalDisplay = heroLine2.style.display;
      heroLine2.style.display = 'inline-block';
      const targetRect = heroLine2.getBoundingClientRect();
      heroLine2.style.display = originalDisplay;

      // 3. Create a floating clone for the glide
      const clone = document.createElement('div');
      clone.textContent = fullText;
      document.body.appendChild(clone);
      
      // Style the clone to match exactly and sit on top of everything
      const originalStyle = getComputedStyle(typedEl);
      Object.assign(clone.style, {
        position: 'fixed',
        left: '0',
        top: '0',
        margin: '0',
        zIndex: '10001',
        pointerEvents: 'none',
        fontFamily: originalStyle.fontFamily,
        fontSize: originalStyle.fontSize,
        fontWeight: originalStyle.fontWeight,
        color: 'transparent', // Match the outlined look
        webkitTextStroke: originalStyle.webkitTextStroke,
        letterSpacing: originalStyle.letterSpacing,
        lineHeight: originalStyle.lineHeight,
        textTransform: originalStyle.textTransform,
        whiteSpace: 'nowrap',
        // Set initial position via transform for GPU smoothness
        transform: `translate3d(${splashRect.left}px, ${splashRect.top}px, 0)`
      });

      // 4. Hide the original splash name
      typedEl.style.opacity = '0';

      // 5. Glide the clone to the target
      const targetStyle = getComputedStyle(heroLine2);
      gsap.to(clone, {
        x: targetRect.left,
        y: targetRect.top,
        fontSize: targetStyle.fontSize,
        letterSpacing: targetStyle.letterSpacing,
        duration: 1.5, // Smooth glide
        ease: "expo.inOut",
        onComplete: () => {
          // Final swap
          gsap.set(heroLine2, { opacity: 1 });
          clone.remove();
          splash.style.display = 'none';
          document.body.style.overflow = '';
          
          // Refresh ScrollTrigger and Recalculate Origin once everything is settled
          if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
            updateOrigin(); // Recalculate now that hero is visible and settled
          }
          
          // Trigger reveals
          document.querySelectorAll('.reveal').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) el.classList.add('visible');
          });
        }
      });
      
      // 6. Fade out the splash background and video
      gsap.to(splash, {
        backgroundColor: "rgba(0,0,0,0)",
        duration: 1.0,
        ease: "power2.inOut"
      });
      
      const splashVid = document.querySelector('.splash-video');
      if (splashVid) gsap.to(splashVid, { opacity: 0, duration: 0.8 });

      return;
    }
    
    // Typing effect logic
    const charCount = Math.floor((progress / 100) * (fullText.length + 1));
    if (typedEl) typedEl.textContent = fullText.substring(0, charCount);
    
    root.style.setProperty("--splash-progress", `${progress}%`);
    requestAnimationFrame(update);
  }
  
  requestAnimationFrame(update);
}

document.addEventListener('DOMContentLoaded', startSplash);

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
    card.style.transform = `translateY(var(--lift, 0px)) perspective(1000px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateZ(20px)`;
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
            const scrollTarget = targetSec.getBoundingClientRect().top + window.scrollY;
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
const navLogo = document.querySelector('.nav-logo');

let viewportCx = 0;
let viewportCy = 0;
let baseRx = 0;
let baseRy = 0;
let initialLogoCx = 0;
let initialLogoCy = 0;

function updateOrigin() {
  if (!portalO || !heroContent || !hero) return;
  
  // 1. Force Hero Visibility for accurate measurement (even if scrolled down)
  const oldDisplay = hero.style.display;
  const oldVisibility = hero.style.visibility;
  const oldContentTransform = heroContent.style.transform;
  const heroLine2 = document.querySelector('.hero-name .line2');
  const oldLine2Transform = heroLine2 ? heroLine2.style.transform : '';
  
  hero.style.display = 'flex';
  hero.style.visibility = 'hidden'; // Keep hidden but allow layout
  heroContent.style.transform = 'none';
  if (heroLine2) heroLine2.style.transform = 'none';

  // 2. Measure
  const cRect = heroContent.getBoundingClientRect();
  const oRect = portalO.getBoundingClientRect();
  
  // 3. Safety Check: Only update if we have valid non-zero dimensions
  if (oRect.width > 0 && cRect.width > 0) {
    const originX = (oRect.left + oRect.width / 2) - cRect.left;
    const originY = (oRect.top + oRect.height / 2) - cRect.top;
    
    heroContent.style.transformOrigin = `${originX}px ${originY}px`;
    
    viewportCx = oRect.left + oRect.width / 2;
    viewportCy = oRect.top + oRect.height / 2;
    
    // Bebas Neue 'O' inner hole is roughly 22% width and 35% height of the glyph bounds
    baseRx = oRect.width * 0.22; 
    baseRy = oRect.height * 0.35;

    // Capture stable logo center
    if (navLogo) {
      navLogo.style.transform = 'none'; // Reset to measure
      const lRect = navLogo.getBoundingClientRect();
      initialLogoCx = lRect.left + lRect.width / 2;
      initialLogoCy = lRect.top + lRect.height / 2;
    }
  }

  // 4. Restore original states
  hero.style.display = oldDisplay;
  hero.style.visibility = oldVisibility;
  heroContent.style.transform = oldContentTransform;
  if (heroLine2) heroLine2.style.transform = oldLine2Transform;
}

// Calculate after intro animation completes
setTimeout(updateOrigin, 1500);
window.addEventListener('resize', updateOrigin);

let ticking = false;

let isAutoScrolling = false;
let lastScrollY = 0;

function handleScroll() {
  if (!heroWrapper || !heroContent || !hero) return;
  
  const scrollY = window.scrollY;
  const viewportHeight = window.innerHeight;
  const zoomDuration = viewportHeight; 
  
  const restOfSite = document.getElementById('rest-of-site');
  if (!restOfSite) return;

  // 1. PURE RESET AT TOP
  if (scrollY <= 0) {
    hero.style.display = 'flex';
    hero.style.opacity = '1';
    heroContent.style.transform = 'scale(1) translateZ(0)';
    restOfSite.style.display = 'none';
    restOfSite.style.clipPath = 'none';
    restOfSite.style.opacity = '0';
    if (navLogo) {
      navLogo.style.transform = 'none';
      navLogo.style.opacity = '1';
    }
    if (navInstaBtn) navInstaBtn.style.opacity = '0';
    heroGlows.forEach(g => g.style.opacity = '1');
    heroGrid.style.opacity = '1';
    if (heroStats) heroStats.style.opacity = '1';
    if (scrollHint) scrollHint.style.opacity = '1';
    ticking = false;
    return;
  }

  if (scrollY < zoomDuration) {
    const progress = Math.max(0, scrollY / zoomDuration);
    
    // Phase 1: Zooming
    let scale = 1 + (Math.pow(100, progress) - 1);
    heroContent.style.transform = `scale(${scale}) translateZ(0)`;
    
    // Fade out peripheral elements
    let fade = Math.max(0, 1 - progress * 3);
    heroGlows.forEach(g => g.style.opacity = fade);
    heroGrid.style.opacity = fade;
    if (heroStats) heroStats.style.opacity = fade;
    if (scrollHint) scrollHint.style.opacity = fade;

    // Portal Reveal
    if (restOfSite.style.display !== 'block') {
      restOfSite.style.display = 'block';
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    }
    restOfSite.style.position = 'fixed';
    restOfSite.style.top = '0';
    restOfSite.style.opacity = progress > 0.01 ? 1 : 0;

    
    const restRect = restOfSite.getBoundingClientRect();
    const localCx = viewportCx - restRect.left;
    const localCy = viewportCy - restRect.top;
    const rx = baseRx * scale;
    const ry = baseRy * scale;
    
    restOfSite.style.clipPath = `ellipse(${rx}px ${ry}px at ${localCx}px ${localCy}px)`;
    restOfSite.style.willChange = 'transform, clip-path';
    restOfSite.style.pointerEvents = 'none';

    hero.style.display = 'flex';
    hero.style.opacity = progress > 0.85 ? Math.max(0, 1 - ((progress - 0.85) / 0.15)) : 1;
    
    if (navInstaBtn) {
      navInstaBtn.style.opacity = '0';
      navInstaBtn.style.pointerEvents = 'none';
    }

    // Logo Glide
    if (navLogo && initialLogoCx > 0) {
      const glideStart = 0.15;
      const glideEnd = 0.65;
      let glideProgress = progress > glideStart ? Math.min(1, (progress - glideStart) / (glideEnd - glideStart)) : 0;
      const easedGlide = glideProgress * (2 - glideProgress);
      
      const dx = (viewportCx - initialLogoCx) * easedGlide;
      const dy = (viewportCy - initialLogoCy) * easedGlide;
      const scaleLogo = 1 + (0.5 * easedGlide);
      
      navLogo.style.transform = `translate(${dx}px, ${dy}px) scale(${scaleLogo})`;
      navLogo.style.opacity = progress > 0.8 ? Math.max(0, 1 - ((progress - 0.8) / 0.15)) : 1;
    }
  } else {
    // Phase 2: Content
    hero.style.display = 'none';
    
    if (navInstaBtn) {
      navInstaBtn.style.opacity = '1';
      navInstaBtn.style.pointerEvents = 'auto';
    }

    if (restOfSite.style.position !== 'absolute') {
      restOfSite.style.display = 'block';
      restOfSite.style.position = 'absolute';
      restOfSite.style.top = `${zoomDuration}px`;
      restOfSite.style.clipPath = 'none';
      restOfSite.style.willChange = 'auto';
      restOfSite.style.opacity = 1;
      restOfSite.style.pointerEvents = 'auto';
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    }

    
    if (navLogo) {
      navLogo.style.transform = 'none';
      navLogo.style.opacity = 1;
    }
  }
  
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(handleScroll);
    ticking = true;
  }
});

// Initial origin calculation - rely on splash end and explicit triggers
window.addEventListener('DOMContentLoaded', updateOrigin);
window.addEventListener('load', updateOrigin);
setTimeout(updateOrigin, 500);
setTimeout(updateOrigin, 1500);
// Redundant timers removed to prevent race conditions during scroll

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

// ── HORIZONTAL SLIDER FOR ACCOLADES ──
if (typeof gsap !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);

  function initAccoladesSlider() {
    const section = document.querySelector('.horizontal-pin-section');
    if (!section) return;

    const track = section.querySelector('.cards-track');
    const slides = section.querySelectorAll('.accolade-slide');
    const viewport = section.querySelector('.cards-viewport');

    if (window.innerWidth > 768) {
      // Setup the timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=150%", // Reduced scroll distance as requested
          pin: true,
          pinType: "fixed",
          scrub: 2,
          snap: {
            snapTo: 1 / (slides.length - 0.5), // Adjusted for tighter scroll
            duration: { min: 0.5, max: 1.2 },
            delay: 0.1,
            ease: "power2.inOut"
          },
          anticipatePin: 1
        }
      });

      // Set initial states
      gsap.set(slides, { opacity: 0.2, scale: 0.85 });
      gsap.set(slides[0], { opacity: 1, scale: 1 });

      slides.forEach((slide, i) => {
        const viewportCenter = viewport.offsetWidth / 2;
        const slideCenter = slide.offsetLeft + (slide.offsetWidth / 2);
        const moveX = viewportCenter - slideCenter;

        if (i === 0) {
          gsap.set(track, { x: moveX });
          // Trigger faster - reduced stay duration
          tl.to({}, { duration: 0.5 }); 
        } else {
          // Faster transition with a FLIP effect
          tl.to(track, {
            x: moveX,
            duration: 0.75, 
            ease: "power2.inOut"
          }, "slide" + i);

          // Previous card flips out
          tl.to(slides[i-1], {
            opacity: 0,
            scale: 0.7,
            rotateY: -45,
            duration: 0.75,
            ease: "power2.inOut"
          }, "slide" + i);

          // Current card flips in
          tl.fromTo(slide, 
            { rotateY: 45, opacity: 0, scale: 0.7 },
            { 
              opacity: 1, 
              scale: 1, 
              rotateY: 0,
              duration: 0.75,
              ease: "power2.inOut"
            }, 
            "slide" + i
          );
          
          tl.to({}, { duration: 0.5 });
        }
      });
    }
  }



  // Re-init on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        ScrollTrigger.getAll().forEach(st => st.kill());
        initAccoladesSlider();
        initServicesScrollytelling();
    }, 250);
  });

  // ── SERVICES SCROLLYTELLING ──
  function initServicesScrollytelling() {
    const section = document.querySelector('.services-pin-section');
    if (!section) return;

    const items = section.querySelectorAll('.service-item');
    if (items.length < 3) return;

    // Only on desktop
    if (window.innerWidth <= 768) return;

    // Kill any existing service ScrollTriggers
    ScrollTrigger.getAll().forEach(st => {
      if (st.vars && st.vars.trigger === section) st.kill();
    });

    // Reset all items to default
    items.forEach(item => {
      item.classList.remove('svc-active', 'svc-hidden');
    });

    // Build a GSAP timeline pinned to the services section
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=300%",
        pin: true,
        pinType: "fixed",
        scrub: 1,
        anticipatePin: 1,
      }
    });

    // Phase 0 → 1: All visible (hold briefly), then expand #1 & hide #2, #3
    tl.to({}, { duration: 0.3 }); // Brief hold showing all 3

    // Expand service 1
    tl.call(() => {
      items[0].classList.add('svc-active');
      items[1].classList.add('svc-hidden');
      items[2].classList.add('svc-hidden');
    });
    tl.to({}, { duration: 1 }); // Hold expanded state 1

    // Phase 1 → 2: Switch to service 2
    tl.call(() => {
      items[0].classList.remove('svc-active');
      items[0].classList.add('svc-hidden');
      items[1].classList.remove('svc-hidden');
      items[1].classList.add('svc-active');
      items[2].classList.add('svc-hidden');
    });
    tl.to({}, { duration: 1 }); // Hold expanded state 2

    // Phase 2 → 3: Switch to service 3
    tl.call(() => {
      items[0].classList.add('svc-hidden');
      items[1].classList.remove('svc-active');
      items[1].classList.add('svc-hidden');
      items[2].classList.remove('svc-hidden');
      items[2].classList.add('svc-active');
    });
    tl.to({}, { duration: 1 }); // Hold expanded state 3

    // Phase 3 → 4: Collapse all back to original
    tl.call(() => {
      items.forEach(item => {
        item.classList.remove('svc-active', 'svc-hidden');
      });
    });
    tl.to({}, { duration: 0.5 }); // Brief hold showing all 3 again

    // Handle reverse scrolling — re-apply correct state based on progress
    tl.scrollTrigger.onUpdate = (self) => {
      const progress = self.progress;

      if (progress <= 0.08) {
        // Phase 0: All visible, no classes
        items.forEach(item => item.classList.remove('svc-active', 'svc-hidden'));
      } else if (progress > 0.08 && progress <= 0.32) {
        // Phase 1: Service 1 expanded
        items[0].classList.add('svc-active');
        items[0].classList.remove('svc-hidden');
        items[1].classList.remove('svc-active');
        items[1].classList.add('svc-hidden');
        items[2].classList.remove('svc-active');
        items[2].classList.add('svc-hidden');
      } else if (progress > 0.32 && progress <= 0.58) {
        // Phase 2: Service 2 expanded
        items[0].classList.remove('svc-active');
        items[0].classList.add('svc-hidden');
        items[1].classList.add('svc-active');
        items[1].classList.remove('svc-hidden');
        items[2].classList.remove('svc-active');
        items[2].classList.add('svc-hidden');
      } else if (progress > 0.58 && progress <= 0.84) {
        // Phase 3: Service 3 expanded
        items[0].classList.remove('svc-active');
        items[0].classList.add('svc-hidden');
        items[1].classList.remove('svc-active');
        items[1].classList.add('svc-hidden');
        items[2].classList.add('svc-active');
        items[2].classList.remove('svc-hidden');
      } else {
        // Phase 4: All visible again
        items.forEach(item => item.classList.remove('svc-active', 'svc-hidden'));
      }
    };
  }

  window.addEventListener('load', () => {
    setTimeout(initAccoladesSlider, 200);
    setTimeout(initServicesScrollytelling, 300);
  });
}
// ── CONTACT FORM LOGIC ──
function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('form-submit');
  const statusMsg = document.getElementById('form-status');

  if (!form) return;

  // EmailJS Credentials
  const PUBLIC_KEY = "8__XgtQlKuaLWpaTu"; 
  const SERVICE_ID = "service_6n4obzb"; 
  const TEMPLATE_ID = "template_if3r4f4"; 

  // Initialize EmailJS
  if (typeof emailjs !== 'undefined') {
    emailjs.init(PUBLIC_KEY);
  }


  form.addEventListener('submit', (e) => {
    e.preventDefault();


    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    statusMsg.textContent = "Sending your message...";
    statusMsg.className = "form-status";

    const templateParams = {
      name: document.getElementById('user_name').value,
      email: document.getElementById('user_email').value,
      title: document.getElementById('subject').value,
      phone: document.getElementById('user_phone').value || 'Not provided',
      message: document.getElementById('message').value
    };

    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
      .then(() => {
        statusMsg.textContent = "✓ Message sent successfully! I'll get back to you soon.";
        statusMsg.className = "form-status success";
        form.reset();
      })
      .catch((error) => {
        console.error('EmailJS Error:', error);
        const errorDetail = error?.text || error?.message || JSON.stringify(error);
        statusMsg.textContent = `✕ Error: ${errorDetail}. Please check your EmailJS IDs.`;
        statusMsg.className = "form-status error";
      })
      .finally(() => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      });

  });
}

document.addEventListener('DOMContentLoaded', initContactForm);