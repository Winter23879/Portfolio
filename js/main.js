/* ============================================================
   PORTFOLIO — main.js
   Stack: Lenis + GSAP ScrollTrigger + Vanilla JS
   ============================================================ */

/* ── 1. LENIS SMOOTH SCROLL ───────────────────────────── */

/* Respect prefers-reduced-motion globally: skip smooth scroll + GSAP */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const lenis = new Lenis({
  lerp: prefersReduced ? 1 : 0.1,
  smoothTouch: false,   /* touch devices use native momentum, not Lenis */
});

gsap.registerPlugin(ScrollTrigger);

// Single tick — GSAP drives Lenis (no double RAF)
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
lenis.on('scroll', ScrollTrigger.update);

/* ── 2. CUSTOM CURSOR ─────────────────────────────────── */
const dot = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
const cursorTextEl = document.getElementById('cursorText');

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;
const LERP = 0.13;
// Half-sizes for centering without CSS translate
const DOT_HALF = 3;
const RING_HALF = 20;

window.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  // GPU-composited — no layout/paint triggered
  dot.style.transform = `translate3d(${mouseX - DOT_HALF}px,${mouseY - DOT_HALF}px,0)`;
}, { passive: true });

/* Cache half-size once; update on resize so no forced layout read per frame */
let ringHalf = ring.offsetWidth / 2;
window.addEventListener('resize', () => { ringHalf = ring.offsetWidth / 2; }, { passive: true });

/* Ring lerp runs INSIDE the GSAP ticker — no competing RAF loop */
gsap.ticker.add(() => {
  ringX += (mouseX - ringX) * LERP;
  ringY += (mouseY - ringY) * LERP;
  ring.style.transform = `translate3d(${ringX - ringHalf}px,${ringY - ringHalf}px,0)`;
});

/* Cursor state helpers */
function setCursor(state, text = '') {
  document.body.classList.remove('c-hover', 'c-view', 'c-resume', 'c-fire');
  if (state) document.body.classList.add(state);
  cursorTextEl.textContent = text;
}

/* ── CURSOR CLICK EFFECT ────────────────────────────────── */
window.addEventListener('mousedown', () => {
  gsap.to(ring, { scale: 0.65, duration: 0.12, ease: 'power3.in' });
  gsap.to(dot, { scale: 2.5, duration: 0.12, ease: 'power3.in' });
});
window.addEventListener('mouseup', () => {
  gsap.to(ring, { scale: 1, duration: 0.55, ease: 'elastic.out(1.2, 0.4)' });
  gsap.to(dot, { scale: 1, duration: 0.3, ease: 'expo.out' });
});
window.addEventListener('click', e => {
  const r = document.createElement('div');
  r.className = 'c-ripple';
  r.style.left = e.clientX + 'px';
  r.style.top = e.clientY + 'px';
  document.body.appendChild(r);
  gsap.fromTo(r,
    { scale: 0.5, opacity: 0.9 },
    { scale: 5, opacity: 0, duration: 0.6, ease: 'expo.out', onComplete: () => r.remove() }
  );
});

/* Hover targets */
document.querySelectorAll('a, button, .skill, .service-card').forEach(el => {
  const isView = el.hasAttribute('data-cursor');
  const isResume = el.classList.contains('nav-resume');
  el.addEventListener('mouseenter', () => {
    if (isResume) setCursor('c-resume', '');
    else if (isView) setCursor('c-view', 'VIEW');
    else setCursor('c-hover', '');
  });
  el.addEventListener('mouseleave', () => setCursor('', ''));
});

/* ── 3. MAGNETIC RESUME BUTTON ────────────────────────── */
const resumeBtn = document.getElementById('resumeBtn');
if (resumeBtn) {
  /* quickSetter = near-zero cost vs creating a new tween every mousemove */
  const xSet = gsap.quickSetter(resumeBtn, 'x', 'px');
  const ySet = gsap.quickSetter(resumeBtn, 'y', 'px');
  resumeBtn.addEventListener('mousemove', e => {
    const r = resumeBtn.getBoundingClientRect();
    xSet((e.clientX - r.left - r.width / 2) * 0.38);
    ySet((e.clientY - r.top - r.height / 2) * 0.38);
  }, { passive: true });
  resumeBtn.addEventListener('mouseleave', () => {
    gsap.to(resumeBtn, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' });
  });
}

/* ── 4. NAVBAR ────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
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

/* ── 10. PAGE LOAD ──────────────────────────────────────── */
window.addEventListener('load', () => {
  ScrollTrigger.refresh();
});

/* ── 12. LIGHTSABER SCROLL PROGRESS ────────────────────── */
(function () {
  const saberFill = document.getElementById('saberFill');
  const saberTip = document.getElementById('saberTip');
  if (!saberFill || !saberTip) return;

  /* Cache viewport width; update on resize */
  let vw = window.innerWidth;
  window.addEventListener('resize', () => { vw = window.innerWidth; }, { passive: true });

  lenis.on('scroll', ({ scroll, limit }) => {
    if (limit <= 0) return;
    const p = scroll / limit;                    /* 0 → 1 */
    /* Fill: scaleX from left — GPU composited, no layout */
    saberFill.style.transform = `scaleX(${p})`;
    /* Tip: move to the leading edge pixel position */
    saberTip.style.transform = `translate(${p * vw - 2.5}px, -50%)`;
  });
})();

/* ── 11. CARD STACK INTERACTION ─────────────────────────── */
(function () {
  const stack = document.getElementById('cardStack');
  if (!stack) return;

  const frontCard = stack.querySelector('.card-front');
  const allCards = stack.querySelectorAll('.stack-card');

  /* Entrance: cards drop in staggered */
  gsap.from(allCards, {
    y: -40, opacity: 0, rotation: 0,
    duration: 1.1, ease: 'expo.out',
    stagger: 0.12, delay: 0.8
  });

  /* 3D tilt on the front card while stack is in resting state */
  let isFanned = false;

  stack.addEventListener('mouseenter', () => {
    isFanned = true;
  });
  stack.addEventListener('mouseleave', () => {
    isFanned = false;
    gsap.to(frontCard, {
      rotationX: 0, rotationY: 0,
      ease: 'elastic.out(1, 0.4)', duration: 0.9
    });
    setCursor('', '');
  });

  stack.addEventListener('mousemove', e => {
    if (!isFanned) return;
    const rect = frontCard.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);

    gsap.to(frontCard, {
      rotationX: -dy * 9,
      rotationY: dx * 9,
      transformPerspective: 900,
      ease: 'power2.out', duration: 0.35
    });
  });

  /* Cursor state */
  stack.addEventListener('mouseenter', () => setCursor('c-view', 'VIEW'));
  stack.addEventListener('mouseleave', () => setCursor('', ''));
})();

/* ── 13. ABOUT PHOTO 3D TILT ───────────────────────────── */
(function () {
  const wrap  = document.getElementById('aboutImgWrap');
  const frame = document.getElementById('aboutImgFrame');
  if (!wrap || !frame) return;

  wrap.addEventListener('mousemove', e => {
    const rect = wrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);  /* -1 to 1 */
    const dy = (e.clientY - cy) / (rect.height / 2); /* -1 to 1 */

    gsap.to(frame, {
      rotationX: -dy * 12,
      rotationY: dx * 12,
      transformPerspective: 1000,
      ease: 'power2.out',
      duration: 0.4
    });
  });

  wrap.addEventListener('mouseleave', () => {
    gsap.to(frame, {
      rotationX: 0,
      rotationY: 0,
      ease: 'elastic.out(1, 0.4)',
      duration: 1
    });
  });
})();
