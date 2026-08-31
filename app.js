// preloader: fade out once the page has loaded, fade back in before leaving for another page on this site
(function () {
  const TRANSITION_MS = 400;
  const started = Date.now();
  const reveal = () => {
    const wait = Math.max(TRANSITION_MS - (Date.now() - started), 0);
    setTimeout(() => document.body.classList.add('loaded'), wait);
  };
  if (document.readyState === 'complete') reveal();
  else addEventListener('load', reveal);

  document.addEventListener('click', (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) return;
    let url;
    try { url = new URL(href, location.href); } catch { return; }
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.hash) return;
    e.preventDefault();
    document.body.classList.remove('loaded');
    setTimeout(() => { location.href = url.href; }, TRANSITION_MS);
  });
})();

// sticky header: shadow + transparent-over-hero crossfade
const nav = document.getElementById('nav');
if (nav) {
  const heroEl = document.querySelector('.hero, .subhero');
  const updateNav = () => {
    nav.classList.toggle('scrolled', scrollY > 10);
    if (heroEl) {
      const threshold = Math.max(heroEl.offsetHeight - 90, 80);
      nav.classList.toggle('nav-transparent', scrollY < threshold);
    }
  };
  addEventListener('scroll', updateNav, { passive: true });
  updateNav();
}

// FAQ accordion
document.querySelectorAll('.faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.parentElement;
    const open = item.classList.contains('open');
    item.parentElement.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!open) item.classList.add('open');
  });
});

// reveal on scroll, staggered per sibling group so grids cascade in
const revealEls = Array.from(document.querySelectorAll('.reveal'));
const groups = new Map();
revealEls.forEach(el => {
  const p = el.parentElement;
  if (!groups.has(p)) groups.set(p, []);
  groups.get(p).push(el);
});
groups.forEach(list => {
  list.forEach((el, i) => el.style.setProperty('--d', Math.min(i * 0.08, 0.4) + 's'));
});
// toggles both ways: reveal scrolling down into view, hide scrolling back past it
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => e.target.classList.toggle('in', e.isIntersecting));
}, { threshold: .12 });
revealEls.forEach(el => io.observe(el));

// subtle parallax on hero / subhero background media
const parallaxEls = document.querySelectorAll('.hero-bg, .subhero-bg');
if (parallaxEls.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const onParallax = () => {
    const y = Math.min(scrollY, 600) * 0.08;
    parallaxEls.forEach(el => { el.style.transform = `translateY(${y}px)`; });
  };
  addEventListener('scroll', onParallax, { passive: true });
  onParallax();
}

// ambient rising bubbles in dark/navy sections -- injected here rather than
// hand-authored per page so every matching section gets them automatically
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.hero, .subhero, .cta-band, .oc-band, .finance, .compare, .social').forEach(section => {
    const field = document.createElement('div');
    field.className = 'bubble-field';
    const count = 9;
    for (let i = 0; i < count; i++) {
      const b = document.createElement('span');
      b.className = 'bubble';
      const size = 6 + Math.random() * 16;
      b.style.setProperty('--s', size.toFixed(1) + 'px');
      b.style.setProperty('--x', (Math.random() * 100).toFixed(1) + '%');
      b.style.setProperty('--drift', (Math.random() * 40 - 20).toFixed(0) + 'px');
      b.style.setProperty('--dur', (9 + Math.random() * 10).toFixed(1) + 's');
      b.style.setProperty('--delay', (-Math.random() * 18).toFixed(1) + 's');
      field.appendChild(b);
    }
    section.appendChild(field);
  });
}

// podcast / featured video player: hide the play badge once playback starts
document.querySelectorAll('.podcast-player').forEach(player => {
  const video = player.querySelector('video');
  if (!video) return;
  video.addEventListener('play', () => player.classList.add('is-playing'));
  video.addEventListener('pause', () => player.classList.remove('is-playing'));
  video.addEventListener('ended', () => player.classList.remove('is-playing'));
});

// mobile off-canvas menu
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.mobile-menu');
  const backdrop = document.querySelector('.mm-backdrop');
  const closeBtn = document.querySelector('.mm-close');
  if (!toggle || !menu) return;
  const open = () => { menu.classList.add('open'); backdrop && backdrop.classList.add('open'); document.body.classList.add('mm-open'); };
  const close = () => { menu.classList.remove('open'); backdrop && backdrop.classList.remove('open'); document.body.classList.remove('mm-open'); };
  toggle.addEventListener('click', open);
  closeBtn && closeBtn.addEventListener('click', close);
  backdrop && backdrop.addEventListener('click', close);
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
})();
