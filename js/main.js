/* ============================================================
   WINTER PORTFOLIO — REDESIGNED INTERACTIVE ENGINE
   Stack: Lenis Smooth Scroll + GSAP 3 + ScrollTrigger + Vanilla JS
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. MOTION PREFERENCE CHECK ─────────────────────────── */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 2. LENIS SMOOTH SCROLL & GSAP SYNC ─────────────────── */
  const lenis = new Lenis({
    lerp: prefersReduced ? 1 : 0.09,
    smoothTouch: false,
    wheelMultiplier: 0.95,
  });

  gsap.registerPlugin(ScrollTrigger);

  // Single ticker drives Lenis to prevent RAF race conditions
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.on('scroll', ScrollTrigger.update);

  /* ── 3. PRECISION CUSTOM CURSOR ─────────────────────────── */
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  const cursorTextEl = document.getElementById('cursorText');

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  const LERP_FACTOR = 0.14;
  const DOT_HALF = 3;
  let ringHalf = 21;

  if (ring) {
    ringHalf = ring.offsetWidth / 2 || 21;
    window.addEventListener('resize', () => {
      ringHalf = ring.offsetWidth / 2 || 21;
    }, { passive: true });
  }

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (dot) {
      dot.style.transform = `translate3d(${mouseX - DOT_HALF}px, ${mouseY - DOT_HALF}px, 0)`;
    }
  }, { passive: true });

  // Smooth ring follow inside GSAP ticker
  gsap.ticker.add(() => {
    if (!ring) return;
    ringX += (mouseX - ringX) * LERP_FACTOR;
    ringY += (mouseY - ringY) * LERP_FACTOR;
    ring.style.transform = `translate3d(${ringX - ringHalf}px, ${ringY - ringHalf}px, 0)`;
  });

  function setCursor(state, text = '') {
    document.body.classList.remove('c-hover', 'c-view', 'c-resume');
    if (state) document.body.classList.add(state);
    if (cursorTextEl) cursorTextEl.textContent = text;
  }

  // Click bounce & ripple
  window.addEventListener('mousedown', () => {
    if (ring && dot) {
      gsap.to(ring, { scale: 0.7, duration: 0.12, ease: 'power3.in' });
      gsap.to(dot, { scale: 2.2, duration: 0.12, ease: 'power3.in' });
    }
  });

  window.addEventListener('mouseup', () => {
    if (ring && dot) {
      gsap.to(ring, { scale: 1, duration: 0.5, ease: 'elastic.out(1.2, 0.4)' });
      gsap.to(dot, { scale: 1, duration: 0.25, ease: 'expo.out' });
    }
  });

  window.addEventListener('click', (e) => {
    const ripple = document.createElement('div');
    ripple.className = 'c-ripple';
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    document.body.appendChild(ripple);
    gsap.fromTo(ripple,
      { scale: 0.4, opacity: 0.9 },
      { scale: 4.8, opacity: 0, duration: 0.65, ease: 'expo.out', onComplete: () => ripple.remove() }
    );
  });

  // Attach hover states to interactive targets
  function bindCursorTargets() {
    document.querySelectorAll('a, button, .pillar-card, .skill-pill, .service-bento-card, .process-card, .chip').forEach((el) => {
      const customCursor = el.getAttribute('data-cursor');
      const isResume = el.classList.contains('nav-resume');

      el.addEventListener('mouseenter', () => {
        if (isResume) {
          setCursor('c-resume', '');
        } else if (customCursor) {
          setCursor('c-view', customCursor);
        } else {
          setCursor('c-hover', '');
        }
      });

      el.addEventListener('mouseleave', () => setCursor('', ''));
    });
  }
  bindCursorTargets();

  /* ── 4. LIGHTSABER SCROLL PROGRESS BAR ──────────────────── */
  (function initLightsaber() {
    const fill = document.getElementById('saberFill');
    const tip = document.getElementById('saberTip');
    if (!fill || !tip) return;

    let vw = window.innerWidth;
    window.addEventListener('resize', () => { vw = window.innerWidth; }, { passive: true });

    lenis.on('scroll', ({ scroll, limit }) => {
      if (limit <= 0) return;
      const progress = Math.min(Math.max(scroll / limit, 0), 1);
      fill.style.transform = `scaleX(${progress})`;
      tip.style.transform = `translate(${progress * vw - 3}px, -50%)`;
    });
  })();

  /* ── 5. NAVIGATION & ACTIVE SECTION HIGHLIGHT ───────────── */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  lenis.on('scroll', ({ scroll }) => {
    if (navbar) {
      navbar.classList.toggle('scrolled', scroll > 50);
    }
  });

  // Smooth scroll click handler
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        lenis.scrollTo(targetElement, {
          offset: -40,
          duration: 1.5,
          easing: (t) => 1 - Math.pow(1 - t, 4),
        });
        // Close mobile drawer if open
        closeMobileMenu();
      }
    });
  });

  // Active section indicator using IntersectionObserver
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const currentId = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.dataset.section === currentId);
          });
        }
      });
    },
    { threshold: 0.3 }
  );
  sections.forEach((sec) => sectionObserver.observe(sec));

  /* ── 6. MOBILE DRAWER MENU ──────────────────────────────── */
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileCloseBtn = document.getElementById('mobileCloseBtn');

  function openMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    gsap.fromTo('.mobile-links li',
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, stagger: 0.08, duration: 0.5, ease: 'expo.out' }
    );
  }

  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (navToggle) navToggle.addEventListener('click', openMobileMenu);
  if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMobileMenu);

  /* ── 7. AMBIENT GLOW THEME SWITCHER ─────────────────────── */
  const themes = [
    { id: 'theme-aurora', label: 'Cyan / Aura' },
    { id: 'theme-cyber',  label: 'Violet / Cyber' },
    { id: 'theme-gold',   label: 'Gold / Luxe' },
    { id: 'theme-emerald',label: 'Emerald / Matrix' }
  ];
  let currentThemeIdx = 0;
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeNameLabel = document.getElementById('themeNameLabel');

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      currentThemeIdx = (currentThemeIdx + 1) % themes.length;
      const nextTheme = themes[currentThemeIdx];

      // Remove existing themes
      themes.forEach((t) => document.body.classList.remove(t.id));
      document.body.classList.add(nextTheme.id);

      if (themeNameLabel) {
        themeNameLabel.textContent = nextTheme.label;
      }

      showToast(`Switched atmosphere to ${nextTheme.label}`);
    });
  }

  /* ── 8. LIVE LOCAL TIME CLOCK (NELLORE, INDIA - IST) ─────── */
  function updateLiveClock() {
    const clockEl = document.getElementById('heroClock');
    if (!clockEl) return;
    const now = new Date();
    // Format in IST (UTC +5:30)
    const options = {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    clockEl.textContent = `${now.toLocaleTimeString('en-US', options)} IST`;
  }
  updateLiveClock();
  setInterval(updateLiveClock, 1000);

  /* ── 9. HERO INTERACTIVE 3D CARD STACK ──────────────────── */
  (function initCardDeck() {
    const stack = document.getElementById('cardStack');
    if (!stack) return;

    const cards = Array.from(stack.querySelectorAll('.stack-card'));
    const dots = document.querySelectorAll('.deck-dot');
    let activeCardIndex = 2; // Front card initially

    // Entrance stagger
    gsap.from(cards, {
      y: 40,
      opacity: 0,
      rotation: 0,
      duration: 1.2,
      ease: 'expo.out',
      stagger: 0.15,
      delay: 0.5
    });

    // 3D Tilt on Hover
    stack.addEventListener('mousemove', (e) => {
      const rect = stack.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      const frontCard = stack.querySelector('.card-front');
      if (frontCard) {
        gsap.to(frontCard, {
          rotationX: -dy * 10,
          rotationY: dx * 10,
          transformPerspective: 1000,
          duration: 0.35,
          ease: 'power2.out'
        });
      }
    });

    stack.addEventListener('mouseleave', () => {
      const frontCard = stack.querySelector('.card-front');
      if (frontCard) {
        gsap.to(frontCard, {
          rotationX: 0,
          rotationY: 0,
          duration: 0.8,
          ease: 'elastic.out(1, 0.4)'
        });
      }
      setCursor('', '');
    });

    // Click to cycle cards in stack
    function cycleStack() {
      // Rotate classes: back -> mid, mid -> front, front -> back
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

      // Update dots indicator
      activeCardIndex = (activeCardIndex + 1) % 3;
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === activeCardIndex);
      });

      // Quick feedback animation
      gsap.fromTo(cMid,
        { scale: 0.92, y: 15 },
        { scale: 1, y: 0, duration: 0.6, ease: 'expo.out' }
      );
    }

    stack.addEventListener('click', cycleStack);
  })();

  /* ── 10. ABOUT PHOTO 3D GYROSCOPE TILT ──────────────────── */
  (function initAboutPortrait() {
    const wrap = document.getElementById('aboutImgWrap');
    const frame = document.getElementById('aboutImgFrame');
    if (!wrap || !frame) return;

    wrap.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      gsap.to(frame, {
        rotationX: -dy * 12,
        rotationY: dx * 12,
        transformPerspective: 1100,
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

  /* ── 11. INTERACTIVE CAPABILITY TABS (ABOUT) ─────────────── */
  (function initCapsTabs() {
    const tabs = document.querySelectorAll('.caps-tab');
    const panels = document.querySelectorAll('.caps-panel');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const cat = tab.dataset.category;
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        panels.forEach((panel) => {
          if (panel.id === `panel-${cat}`) {
            panel.classList.add('active');
            gsap.fromTo(panel.querySelectorAll('.skill-pill'),
              { opacity: 0, y: 15, scale: 0.95 },
              { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.5)', stagger: 0.04 }
            );
          } else {
            panel.classList.remove('active');
          }
        });
      });
    });
  })();

  /* ── 12. SERVICES BENTO SPOTLIGHT EFFECT ─────────────────── */
  document.querySelectorAll('.service-bento-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  /* ── 13. SELECTED WORKS FILTER SYSTEM ───────────────────── */
  (function initWorksFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const allWorkCards = document.querySelectorAll('.work-feat-card, .work-grid-card');

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        filterBtns.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        allWorkCards.forEach((card) => {
          const category = card.dataset.category;
          const shouldShow = filter === 'all' || category === filter;

          if (shouldShow) {
            gsap.to(card, {
              opacity: 1,
              scale: 1,
              duration: 0.4,
              ease: 'expo.out',
              display: 'flex',
              clearProps: 'transform'
            });
          } else {
            gsap.to(card, {
              opacity: 0,
              scale: 0.94,
              duration: 0.3,
              ease: 'power2.in',
              onComplete: () => {
                card.style.display = 'none';
              }
            });
          }
        });

        // Refresh triggers on layout update
        setTimeout(() => ScrollTrigger.refresh(), 350);
      });
    });
  })();

  /* ── 14. ONE-CLICK EMAIL COPY & TOAST NOTIFICATION ───────── */
  const copyBtn = document.getElementById('copyEmailBtn');
  const toast = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMsg');
  const emailLink = document.getElementById('contactEmailLink');
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    if (toastMsg) toastMsg.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  function copyEmailToClipboard(e) {
    e.preventDefault();
    const email = 'saikrishnam966@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
      showToast('Copied saikrishnam966@gmail.com to clipboard! 📋');
      if (copyBtn) {
        gsap.to(copyBtn, { scale: 1.25, duration: 0.15, yoyo: true, repeat: 1 });
      }
    }).catch(() => {
      // Fallback
      window.location.href = `mailto:${email}`;
    });
  }

  if (copyBtn) copyBtn.addEventListener('click', copyEmailToClipboard);
  if (emailLink) {
    emailLink.addEventListener('click', (e) => {
      // On click, show toast feedback too
      showToast('Opening mail client for saikrishnam966@gmail.com');
    });
  }

  /* ── 15. CONTACT FORM & CATEGORY CHIPS ──────────────────── */
  (function initContactForm() {
    const chips = document.querySelectorAll('.chip');
    const projectTypeInput = document.getElementById('projectTypeInput');
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('formBtn');

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        if (projectTypeInput) {
          projectTypeInput.value = chip.dataset.val;
        }
      });
    });

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!form.checkValidity()) {
          showToast('Please fill in all required fields.');
          return;
        }

        const nameInput = document.getElementById('fname');
        const senderName = nameInput ? nameInput.value : 'Friend';

        if (submitBtn) {
          const btnText = submitBtn.querySelector('.btn-text');
          if (btnText) btnText.textContent = 'Transmitting...';
          gsap.to(submitBtn, { scale: 0.96, duration: 0.1 });

          setTimeout(() => {
            if (btnText) btnText.textContent = 'Transmission Sent ✓';
            gsap.to(submitBtn, { scale: 1, duration: 0.3 });
            showToast(`Thank you ${senderName}! Message received. Response within 24h.`);
            form.reset();

            setTimeout(() => {
              if (btnText) btnText.textContent = 'Transmit Message';
            }, 4000);
          }, 1000);
        }
      });
    }
  })();

  /* ── 16. BACK TO TOP BUTTON ─────────────────────────────── */
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      lenis.scrollTo(0, {
        duration: 1.8,
        easing: (t) => 1 - Math.pow(1 - t, 4),
      });
    });
  }

  /* ── 17. DYNAMIC COPYRIGHT YEAR ─────────────────────────── */
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ── 18. GSAP STAGGER REVEAL ORCHESTRATION ──────────────── */
  if (!prefersReduced) {
    // Hero Entrance
    gsap.fromTo('.hero-section .reveal-item',
      { opacity: 0, y: 45 },
      {
        opacity: 1,
        y: 0,
        duration: 1.15,
        ease: 'expo.out',
        stagger: 0.12,
        delay: 0.2
      }
    );

    // Section reveal on scroll
    document.querySelectorAll('.section:not(.hero-section)').forEach((section) => {
      const items = section.querySelectorAll('.reveal-item');
      if (!items.length) return;

      gsap.fromTo(items,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'expo.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: section,
            start: 'top 78%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    });

    // Big section background numbers parallax
    document.querySelectorAll('.section-number-bg').forEach((num) => {
      gsap.fromTo(num,
        { y: 35 },
        {
          y: -35,
          ease: 'none',
          scrollTrigger: {
            trigger: num.parentElement,
            scrub: 2
          }
        }
      );
    });
  } else {
    // If user prefers reduced motion, make all items immediately visible
    document.querySelectorAll('.reveal-item').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  /* ── 19. WINDOW LOAD REFRESH ────────────────────────────── */
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });

})();
