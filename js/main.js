(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hasFinePointer = window.matchMedia('(pointer: fine)');

  /* =============== Navbar =============== */
  const nav = document.getElementById('siteNav');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (nav) {
    const syncScrolled = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    syncScrolled();
    window.addEventListener('scroll', syncScrolled, { passive: true });
  }

  const setMenuOpen = (open) => {
    if (!navToggle || !navMenu) return;
    navMenu.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      setMenuOpen(navToggle.getAttribute('aria-expanded') !== 'true');
    });

    navMenu.addEventListener('click', (event) => {
      if (event.target.closest('a')) setMenuOpen(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 960) setMenuOpen(false);
    });
  }

  /* =============== Zalo link (chống bot quét số) =============== */
  document.querySelectorAll('a[data-zalo]').forEach((a) => {
    a.href = 'https://zalo.me/' + a.dataset.zalo.split('').reverse().join('');
  });

  /* =============== Anchor scrolling =============== */
  const getScrollTarget = (hash) => {
    if (!hash || !hash.startsWith('#') || hash.length < 2) return null;
    return document.getElementById(hash.slice(1));
  };

  const scrollToTarget = (target, smooth) => {
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const rect = target.getBoundingClientRect();
    const transform = getComputedStyle(target).transform;

    let offsetY = 0;
    if (transform && transform !== 'none') {
      offsetY = new DOMMatrixReadOnly(transform).m42;
    }

    const top = Math.max(0, rect.top + window.scrollY - offsetY - margin);
    window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
  };

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const hash = link.getAttribute('href');
    const target = getScrollTarget(hash);
    if (!target) return;

    event.preventDefault();
    setMenuOpen(false);

    history.pushState(null, '', hash);
    scrollToTarget(target, !prefersReducedMotion.matches);
  });

  if (window.location.hash) {
    const initialTarget = getScrollTarget(window.location.hash);
    if (initialTarget) {
      initialTarget.style.transition = 'none';
      initialTarget.classList.add('is-visible');
      void initialTarget.offsetHeight;
      initialTarget.style.transition = '';
      window.addEventListener(
        'load',
        () => requestAnimationFrame(() => scrollToTarget(initialTarget, false)),
        { once: true }
      );
    }
  }

  /* =============== Hero parallax =============== */
  const hero = document.querySelector('.hero');

  if (hero && hasFinePointer.matches && !prefersReducedMotion.matches) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frame = null;

    const step = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      hero.style.setProperty('--mx', currentX.toFixed(3));
      hero.style.setProperty('--my', currentY.toFixed(3));

      if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
        frame = requestAnimationFrame(step);
      } else {
        frame = null;
      }
    };

    window.addEventListener(
      'pointermove',
      (event) => {
        const rect = hero.getBoundingClientRect();
        if (event.clientY > rect.bottom) return;

        targetX = (event.clientX / window.innerWidth - 0.5) * 2;
        targetY = (event.clientY / window.innerHeight - 0.5) * 2;
        if (frame === null) frame = requestAnimationFrame(step);
      },
      { passive: true }
    );
  }

  /* =============== Custom cursor =============== */
  if (hasFinePointer.matches && !prefersReducedMotion.matches) {
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');

    if (dot && ring) {
      const root = document.documentElement;
      const hoverSelector = 'a, button, .projects_cards, .home-cert-card, .cert-card';

      let pointerX = window.innerWidth / 2;
      let pointerY = window.innerHeight / 2;
      let ringX = pointerX;
      let ringY = pointerY;
      let frame = null;
      let visible = false;

      const render = () => {
        ringX += (pointerX - ringX) * 0.16;
        ringY += (pointerY - ringY) * 0.16;

        dot.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;

        if (Math.abs(pointerX - ringX) > 0.1 || Math.abs(pointerY - ringY) > 0.1) {
          frame = requestAnimationFrame(render);
        } else {
          frame = null;
        }
      };

      window.addEventListener(
        'pointermove',
        (event) => {
          pointerX = event.clientX;
          pointerY = event.clientY;

          if (!visible) {
            visible = true;
            root.classList.add('has-custom-cursor');
          }
          if (frame === null) frame = requestAnimationFrame(render);
        },
        { passive: true }
      );

      document.addEventListener('mouseleave', () => {
        visible = false;
        root.classList.remove('has-custom-cursor');
      });

      document.addEventListener('mouseenter', () => {
        if (visible) root.classList.add('has-custom-cursor');
      });

      document.addEventListener(
        'pointerover',
        (event) => {
          if (event.target.closest(hoverSelector)) ring.classList.add('is-hover');
        },
        { passive: true }
      );

      document.addEventListener(
        'pointerout',
        (event) => {
          const from = event.target.closest(hoverSelector);
          const to = event.relatedTarget && event.relatedTarget.closest
            ? event.relatedTarget.closest(hoverSelector)
            : null;
          if (from && from !== to) ring.classList.remove('is-hover');
        },
        { passive: true }
      );
    }
  }
})();
