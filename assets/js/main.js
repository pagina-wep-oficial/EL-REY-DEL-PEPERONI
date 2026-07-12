(() => {
  'use strict';

  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    const closeNav = () => {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.textContent = '☰';
    };

    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.textContent = isOpen ? '×' : '☰';
    });

    navMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNav));
    window.addEventListener('resize', () => {
      if (window.innerWidth > 980) closeNav();
    });
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeLightbox = document.getElementById('closeLightbox');

  if (lightbox && lightboxImg && closeLightbox) {
    const openLightbox = (src, alt) => {
      lightboxImg.src = src;
      lightboxImg.alt = alt || 'Pizza ampliada';
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const hideLightbox = () => {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      lightboxImg.removeAttribute('src');
      document.body.style.overflow = '';
    };

    document.querySelectorAll('[data-full]').forEach((button) => {
      button.addEventListener('click', () => {
        const image = button.querySelector('img');
        openLightbox(button.dataset.full, image?.alt);
      });
    });

    closeLightbox.addEventListener('click', hideLightbox);
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) hideLightbox();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && lightbox.classList.contains('open')) hideLightbox();
    });
  }

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealItems.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('visible'));
  }
})();
