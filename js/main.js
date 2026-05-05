/* ============================================================
   PORTFOLIO — main.js
   Stack: Lenis + GSAP ScrollTrigger + Vanilla JS
   ============================================================ */

/* ── 1. LENIS SMOOTH SCROLL ───────────────────────────── */
const lenis = new Lenis({ lerp: 0.1 });

gsap.registerPlugin(ScrollTrigger);

// Single tick — GSAP drives Lenis (no double RAF)
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
lenis.on('scroll', ScrollTrigger.update);

/* ── 2. CUSTOM CURSOR ─────────────────────────────────── */
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
const cursorTextEl = document.getElementById('cursorText');

let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;
const LERP = 0.13;
// Half-sizes for centering without CSS translate
const DOT_HALF  = 3;
const RING_HALF = 20;

window.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  // GPU-composited — no layout/paint triggered
  dot.style.transform = `translate3d(${mouseX - DOT_HALF}px,${mouseY - DOT_HALF}px,0)`;
}, { passive: true });

(function animateRing() {
  ringX += (mouseX - ringX) * LERP;
  ringY += (mouseY - ringY) * LERP;
  const half = ring.offsetWidth / 2;
  ring.style.transform = `translate3d(${ringX - half}px,${ringY - half}px,0)`;
  requestAnimationFrame(animateRing);
})();

/* Cursor state helpers */
function setCursor(state, text = '') {
  document.body.classList.remove('c-hover', 'c-view', 'c-resume', 'c-fire');
  if (state) document.body.classList.add(state);
  cursorTextEl.textContent = text;
}

/* ── CURSOR CLICK EFFECT ────────────────────────────────── */
window.addEventListener('mousedown', () => {
  gsap.to(ring, { scale: 0.65, duration: 0.12, ease: 'power3.in' });
  gsap.to(dot,  { scale: 2.5,  duration: 0.12, ease: 'power3.in' });
});
window.addEventListener('mouseup', () => {
  gsap.to(ring, { scale: 1, duration: 0.55, ease: 'elastic.out(1.2, 0.4)' });
  gsap.to(dot,  { scale: 1, duration: 0.3,  ease: 'expo.out' });
});
window.addEventListener('click', e => {
  const r = document.createElement('div');
  r.className = 'c-ripple';
  r.style.left = e.clientX + 'px';
  r.style.top  = e.clientY + 'px';
  document.body.appendChild(r);
  gsap.fromTo(r,
    { scale: 0.5, opacity: 0.9 },
    { scale: 5, opacity: 0, duration: 0.6, ease: 'expo.out', onComplete: () => r.remove() }
  );
});

/* Hover targets */
document.querySelectorAll('a, button, .skill, .service-card').forEach(el => {
  const isView   = el.hasAttribute('data-cursor');
  const isResume = el.classList.contains('nav-resume');
  el.addEventListener('mouseenter', () => {
    if (isResume)       setCursor('c-resume', '');
    else if (isView)    setCursor('c-view', 'VIEW');
    else                setCursor('c-hover', '');
  });
  el.addEventListener('mouseleave', () => setCursor('', ''));
});

/* ── 3. MAGNETIC RESUME BUTTON ────────────────────────── */
const resumeBtn = document.getElementById('resumeBtn');
if (resumeBtn) {
  resumeBtn.addEventListener('mousemove', e => {
    const r   = resumeBtn.getBoundingClientRect();
    const cx  = r.left + r.width  / 2;
    const cy  = r.top  + r.height / 2;
    const dx  = (e.clientX - cx) * 0.38;
    const dy  = (e.clientY - cy) * 0.38;
    gsap.to(resumeBtn, { x: dx, y: dy, duration: .4, ease: 'power2.out' });
  });
  resumeBtn.addEventListener('mouseleave', () => {
    gsap.to(resumeBtn, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' });
  });
}

/* ── 4. NAVBAR ────────────────────────────────────────── */
const navbar  = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');

lenis.on('scroll', ({ scroll }) => {
  navbar.classList.toggle('scrolled', scroll > 60);
});

/* Active nav highlight on scroll */
const sections = document.querySelectorAll('.section[id]');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => {
        l.classList.toggle('active', l.dataset.section === entry.target.id);
      });
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => observer.observe(s));

