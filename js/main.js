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
      document.body.classList.remove('c-hover', 'c-view', 'c-resume', 'c-crosshair');
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
    document.querySelectorAll('a, button, .skill, .service-card, .work-card, .work-feat, .expertise-item, .hero-frequency-ribbon, .hero-period, .dmode-tab, .mag-tag, .hire-capsule-trigger, .hcd-link, .fmt-btn, .ff-nav-btn, .ff-view-link').forEach((el) => {
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

    // Crosshair target zone for radar rings
    const decoRingsEl = document.getElementById('decoRings');
    if (decoRingsEl) {
      decoRingsEl.addEventListener('mouseenter', () => window.setCursor('c-crosshair', ''));
      decoRingsEl.addEventListener('mouseleave', () => window.setCursor('', ''));
    }
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

  /* ── 9. KINETIC MAGNETIC STUDIO & FLAGSHIP ENGINE ────────── */
  (function initKineticMagneticStudio() {
    // 1. Magnetic Interactive Physics Tags Cloud
    const tags = document.querySelectorAll('.mag-tag');
    const tagMessages = {
      tech: '✦ Engineering: 100% custom architectures with zero template bloat',
      motion: '✦ Motion: 120 FPS GSAP ScrollTrigger & sensory micro-kinetics',
      stack: '✦ Core Stack: React 19, TypeScript, Next.js & Tailwind CSS v4',
      design: '✦ Design Systems: Production Figma tokens & atomic design patterns',
      hire: '✦ Availability: Open to select Q1 commissions & full-time roles'
    };

    tags.forEach((tag) => {
      tag.addEventListener('click', () => {
        const type = tag.getAttribute('data-tag');
        gsap.fromTo(tag,
          { scale: 1.25 },
          { scale: 1, duration: 0.35, ease: 'elastic.out(1.2, 0.4)' }
        );

        if (tagMessages[type]) {
          showToast(tagMessages[type], '#22d3ee');
        }

        if (type === 'hire') {
          const capsule = document.getElementById('hireCapsule');
          if (capsule) capsule.classList.toggle('open');
        }
      });

      if (!isTouchDevice) {
        tag.addEventListener('mousemove', (e) => {
          const r = tag.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const dx = (e.clientX - cx) * 0.4;
          const dy = (e.clientY - cy) * 0.4;
          gsap.to(tag, { x: dx, y: dy, duration: 0.2, ease: 'power2.out' });
        });

        tag.addEventListener('mouseleave', () => {
          gsap.to(tag, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1.2, 0.4)' });
        });
      }
    });

    // 2. Kinetic Letter Physics
    const chars = document.querySelectorAll('.k-char');
    chars.forEach((c) => {
      c.addEventListener('mouseenter', () => {
        gsap.fromTo(c,
          { y: 0, scale: 1 },
          { y: -10, scale: 1.15, duration: 0.22, ease: 'power2.out', yoyo: true, repeat: 1 }
        );
      });
    });

    // 3. Expandable Hire Capsule Dropdown & Copy Email
    const hireTrigger = document.getElementById('hireCapsuleTrigger');
    const hireCapsule = document.getElementById('hireCapsule');
    const hcdCopyEmail = document.getElementById('hcdCopyEmail');
    const hcdResumeLink = document.getElementById('hcdResumeLink');

    if (hireTrigger && hireCapsule) {
      hireTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = hireCapsule.classList.toggle('open');
        hireTrigger.setAttribute('aria-expanded', String(isOpen));
      });

      document.addEventListener('click', (e) => {
        if (!hireCapsule.contains(e.target)) {
          hireCapsule.classList.remove('open');
          hireTrigger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    if (hcdCopyEmail) {
      hcdCopyEmail.addEventListener('click', async () => {
        const email = 'saikrishnam966@gmail.com';
        try {
          await navigator.clipboard.writeText(email);
          showToast(`Copied to clipboard: ${email}`, '#25d366');
        } catch {
          showToast(`Email: ${email}`, '#22d3ee');
        }
      });
    }

    if (hcdResumeLink) {
      hcdResumeLink.addEventListener('click', () => {
        showToast('Directing to Candidate Credentials...', '#22d3ee');
      });
    }

    // 4. Flagship 3D Spotlight Stage & View Toggle
    const fmtBtns = document.querySelectorAll('.fmt-btn');
    const reelView = document.getElementById('flagshipReelView');
    const specsView = document.getElementById('flagshipSpecsView');
    const prevBtn = document.getElementById('flagshipPrev');
    const nextBtn = document.getElementById('flagshipNext');
    const counterEl = document.getElementById('flagshipCounter');
    const indicatorText = document.getElementById('flagshipIndicatorText');
    const flagshipCard = document.getElementById('flagshipCard');

    const spotlights = [
      {
        cat: 'Cinematic Motion · Video Production',
        title: 'Winter Reel 2024',
        desc: 'Editorial pacing, 4K digital mastering, and audio-reactive kinetics.',
        img: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=680&h=480&fit=crop&q=80',
        indicator: 'CINEMATIC ARCHITECTURE ACTIVE',
        specs: [
          { title: 'STACK & TOOLING', val: 'Premiere Pro · After Effects · DaVinci' },
          { title: 'PERFORMANCE', val: '120 FPS Native Sync · Zero Lag' },
          { title: 'CLIENT IMPACT', val: 'Commercial Storytelling · 250k+ Views' },
          { title: 'DELIVERY', val: 'Master Pro-Res 4444XQ · Cinema Package' }
        ]
      },
      {
        cat: 'UI/UX & Design Architecture',
        title: 'Lumina Brand & Interface System',
        desc: 'Scalable token system, micro-interactions, responsive mobile-first UI component library.',
        img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=680&h=480&fit=crop&q=80',
        indicator: 'DESIGN SYSTEM V2 ACTIVE',
        specs: [
          { title: 'FOUNDATION', val: 'Figma Tokens · Auto-Layout 5.0' },
          { title: 'COMPONENTS', val: '80+ Reusable Atomic Modules' },
          { title: 'ACCESSIBILITY', val: 'WCAG 2.1 AAA Compliant Contrast' },
          { title: 'PROTOTYPING', val: 'Advanced Variables & Interactive Components' }
        ]
      },
      {
        cat: 'Creative Web Engineering',
        title: 'Next-Gen Digital Commerce',
        desc: 'Sub-second routing, GSAP scroll triggers, headless state management, and real-time carts.',
        img: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=680&h=480&fit=crop&q=80',
        indicator: 'REACT 19 CORE RUNNING',
        specs: [
          { title: 'ENGINEERING', val: 'React 19 · TypeScript · Tailwind CSS' },
          { title: 'ANIMATION', val: 'GSAP 3 · ScrollTrigger · Lenis' },
          { title: 'LIGHTHOUSE', val: '100% Performance & SEO Score' },
          { title: 'STATE', val: 'Zustand & Server Actions' }
        ]
      }
    ];

    let currentSpotlight = 0;

    function renderSpotlight(idx) {
      currentSpotlight = ((idx % spotlights.length) + spotlights.length) % spotlights.length;
      const s = spotlights[currentSpotlight];

      if (counterEl) counterEl.textContent = `0${currentSpotlight + 1} / 0${spotlights.length}`;
      if (indicatorText) indicatorText.textContent = s.indicator;

      if (reelView) {
        const img = reelView.querySelector('img');
        const cat = reelView.querySelector('.fvo-cat');
        const title = reelView.querySelector('.fvo-title');
        const sub = reelView.querySelector('.fvo-sub');

        gsap.fromTo(reelView,
          { opacity: 0.6, scale: 0.98 },
          { opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out' }
        );

        if (img) img.src = s.img;
        if (cat) cat.textContent = s.cat;
        if (title) title.textContent = s.title;
        if (sub) sub.textContent = s.desc;
      }

      if (specsView) {
        const blocks = specsView.querySelectorAll('.spec-block');
        s.specs.forEach((sp, i) => {
          if (blocks[i]) {
            const t = blocks[i].querySelector('.sb-title');
            const v = blocks[i].querySelector('.sb-val');
            if (t) t.textContent = sp.title;
            if (v) v.textContent = sp.val;
          }
        });
      }
    }

    fmtBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        fmtBtns.forEach((b) => b.classList.toggle('active', b === btn));
        if (view === 'reel') {
          reelView.classList.add('active');
          specsView.classList.remove('active');
        } else {
          reelView.classList.remove('active');
          specsView.classList.add('active');
        }
      });
    });

    if (prevBtn) prevBtn.addEventListener('click', () => renderSpotlight(currentSpotlight - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => renderSpotlight(currentSpotlight + 1));

    // 3D gyroscopic tilt on flagship card for desktop
    if (!isTouchDevice && flagshipCard) {
      flagshipCard.addEventListener('mousemove', (e) => {
        const r = flagshipCard.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = (e.clientX - cx) / (r.width / 2);
        const dy = (e.clientY - cy) / (r.height / 2);

        gsap.to(flagshipCard, {
          rotationX: -dy * 6.5,
          rotationY: dx * 6.5,
          transformPerspective: 1100,
          duration: 0.3,
          ease: 'power2.out'
        });
      }, { passive: true });

      flagshipCard.addEventListener('mouseleave', () => {
        gsap.to(flagshipCard, {
          rotationX: 0,
          rotationY: 0,
          duration: 0.7,
          ease: 'elastic.out(1, 0.4)'
        });
      });
    }

    // 5. Interactive Period Beacon
    const heroPeriod = document.getElementById('heroPeriod');
    if (heroPeriod) {
      heroPeriod.addEventListener('click', (e) => {
        e.stopPropagation();
        gsap.fromTo(heroPeriod,
          { scale: 2.2, filter: 'brightness(2)' },
          { scale: 1, filter: 'brightness(1)', duration: 0.5, ease: 'elastic.out(1.2, 0.4)' }
        );

        const r = document.createElement('div');
        r.className = 'c-ripple';
        r.style.left = e.clientX + 'px';
        r.style.top = e.clientY + 'px';
        document.body.appendChild(r);
        gsap.fromTo(r,
          { scale: 0.5, opacity: 0.9 },
          { scale: 4, opacity: 0, duration: 0.5, ease: 'expo.out', onComplete: () => r.remove() }
        );

        showToast('SYS.BEACON: Winter Studio Core Online · 120 FPS Active', '#c084fc');
      });
    }

    // 6. Equalizer Frequency Ribbon Modulation
    const freqRibbon = document.querySelector('.hero-frequency-ribbon');
    const freqVal = document.getElementById('freqVal');
    const freqBars = document.getElementById('freqBars');
    const extraFreqs = ['432Hz', '528Hz', '639Hz', '741Hz', '852Hz', '963Hz'];
    let extraFreqIdx = 0;

    if (freqRibbon) {
      freqRibbon.addEventListener('click', () => {
        extraFreqIdx = (extraFreqIdx + 1) % extraFreqs.length;
        const nextFreq = extraFreqs[extraFreqIdx];
        if (freqVal) freqVal.textContent = nextFreq;

        if (freqBars) {
          gsap.fromTo(freqBars.querySelectorAll('span'),
            { scaleY: 0.2 },
            { scaleY: 1, duration: 0.35, stagger: 0.04, ease: 'elastic.out(1.2, 0.4)' }
          );
        }

        gsap.fromTo(freqRibbon,
          { scale: 0.94 },
          { scale: 1, duration: 0.3, ease: 'back.out(2)' }
        );

        showToast(`Equalizer Harmonic Tuned: ${nextFreq}`, '#10b981');
      });
    }
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