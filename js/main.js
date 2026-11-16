/* ============================================================
   WINTER PORTFOLIO — main.js
   Stack: Lenis + GSAP ScrollTrigger + Vanilla JavaScript
   Aesthetic: Editorial Cyber-Minimalist · 120FPS Performance
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. HARDWARE DETECTION & REDUCED MOTION ─────────────── */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  /* ── 2. LENIS SMOOTH SCROLL (SYNCED WITH GSAP) ──────────── */
  const lenis = new Lenis({
    lerp: prefersReduced ? 1 : 0.1,
    smoothTouch: false, /* Native momentum on touch devices */
  });

  gsap.registerPlugin(ScrollTrigger);

  // Single RAF loop — GSAP drives Lenis (eliminates double RAF jitter)
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.on('scroll', ScrollTrigger.update);

  /* ── 3. INTERACTIVE CUSTOM CURSOR ───────────────────────── */
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  const cursorTextEl = document.getElementById('cursorText');

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  const LERP = 0.13;
  const DOT_HALF = 3;
  const RING_HALF = 20;

  if (isTouchDevice) {
    if (dot) dot.style.display = 'none';
    if (ring) ring.style.display = 'none';
    document.body.style.cursor = 'auto';
  } else {
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate3d(${mouseX - DOT_HALF}px, ${mouseY - DOT_HALF}px, 0)`;
    }, { passive: true });

    let ringHalf = RING_HALF;
    window.addEventListener('resize', () => {
      ringHalf = ring ? ring.offsetWidth / 2 : RING_HALF;
    }, { passive: true });

    gsap.ticker.add(() => {
      ringX += (mouseX - ringX) * LERP;
      ringY += (mouseY - ringY) * LERP;
      if (ring) {
        ring.style.transform = `translate3d(${ringX - ringHalf}px, ${ringY - ringHalf}px, 0)`;
      }
    });

    window.setCursor = function (state, text = '') {
      document.body.classList.remove('c-hover', 'c-view', 'c-resume');
      if (state) document.body.classList.add(state);
      if (cursorTextEl) cursorTextEl.textContent = text;
    };

    window.addEventListener('mousedown', () => {
      gsap.to(ring, { scale: 0.7, duration: 0.12, ease: 'power3.in' });
      gsap.to(dot, { scale: 2.2, duration: 0.12, ease: 'power3.in' });
    });

    window.addEventListener('mouseup', () => {
      gsap.to(ring, { scale: 1, duration: 0.5, ease: 'elastic.out(1.2, 0.4)' });
      gsap.to(dot, { scale: 1, duration: 0.3, ease: 'expo.out' });
    });

    window.addEventListener('click', (e) => {
      const r = document.createElement('div');
      r.className = 'c-ripple';
      r.style.left = e.clientX + 'px';
      r.style.top = e.clientY + 'px';
      document.body.appendChild(r);
      gsap.fromTo(r,
        { scale: 0.5, opacity: 0.85 },
        { scale: 4.5, opacity: 0, duration: 0.55, ease: 'expo.out', onComplete: () => r.remove() }
      );
    });

    // Hover interactive elements
    document.querySelectorAll('a, button, .skill, .service-card, .work-card, .work-feat').forEach((el) => {
      const isView = el.hasAttribute('data-cursor');
      const customLabel = el.getAttribute('data-cursor') || 'VIEW';
      const isResume = el.classList.contains('nav-resume');

      el.addEventListener('mouseenter', () => {
        if (isResume) window.setCursor('c-resume', '');
        else if (isView) window.setCursor('c-view', customLabel);
        else window.setCursor('c-hover', '');
      });

      el.addEventListener('mouseleave', () => window.setCursor('', ''));
    });
  }

  /* ── 4. EIGHT MATCHING DESIGNER THEME PALETTES ───────────── */
  const themes = [
    { id: 'theme-cyan',     name: 'Cyan Aurora',    dot: '#22d3ee', desc: 'Electric Cyan & Deep Teal' },
    { id: 'theme-violet',   name: 'Cyber Violet',   dot: '#c084fc', desc: 'Ultraviolet & Deep Nebula' },
    { id: 'theme-emerald',  name: 'Emerald Matrix', dot: '#10b981', desc: 'Matrix Green & Cyber Emerald' },
    { id: 'theme-sunset',   name: 'Solar Sunset',   dot: '#f59e0b', desc: 'Solar Amber & Dark Flare' },
    { id: 'theme-crimson',  name: 'Crimson Noir',   dot: '#fb7185', desc: 'Blood Rose & Obsidian' },
    { id: 'theme-sapphire', name: 'Midnight Blue',  dot: '#60a5fa', desc: 'Royal Sapphire & Navy' },
    { id: 'theme-tokyo',    name: 'Tokyo Neon',     dot: '#a3e635', desc: 'Toxic Lime & Volt Cyan' },
    { id: 'theme-mono',     name: 'Titanium Mono',  dot: '#ffffff', desc: 'Diamond White & Chrome' }
  ];

  let currentThemeIndex = 0;
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeColorDot = document.getElementById('themeColorDot');
  const themeNameLabel = document.getElementById('themeNameLabel');
  const mobileThemeBtn = document.getElementById('mobileThemeBtn');
  const mobileThemeDot = document.getElementById('mobileThemeDot');
  const toast = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMsg');
  const toastSwatch = document.getElementById('toastSwatch');
  let toastTimer = null;

  function showToast(message, dotColor = null) {
    if (!toast) return;
    if (toastMsg) toastMsg.textContent = message;
    if (toastSwatch) {
      if (dotColor) {
        toastSwatch.style.display = 'inline-block';
        toastSwatch.style.background = dotColor;
        toastSwatch.style.boxShadow = `0 0 8px ${dotColor}`;
      } else {
        toastSwatch.style.display = 'none';
      }
    }
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  function applyTheme(idx) {
    const nextTheme = themes[idx];
    themes.forEach((t) => document.body.classList.remove(t.id));
    document.body.classList.add(nextTheme.id);

    if (themeColorDot) themeColorDot.style.background = nextTheme.dot;
    if (themeNameLabel) themeNameLabel.textContent = nextTheme.name;
    if (mobileThemeDot) mobileThemeDot.style.background = nextTheme.dot;

    showToast(`Palette: ${nextTheme.name} (${nextTheme.desc})`, nextTheme.dot);
  }

  function cycleThemeRandom() {
    let nextIdx;
    do {
      nextIdx = Math.floor(Math.random() * themes.length);
    } while (nextIdx === currentThemeIndex);

    currentThemeIndex = nextIdx;
    applyTheme(currentThemeIndex);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      cycleThemeRandom();
      gsap.fromTo(themeToggleBtn,
        { scale: 0.92 },
        { scale: 1, duration: 0.35, ease: 'back.out(2)' }
      );
    });
  }

  if (mobileThemeBtn) {
    mobileThemeBtn.addEventListener('click', () => {
      cycleThemeRandom();
      gsap.fromTo(mobileThemeBtn,
        { scale: 0.94 },
        { scale: 1, duration: 0.35, ease: 'back.out(2)' }
      );
    });
  }

  /* ── 5. MAGNETIC RESUME BUTTON ──────────────────────────── */
  const resumeBtn = document.getElementById('resumeBtn');
  if (resumeBtn && !isTouchDevice) {
    const xSet = gsap.quickSetter(resumeBtn, 'x', 'px');
    const ySet = gsap.quickSetter(resumeBtn, 'y', 'px');

    resumeBtn.addEventListener('mousemove', (e) => {
      const r = resumeBtn.getBoundingClientRect();
      xSet((e.clientX - r.left - r.width / 2) * 0.35);
      ySet((e.clientY - r.top - r.height / 2) * 0.35);
    }, { passive: true });

    resumeBtn.addEventListener('mouseleave', () => {
      gsap.to(resumeBtn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    });
  }

  /* ── 6. NAVBAR & NAVIGATION ─────────────────────────────── */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');

  lenis.on('scroll', ({ scroll }) => {
    if (navbar) navbar.classList.toggle('scrolled', scroll > 50);
  });

  const sections = document.querySelectorAll('.section[id]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((l) => {
          l.classList.toggle('active', l.dataset.section === entry.target.id);
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach((s) => observer.observe(s));

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(link.dataset.section);
      if (target) {
        lenis.scrollTo(target, {
          offset: -60,
          duration: 1.4,
          easing: (t) => 1 - Math.pow(1 - t, 4),
        });
      }
    });
  });

  document.querySelector('.nav-logo')?.addEventListener('click', (e) => {
    e.preventDefault();
    lenis.scrollTo(0, { duration: 1.4 });
  });

  /* ── 7. FULLSCREEN MOBILE DRAWER ────────────────────────── */
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileCloseBtn = document.getElementById('mobileCloseBtn');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function openMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (navToggle) navToggle.addEventListener('click', openMobileMenu);
  if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMobileMenu);

  mobileLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileMenu();
      const target = document.getElementById(link.dataset.section);
      if (target) {
        setTimeout(() => {
          lenis.scrollTo(target, {
            offset: -40,
            duration: 1.2,
            easing: (t) => 1 - Math.pow(1 - t, 4),
          });
        }, 300);
      }
    });
  });

  /* ── 8. LIGHTSABER SCROLL PROGRESS ──────────────────────── */
  (function initLightsaber() {
    const saberFill = document.getElementById('saberFill');
    const saberTip = document.getElementById('saberTip');
    if (!saberFill || !saberTip) return;

    let vw = window.innerWidth;
    window.addEventListener('resize', () => { vw = window.innerWidth; }, { passive: true });

    lenis.on('scroll', ({ scroll, limit }) => {
      if (limit <= 0) return;
      const p = Math.min(1, Math.max(0, scroll / limit));
      saberFill.style.transform = `scaleX(${p})`;
      saberTip.style.transform = `translate(${p * vw - 2.5}px, -50%)`;
    });
  })();

  /* ── 9. HERO 3D CARD STACK & TOUCH INTERACTION ───────────── */
  (function initCardDeck() {
    const stack = document.getElementById('cardStack');
    if (!stack) return;

    const frontCard = stack.querySelector('.stack-card.card-front');
    const allCards = stack.querySelectorAll('.stack-card');

    gsap.from(allCards, {
      y: -35,
      opacity: 0,
      duration: 1,
      ease: 'expo.out',
      stagger: 0.12,
      delay: 0.6
    });

    if (!isTouchDevice && frontCard) {
      let isHovered = false;

      stack.addEventListener('mouseenter', () => { isHovered = true; });
      stack.addEventListener('mouseleave', () => {
        isHovered = false;
        gsap.to(frontCard, {
          rotationX: 0,
          rotationY: 0,
          ease: 'elastic.out(1, 0.4)',
          duration: 0.8
        });
      });

      stack.addEventListener('mousemove', (e) => {
        if (!isHovered) return;
        const rect = frontCard.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);

        gsap.to(frontCard, {
          rotationX: -dy * 8,
          rotationY: dx * 8,
          transformPerspective: 900,
          ease: 'power2.out',
          duration: 0.35
        });
      }, { passive: true });
    }

    // Touch devices: tap cycles cards & triggers temporary fan
    function cycleDeck() {
      const cBack = stack.querySelector('.card-back');
      const cMid = stack.querySelector('.card-mid');
      const cFront = stack.querySelector('.card-front');

      if (!cBack || !cMid || !cFront) return;

      cBack.classList.remove('card-back');
      cBack.classList.add('card-mid');

      cMid.classList.remove('card-mid');
      cMid.classList.add('card-front');

      cFront.classList.remove('card-front');
      cFront.classList.add('card-back');
    }

    stack.addEventListener('click', (e) => {
      cycleDeck();
      if (isTouchDevice) {
        stack.classList.add('fanned');
        setTimeout(() => stack.classList.remove('fanned'), 1200);
      }
    });
  })();

  /* ── 10. ABOUT PHOTO 3D GYROSCOPE TILT & TOUCH STATE ────── */
  (function initAboutPortrait() {
    const wrap = document.getElementById('aboutImgWrap');
    const frame = document.getElementById('aboutImgFrame');
    if (!wrap || !frame) return;

    if (!isTouchDevice) {
      wrap.addEventListener('mousemove', (e) => {
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
          duration: 0.35,
          overwrite: 'auto'
        });
      }, { passive: true });

      wrap.addEventListener('mouseleave', () => {
        gsap.to(frame, {
          rotationX: 0,
          rotationY: 0,
          ease: 'elastic.out(1, 0.4)',
          duration: 0.9,
          overwrite: 'auto'
        });
      });
    }

    // Touch devices: tap to toggle active laser & corner state
    wrap.addEventListener('click', () => {
      wrap.classList.toggle('touch-active');
    });

    document.addEventListener('touchstart', (e) => {
      if (!wrap.contains(e.target)) {
        wrap.classList.remove('touch-active');
      }
    }, { passive: true });
  })();

  /* ── 11. CONTACT FORM HANDLING ───────────────────────────── */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = document.getElementById('formBtn');
      const label = btn.querySelector('span');
      const origText = label.textContent;

      label.textContent = 'Transmitted ✓';
      showToast('Thank you! Transmission received successfully.');
      gsap.to(btn, { scale: 1.05, duration: 0.2, yoyo: true, repeat: 1 });
      contactForm.reset();

      setTimeout(() => {
        label.textContent = origText;
      }, 3500);
    });
  }

  /* ── 12. HERO CTA SCROLL TRIGGER ────────────────────────── */
  document.querySelector('.hero-cta')?.addEventListener('click', (e) => {
    e.preventDefault();
    const worksEl = document.getElementById('works');
    if (worksEl) {
      lenis.scrollTo(worksEl, {
        offset: -40,
        duration: 1.4,
        easing: (t) => 1 - Math.pow(1 - t, 4)
      });
    }
  });

  /* ── 13. GSAP ENTRANCE & SCROLL REVEALS ──────────────────── */
  if (!prefersReduced) {
    // Hero Entrance
    gsap.fromTo('.hero-section .reveal-item',
      { opacity: 0, y: 45 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.12,
        delay: 0.2
      }
    );

    // Section Reveals
    document.querySelectorAll('.section:not(.hero-section)').forEach((section) => {
      const items = section.querySelectorAll('.reveal-item:not(.service-card)');
      if (!items.length) return;

      gsap.fromTo(items,
        { opacity: 0, y: 45 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    });

    // Service Cards Reveal
    gsap.set('.service-card', { opacity: 0, y: 60 });
    document.querySelectorAll('.service-card').forEach((card, i) => {
      gsap.to(card, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'expo.out',
        delay: i * 0.14,
        scrollTrigger: {
          trigger: '.services-grid',
          start: 'top 75%',
          toggleActions: 'play none none none',
          once: true
        }
      });
    });

    // Works Cards Reveal
    gsap.fromTo('.work-card',
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'expo.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: '.works-grid',
          start: 'top 82%',
          once: true
        }
      }
    );

    // Skills Stagger
    gsap.fromTo('.skill',
      { opacity: 0, scale: 0.9 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.45,
        ease: 'back.out(1.5)',
        stagger: 0.04,
        scrollTrigger: {
          trigger: '.about-skills',
          start: 'top 85%',
          once: true
        }
      }
    );

    // Background Number Parallax
    document.querySelectorAll('.section-number-bg').forEach((el) => {
      gsap.fromTo(el,
        { y: 35 },
        {
          y: -35,
          ease: 'none',
          scrollTrigger: {
            trigger: el.parentElement,
            scrub: 1.8
          }
        }
      );
    });
  } else {
    document.querySelectorAll('.reveal-item, .service-card, .work-card, .skill').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  /* ── 14. DYNAMIC YEAR & LOAD REFRESH ────────────────────── */
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });

})();