/* Smooth scroll nav clicks */
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.getElementById(link.dataset.section);
    if (target) lenis.scrollTo(target, { offset: -60, duration: 1.6, easing: t => 1 - Math.pow(1 - t, 4) });
  });
});
document.querySelector('.nav-logo').addEventListener('click', e => {
  e.preventDefault(); lenis.scrollTo(0, { duration: 1.6 });
});

/* ── 5. GSAP STAGGER REVEAL ANIMATIONS ───────────────── */

/* Hero — immediate stagger on load */
gsap.fromTo('.hero-section .reveal-item',
  { opacity: 0, y: 50 },
  {
    opacity: 1, y: 0,
    duration: 1.1, ease: 'expo.out',
    stagger: 0.13, delay: 0.3
  }
);

/* Generic section reveals — excludes service cards (handled separately) */
document.querySelectorAll('.section:not(.hero-section)').forEach(section => {
  const items = section.querySelectorAll('.reveal-item:not(.service-card)');
  if (!items.length) return;
  gsap.fromTo(items,
    { opacity: 0, y: 50 },
    {
      opacity: 1, y: 0,
      duration: 1, ease: 'expo.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    }
  );
});

/* Service cards — each card slides up one by one as you scroll */
gsap.set('.service-card', { opacity: 0, y: 80 });
document.querySelectorAll('.service-card').forEach((card, i) => {
  gsap.to(card, {
    opacity: 1, y: 0,
    duration: 1.1, ease: 'expo.out',
    delay: i * 0.18,
    scrollTrigger: {
      trigger: '.services-grid',
      start: 'top 72%',
      toggleActions: 'play none none none',
      once: true
    }
  });
});

/* Works featured parallax */
document.querySelectorAll('.work-feat-img').forEach(el => {
  gsap.fromTo(el.querySelector('.work-thumb'),
    { y: -30 },
    {
      y: 30,
      ease: 'none',
      scrollTrigger: { trigger: el, scrub: 1.5 }
    }
  );
});

/* Works grid cards */
gsap.fromTo('.work-card',
  { opacity: 0, y: 50 },
  {
    opacity: 1, y: 0,
    duration: .8, ease: 'expo.out',
    stagger: 0.09,
    scrollTrigger: { trigger: '.works-grid', start: 'top 80%' }
  }
);

/* Contact heading letter split effect */
const contactH = document.querySelector('.contact-heading');
if (contactH) {
  gsap.fromTo(contactH,
    { opacity: 0, x: -60 },
    {
      opacity: 1, x: 0,
      duration: 1.2, ease: 'expo.out',
      scrollTrigger: { trigger: contactH, start: 'top 75%' }
    }
  );
}

/* Section big number bg parallax */
document.querySelectorAll('.section-number-bg').forEach(el => {
  gsap.fromTo(el,
    { y: 40 },
    { y: -40, ease: 'none', scrollTrigger: { trigger: el.parentElement, scrub: 2 } }
  );
});

/* ── 6. SKILL TAGS STAGGER ────────────────────────────── */
gsap.fromTo('.skill',
  { opacity: 0, scale: .9 },
  {
    opacity: 1, scale: 1,
    duration: .5, ease: 'back.out(1.5)',
    stagger: 0.05,
    scrollTrigger: { trigger: '.about-skills', start: 'top 80%' }
  }
);

/* ── 7. SOCIAL LINKS HOVER ────────────────────────────── */
document.querySelectorAll('.soc-link').forEach(link => {
  link.addEventListener('mouseenter', () => {
    gsap.to(link, { paddingLeft: '16px', duration: .3, ease: 'expo.out' });
  });
  link.addEventListener('mouseleave', () => {
    gsap.to(link, { paddingLeft: '0px', duration: .4, ease: 'elastic.out(1,.5)' });
  });
});

/* ── 8. CONTACT FORM ──────────────────────────────────── */
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = document.getElementById('formBtn');
    const label = btn.querySelector('span');
    label.textContent = 'Sent ✓';
    gsap.to(btn, { scale: 1.05, duration: .2, yoyo: true, repeat: 1 });
    setTimeout(() => { label.textContent = 'Send Message'; form.reset(); }, 3000);
  });
}

