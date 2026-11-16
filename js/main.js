/* ============================================================
   WINTER PORTFOLIO — ADVANCED INTERACTIVE ENGINE (V3)
   8 Designer Themes · Interactive Case Studies · Dual-Mode Works
   ============================================================ */

(function () {
  'use strict';

  /* ── 1. MOTION PREFERENCE & DEVICE DETECTION ────────────── */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  /* ── 2. LENIS SMOOTH SCROLL & GSAP SYNC ─────────────────── */
  const lenis = new Lenis({
    lerp: prefersReduced ? 1 : 0.1,
    smoothTouch: false,
  });

  gsap.registerPlugin(ScrollTrigger);

  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.on('scroll', ScrollTrigger.update);

  /* ── 3. PRECISION CUSTOM CURSOR ─────────────────────────── */
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  const cursorTextEl = document.getElementById('cursorText');

  if (isTouchDevice) {
    if (dot) dot.style.display = 'none';
    if (ring) ring.style.display = 'none';
  } else {
    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    const LERP_FACTOR = 0.16;
    const DOT_HALF = 3;
    let ringHalf = 20;

    if (ring) {
      ringHalf = ring.offsetWidth / 2 || 20;
      window.addEventListener('resize', () => {
        ringHalf = ring.offsetWidth / 2 || 20;
      }, { passive: true });
    }

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dot) {
        dot.style.transform = `translate3d(${mouseX - DOT_HALF}px, ${mouseY - DOT_HALF}px, 0)`;
      }
    }, { passive: true });

    gsap.ticker.add(() => {
      if (!ring) return;
      ringX += (mouseX - ringX) * LERP_FACTOR;
      ringY += (mouseY - ringY) * LERP_FACTOR;
      ring.style.transform = `translate3d(${ringX - ringHalf}px, ${ringY - ringHalf}px, 0)`;
    });

    window.setCursor = function (state, text = '') {
      document.body.classList.remove('c-hover', 'c-view', 'c-resume');
      if (state) document.body.classList.add(state);
      if (cursorTextEl) cursorTextEl.textContent = text;
    };

    function bindInteractiveCursor() {
      document.querySelectorAll('a, button, .pillar-card, .skill-pill, .service-bento-card, .process-card, .chip, .work-feat-card, .work-grid-card, .editorial-list-row').forEach((el) => {
        const customCursor = el.getAttribute('data-cursor');
        const isResume = el.classList.contains('nav-resume');

        el.addEventListener('mouseenter', () => {
          if (isResume) {
            window.setCursor('c-resume', '');
          } else if (customCursor) {
            window.setCursor('c-view', customCursor);
          } else {
            window.setCursor('c-hover', '');
          }
        });

        el.addEventListener('mouseleave', () => window.setCursor('', ''));
      });
    }
    bindInteractiveCursor();
    window.bindInteractiveCursor = bindInteractiveCursor;
  }

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
      tip.style.transform = `translate3d(${progress * vw - 2.5}px, -50%, 0)`;
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

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        lenis.scrollTo(targetElement, {
          offset: -40,
          duration: 1.4,
          easing: (t) => 1 - Math.pow(1 - t, 4),
        });
        closeMobileMenu();
      }
    });
  });

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

  /* ── 7. 8 COMPLETE DESIGNER THEMES (COLOR PALETTES) ────── */
  const themes = [
    { id: 'theme-aurora',   name: 'Cyan Aurora',     dot: '#38bdf8', desc: 'Electric Cyan & Indigo' },
    { id: 'theme-cyber',    name: 'Cyber Violet',    dot: '#c084fc', desc: 'Neon Violet & Hyper Pink' },
    { id: 'theme-emerald',  name: 'Emerald Matrix',  dot: '#34d399', desc: 'Bio-Mint & Deep Teal' },
    { id: 'theme-gold',     name: 'Solar Sunset',    dot: '#fbbf24', desc: 'Obsidian Amber & Bronze' },
    { id: 'theme-crimson',  name: 'Crimson Noir',    dot: '#fb7185', desc: 'Blood Rose & Coral' },
    { id: 'theme-sapphire', name: 'Midnight Blue',   dot: '#60a5fa', desc: 'Abyssal Royal Cobalt' },
    { id: 'theme-tokyo',    name: 'Tokyo Neon',      dot: '#a3e635', desc: 'Toxic Lime & Cyan' },
    { id: 'theme-mono',     name: 'Titanium Mono',   dot: '#ffffff', desc: 'Diamond White & Chrome' }
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
        { scale: 1, duration: 0.4, ease: 'back.out(2)' }
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

  /* ── 8. HERO ROTATING TITLE KEYWORD ─────────────────────── */
  (function initHeroRotator() {
    const rotator = document.getElementById('rotatorLabel');
    if (!rotator) return;

    const phrases = [
      'MOTION & FILM DIRECTION',
      'UI/UX ARCHITECTURE',
      'CREATIVE DEVELOPMENT',
      'NEXT.JS & GSAP SYSTEMS',
      'BRAND IDENTITY SYSTEMS'
    ];
    let phraseIdx = 0;

    setInterval(() => {
      phraseIdx = (phraseIdx + 1) % phrases.length;
      gsap.to(rotator, {
        opacity: 0,
        y: -10,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          rotator.textContent = phrases[phraseIdx];
          gsap.fromTo(rotator,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'expo.out' }
          );
        }
      });
    }, 2800);
  })();

  /* ── 9. LIVE CLOCK (NELLORE, INDIA - IST) ────────────────── */
  function updateLiveClock() {
    const clockEl = document.getElementById('heroClock');
    if (!clockEl) return;
    const now = new Date();
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

  /* ── 10. HERO INTERACTIVE 3D CARD STACK ─────────────────── */
  (function initCardDeck() {
    const stack = document.getElementById('cardStack');
    if (!stack) return;

    const cards = Array.from(stack.querySelectorAll('.stack-card'));
    const dots = document.querySelectorAll('.deck-dot');
    let activeCardIndex = 2;

    gsap.from(cards, {
      y: 30,
      opacity: 0,
      duration: 0.9,
      ease: 'expo.out',
      stagger: 0.1,
      delay: 0.2
    });

    if (!isTouchDevice) {
      stack.addEventListener('mousemove', (e) => {
        const rect = stack.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);

        const frontCard = stack.querySelector('.card-front');
        if (frontCard) {
          frontCard.style.transform = `rotate(-1deg) rotateX(${-dy * 8}deg) rotateY(${dx * 8}deg) translateZ(0)`;
        }
      }, { passive: true });

      stack.addEventListener('mouseleave', () => {
        const frontCard = stack.querySelector('.card-front');
        if (frontCard) {
          frontCard.style.transform = 'rotate(-1deg) translateY(0) scale(1)';
        }
        if (window.setCursor) window.setCursor('', '');
      });
    }

    function cycleStack() {
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

      activeCardIndex = (activeCardIndex + 1) % 3;
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === activeCardIndex);
      });
    }

    stack.addEventListener('click', () => {
      cycleStack();
      if (isTouchDevice) {
        stack.classList.add('fanned');
        setTimeout(() => stack.classList.remove('fanned'), 1200);
      }
    });
  })();

  /* ── 11. COMPLETE PROJECT DATABASE ──────────────────────── */
  const projectsData = [
    {
      id: 'ecommerce-platform',
      title: 'E-Commerce Platform',
      category: 'web',
      categoryLabel: 'WEB DEVELOPMENT · FULL-STACK',
      year: '2024',
      client: 'Luxora Global Retail',
      role: 'Lead Full-Stack & UI Architect',
      metricVal: '+340% CONVERSIONS',
      metricLbl: 'Revenue & Speed Transformation',
      desc: 'Architected and built a high-frequency headless retail portal using Next.js 15 App Router, TypeScript, and Stripe API. Designed instantaneous sub-100ms page transitions, an optimistic real-time cart state, and custom checkout flows resulting in a massive boost in completed sales.',
      techStack: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'Stripe API', 'GSAP', 'Zustand'],
      image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=1000&fit=crop&q=80&auto=format',
      link: '#'
    },
    {
      id: 'brand-identity',
      title: 'Brand Identity System',
      category: 'design',
      categoryLabel: 'UI/UX DESIGN · DESIGN SYSTEM',
      year: '2024',
      client: 'Aethelgard Maison',
      role: 'Creative Director & Brand Architect',
      metricVal: 'AWARD FINALIST',
      metricLbl: 'Selected by Design Excellence Jury',
      desc: 'Holistic brand overhaul and unified digital design system for an artisanal luxury house. Delivered an exhaustive Figma token hierarchy, responsive UI component kit with 200+ variants, typography pairing matrix, and multi-channel style playbook.',
      techStack: ['Figma Tokens', 'Typography Matrix', 'Color Theory', 'Design Systems', 'Micro-Interactions'],
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1000&fit=crop&q=80&auto=format',
      link: '#'
    },
    {
      id: 'motion-reel',
      title: 'Motion Reel 2024',
      category: 'video',
      categoryLabel: 'VIDEO PRODUCTION · 4K REEL',
      year: '2024',
      client: 'Winter Studios Anthology',
      role: 'Director, Editor & Colorist',
      metricVal: '1.2M+ VIEWS',
      metricLbl: 'Viral Engagement Across Channels',
      desc: 'A dynamic 84-second cinematic showreel spotlighting commercial edits, 3D typography, kinetic titles, and DaVinci Resolve color grading. Packed with sound design and multi-layered visual rhythm engineered for high viewer retention.',
      techStack: ['After Effects', 'Premiere Pro', 'DaVinci Resolve', 'Cinema 4D', 'Sound Design'],
      image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1000&fit=crop&q=80&auto=format',
      link: '#'
    },
    {
      id: 'banking-app',
      title: 'Neo-Banking Mobile App',
      category: 'design',
      categoryLabel: 'UI/UX DESIGN · FINTECH',
      year: '2024',
      client: 'Strata Wealth Technologies',
      role: 'Senior Product Designer',
      metricVal: '4.9★ APP RATING',
      metricLbl: 'Featured in Fintech Product Week',
      desc: 'Human-centered mobile interface designed for next-generation personal wealth management. Featuring biometric verification, visual spending projections, live portfolio distribution graphs, and instantaneous multi-currency conversion flows.',
      techStack: ['Mobile UI/UX', 'iOS / Android', 'Design Tokens', 'User Research', 'Figma Prototyping'],
      image: 'https://images.unsplash.com/photo-1512941937938-a272e52dc9af?w=1000&fit=crop&q=80&auto=format',
      link: '#'
    },
    {
      id: 'nandini-portfolio',
      title: 'Nandini — Dev Portfolio',
      category: 'web',
      categoryLabel: 'CREATIVE DEVELOPMENT · GSAP',
      year: '2024',
      client: 'Nandini Developer',
      role: 'Creative Engineer & UI Designer',
      metricVal: '100 LIGHTHOUSE',
      metricLbl: 'Flawless 60fps & Web Accessibility',
      desc: 'Custom interactive developer portfolio website engineered with fluid micro-animations, GSAP ScrollTrigger, Lenis smooth scrolling, and responsive layout architecture. Fully deployed on Vercel with zero performance degradation.',
      techStack: ['React', 'GSAP ScrollTrigger', 'Lenis Smooth Scroll', 'Tailwind CSS', 'Vercel Deployment'],
      image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=1000&fit=crop&q=80&auto=format',
      link: 'https://nandini-portfolio-bay.vercel.app/'
    },
    {
      id: 'documentary-short',
      title: 'Documentary Short Film',
      category: 'video',
      categoryLabel: 'VIDEO EDITING · CINEMATOGRAPHY',
      year: '2023',
      client: 'Heritage Craft Collective',
      role: 'Cinematographer & Lead Editor',
      metricVal: 'OFFICIAL SELECTION',
      metricLbl: 'Indie Visual Arts Film Festival',
      desc: 'Atmospheric visual chronicle capturing the vanishing art of hand-crafted ceramics and analog textiles. Shot on 4K anamorphic lenses with rich tactile color palettes and authentic acoustic soundscapes.',
      techStack: ['4K Anamorphic', 'Color Grading', 'Documentary Direction', 'Audio Mastering'],
      image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1000&fit=crop&q=80&auto=format',
      link: '#'
    }
  ];

  /* ── 12. CASE STUDY MODAL LOGIC ─────────────────────────── */
  const projectModal = document.getElementById('projectModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalImg = document.getElementById('modalImg');
  const modalCategory = document.getElementById('modalCategory');
  const modalTitle = document.getElementById('modalTitle');
  const modalMetricVal = document.getElementById('modalMetricVal');
  const modalMetricLbl = document.getElementById('modalMetricLbl');
  const modalDesc = document.getElementById('modalDesc');
  const modalClient = document.getElementById('modalClient');
  const modalRole = document.getElementById('modalRole');
  const modalLiveLink = document.getElementById('modalLiveLink');
  const modalTechStack = document.getElementById('modalTechStack');
  const modalShareBtn = document.getElementById('modalShareBtn');

  function openProjectModal(projectId) {
    const project = projectsData.find((p) => p.id === projectId) || projectsData[0];

    if (modalImg) {
      modalImg.src = project.image;
      modalImg.alt = project.title;
    }
    if (modalCategory) modalCategory.textContent = `${project.categoryLabel} · ${project.year}`;
    if (modalTitle) modalTitle.textContent = project.title;
    if (modalMetricVal) modalMetricVal.textContent = project.metricVal;
    if (modalMetricLbl) modalMetricLbl.textContent = project.metricLbl;
    if (modalDesc) modalDesc.textContent = project.desc;
    if (modalClient) modalClient.textContent = project.client;
    if (modalRole) modalRole.textContent = project.role;

    if (modalLiveLink) {
      if (project.link && project.link !== '#') {
        modalLiveLink.href = project.link;
        modalLiveLink.style.display = 'inline-flex';
      } else {
        modalLiveLink.href = '#';
        modalLiveLink.style.display = 'inline-flex';
      }
    }

    if (modalTechStack) {
      modalTechStack.innerHTML = project.techStack
        .map((tag) => `<span class="modal-tech-tag">${tag}</span>`)
        .join('');
    }

    projectModal.classList.add('open');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    if (!projectModal) return;
    projectModal.classList.remove('open');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProjectModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeProjectModal);

  if (modalShareBtn) {
    modalShareBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href);
      showToast('Project link copied to clipboard! 🔗');
    });
  }

  // Attach click listener on all work cards
  document.querySelectorAll('[data-project-id]').forEach((card) => {
    card.addEventListener('click', (e) => {
      // If clicking link inside card, allow link
      if (e.target.tagName.toLowerCase() === 'a' && e.target.getAttribute('href') !== '#') {
        return;
      }
      e.preventDefault();
      const pId = card.getAttribute('data-project-id');
      openProjectModal(pId);
    });
  });

  /* ── 13. SHOWREEL MODAL LOGIC ───────────────────────────── */
  const showreelModal = document.getElementById('showreelModal');
  const showreelBackdrop = document.getElementById('showreelBackdrop');
  const showreelCloseBtn = document.getElementById('showreelCloseBtn');
  const openShowreelBtn = document.getElementById('openShowreelBtn');

  function openShowreel() {
    if (!showreelModal) return;
    showreelModal.classList.add('open');
    showreelModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeShowreel() {
    if (!showreelModal) return;
    showreelModal.classList.remove('open');
    showreelModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (openShowreelBtn) openShowreelBtn.addEventListener('click', openShowreel);
  if (showreelCloseBtn) showreelCloseBtn.addEventListener('click', closeShowreel);
  if (showreelBackdrop) showreelBackdrop.addEventListener('click', closeShowreel);

  // Global ESC key listener for both modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProjectModal();
      closeShowreel();
      closeMobileMenu();
    }
  });

  /* ── 14. WORKS VIEW SWITCHER (GRID VS EDITORIAL LIST) ───── */
  const viewGridBtn = document.getElementById('viewGridBtn');
  const viewListBtn = document.getElementById('viewListBtn');
  const worksGridView = document.getElementById('worksGridView');
  const worksListView = document.getElementById('worksListView');
  const editorialListBody = document.getElementById('editorialListBody');
  const listHoverPreview = document.getElementById('listHoverPreview');
  const listHoverImg = document.getElementById('listHoverImg');

  function renderEditorialList(filter = 'all') {
    if (!editorialListBody) return;
    const filtered = filter === 'all'
      ? projectsData
      : projectsData.filter((p) => p.category === filter);

    editorialListBody.innerHTML = filtered.map((p) => `
      <div class="editorial-list-row" data-project-id="${p.id}" data-category="${p.category}" data-cursor="VIEW">
        <span class="erow-title">${p.title}</span>
        <span class="erow-cat">${p.categoryLabel.split('·')[0].trim()}</span>
        <span class="erow-year">${p.year}</span>
        <span class="erow-deliverable">${p.metricVal}</span>
        <span class="erow-action">Inspect ↗</span>
      </div>
    `).join('');

    // Attach row events
    editorialListBody.querySelectorAll('.editorial-list-row').forEach((row) => {
      const pId = row.dataset.projectId;
      const proj = projectsData.find((p) => p.id === pId);

      row.addEventListener('click', () => openProjectModal(pId));

      if (!isTouchDevice && listHoverPreview && listHoverImg) {
        row.addEventListener('mouseenter', () => {
          if (proj) {
            listHoverImg.src = proj.image;
            listHoverPreview.classList.add('active');
          }
        });

        row.addEventListener('mousemove', (e) => {
          listHoverPreview.style.left = `${e.clientX + 30}px`;
          listHoverPreview.style.top = `${e.clientY - 40}px`;
        });

        row.addEventListener('mouseleave', () => {
          listHoverPreview.classList.remove('active');
        });
      }
    });

    if (window.bindInteractiveCursor) window.bindInteractiveCursor();
  }

  if (viewGridBtn && viewListBtn) {
    viewGridBtn.addEventListener('click', () => {
      viewGridBtn.classList.add('active');
      viewListBtn.classList.remove('active');
      if (worksGridView) worksGridView.classList.remove('hidden');
      if (worksListView) worksListView.classList.remove('active');
      ScrollTrigger.refresh();
    });

    viewListBtn.addEventListener('click', () => {
      viewListBtn.classList.add('active');
      viewGridBtn.classList.remove('active');
      if (worksGridView) worksGridView.classList.add('hidden');
      if (worksListView) worksListView.classList.add('active');
      renderEditorialList(getActiveFilter());
      ScrollTrigger.refresh();
    });
  }

  function getActiveFilter() {
    const activeBtn = document.querySelector('.filter-btn.active');
    return activeBtn ? activeBtn.dataset.filter : 'all';
  }

  /* ── 15. WORKS FILTER SYSTEM ────────────────────────────── */
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

        // Filter Grid View
        allWorkCards.forEach((card) => {
          const category = card.dataset.category;
          const shouldShow = filter === 'all' || category === filter;
          card.style.display = shouldShow ? 'flex' : 'none';
        });

        // Filter List View if active
        if (worksListView && worksListView.classList.contains('active')) {
          renderEditorialList(filter);
        }

        ScrollTrigger.refresh();
      });
    });
  })();

  /* ── 16. ONE-CLICK EMAIL COPY & TOAST NOTIFICATION ───────── */
  const copyBtn = document.getElementById('copyEmailBtn');
  const emailLink = document.getElementById('contactEmailLink');

  function copyEmailToClipboard(e) {
    e.preventDefault();
    const email = 'saikrishnam966@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
      showToast('Copied saikrishnam966@gmail.com to clipboard! 📋');
    }).catch(() => {
      window.location.href = `mailto:${email}`;
    });
  }

  if (copyBtn) copyBtn.addEventListener('click', copyEmailToClipboard);
  if (emailLink) {
    emailLink.addEventListener('click', () => {
      showToast('Opening mail client for saikrishnam966@gmail.com');
    });
  }

  /* ── 17. CONTACT FORM & CATEGORY CHIPS ──────────────────── */
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
          if (btnText) btnText.textContent = 'Transmission Sent ✓';
          showToast(`Thank you ${senderName}! Message received.`);
          form.reset();

          setTimeout(() => {
            if (btnText) btnText.textContent = 'Transmit Message';
          }, 3500);
        }
      });
    }
  })();

  /* ── 18. CAPABILITY TABS (ABOUT) ────────────────────────── */
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
          } else {
            panel.classList.remove('active');
          }
        });
      });
    });
  })();

  /* ── 18.5 ABOUT PHOTO 3D TILT & TOUCH INTERACTION ─────────── */
  (function initAboutPortrait() {
    const wrap = document.getElementById('aboutImgWrap');
    const frame = document.getElementById('aboutImgFrame');
    if (!wrap || !frame) return;

    if (!isTouchDevice) {
      wrap.addEventListener('mousemove', (e) => {
        const rect = wrap.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);

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

    // Touch devices: tap to toggle active state & effects
    wrap.addEventListener('click', () => {
      wrap.classList.toggle('touch-active');
    });

    document.addEventListener('touchstart', (e) => {
      if (!wrap.contains(e.target)) {
        wrap.classList.remove('touch-active');
      }
    }, { passive: true });
  })();

  /* ── 19. BACK TO TOP BUTTON ─────────────────────────────── */
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      lenis.scrollTo(0, {
        duration: 1.4,
        easing: (t) => 1 - Math.pow(1 - t, 4),
      });
    });
  }

  /* ── 20. DYNAMIC COPYRIGHT YEAR ─────────────────────────── */
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ── 21. GSAP ENTRANCE & SCROLL REVEALS ─────────────────── */
  if (!prefersReduced) {
    gsap.fromTo('.hero-section .reveal-item',
      { opacity: 0, y: 35 },
      {
        opacity: 1,
        y: 0,
        duration: 0.95,
        ease: 'expo.out',
        stagger: 0.1,
        delay: 0.15
      }
    );

    document.querySelectorAll('.section:not(.hero-section)').forEach((section) => {
      const items = section.querySelectorAll('.reveal-item');
      if (!items.length) return;

      gsap.fromTo(items,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: 'expo.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: section,
            start: 'top 82%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    });
  } else {
    document.querySelectorAll('.reveal-item').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  /* ── 22. WINDOW LOAD REFRESH ────────────────────────────── */
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });

})();
