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
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
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