/* ── 9. HERO CTA SCROLL ───────────────────────────────── */
document.querySelector('.hero-cta')?.addEventListener('click', e => {
  e.preventDefault();
  lenis.scrollTo(document.getElementById('works'), { offset: -60, duration: 1.6 });
});

/* ── 10. PAGE LOADER FADE ─────────────────────────────── */
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  gsap.to(document.body, { opacity: 1, duration: .8, ease: 'expo.out' });
  ScrollTrigger.refresh();
});

/* ── 11. HERO DECO — SHOOT TO JUMP ORBIT GAME ─────────── */
(function () {
  const deco      = document.querySelector('.hero-deco');
  const orbitPath = document.getElementById('op');
  const orbitSVG  = document.querySelector('.deco-orbit');
  const decoRings = document.querySelectorAll('.deco-ring');
  const plus      = document.querySelector('.deco-plus');
  if (!deco || !orbitPath) return;

  const ORBITS = [61, 115, 168]; // inner · mid · outer radii (matching ring CSS)
  let orbitIdx = 1;             // start on middle ring
  const obj = { r: ORBITS[orbitIdx] };

  // Improved SVG circle path for textPath (2 arcs for perfect circle)
  function buildPath(r) {
    return `M 170,${170-r} A ${r},${r} 0 1,1 170,${170+r} A ${r},${r} 0 1,1 170,${170-r}`;
  }
  orbitPath.setAttribute('d', buildPath(obj.r));

  /* ─── SHOOT ─── */
  deco.addEventListener('click', e => {
    const choices = [0,1,2].filter(i => i !== orbitIdx);
    const next    = choices[Math.floor(Math.random() * choices.length)];

    /* 1. Big shot ripple */
    const f1 = document.createElement('div');
    f1.className = 'c-ripple';
    f1.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;border-color:rgba(255,255,255,.95);border-width:2px;`;
    document.body.appendChild(f1);
    gsap.fromTo(f1, { scale:0, opacity:1 }, { scale:7, opacity:0, duration:.55, ease:'expo.out', onComplete:()=>f1.remove() });

    /* 2. Second tighter ripple */
    const f2 = document.createElement('div');
    f2.className = 'c-ripple';
    f2.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;border-color:rgba(255,255,255,.4);`;
    document.body.appendChild(f2);
    gsap.fromTo(f2, { scale:0, opacity:.7 }, { scale:3, opacity:0, duration:.3, delay:.1, ease:'expo.out', onComplete:()=>f2.remove() });

    /* 3. Ring recoil */
    const sx = (Math.random()-.5)*16, sy = (Math.random()-.5)*16;
    gsap.to(decoRings, { x:sx, y:sy, duration:.07, ease:'power4.out',
      onComplete:()=>gsap.to(decoRings,{x:0,y:0,duration:.8,ease:'elastic.out(1,.3)'}) });

    /* 4. Orbit text jumps to new ring — animated radius */
    gsap.to(obj, {
      r: ORBITS[next], duration:.6, ease:'back.out(2.8)',
      onUpdate()  { orbitPath.setAttribute('d', buildPath(obj.r)); },
      onComplete(){ orbitIdx = next; }
    });

    /* 5. Text flash — blink out then snap back */
    if (orbitSVG) gsap.fromTo(orbitSVG, { opacity:0 }, { opacity:1, duration:.45, delay:.15, ease:'expo.out' });

    /* 6. Plus center burst */
    if (plus) gsap.fromTo(plus, { scale:2.4, opacity:1 }, { scale:1, opacity:.6, duration:.5, ease:'expo.out' });
  });

  /* ─── CROSSHAIR CURSOR ─── */
  deco.addEventListener('mouseenter', () => {
    ring.classList.add('c-crosshair');
    setCursor('c-fire', '');
    /* First-time hint */
    if (!deco._hinted) {
      deco._hinted = true;
      cursorTextEl.textContent = 'SHOOT';
      setTimeout(() => { if (document.body.classList.contains('c-fire')) cursorTextEl.textContent = ''; }, 1800);
    }
  });
  deco.addEventListener('mouseleave', () => {
    ring.classList.remove('c-crosshair');
    setCursor('', '');
  });
})();
