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

// request-service forms: submit via fetch instead of a normal form POST so
// visitors stay on the page and see a confirmation instead of Zapier's raw
// catch-hook response. mode:'no-cors' means we can't read the response body
// (Zapier's catch hook doesn't send CORS headers), but the request still
// reaches Zapier -- a network-level failure is still catchable via .catch
document.querySelectorAll('form.request-form').forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const btnText = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
    fetch(form.action, { method: 'POST', mode: 'no-cors', body: new FormData(form) })
      .then(() => {
        form.innerHTML = '<p class="form-success">Thanks — we got your request and will reach out shortly. For anything urgent, call <a href="tel:+19495940622">(949) 594-0622</a>.</p>';
      })
      .catch(() => {
        if (btn) { btn.disabled = false; btn.textContent = btnText; }
        alert('Something went wrong sending your request. Please call us at (949) 594-0622.');
      });
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
  list.forEach((el, i) => el.style.setProperty('--d', Math.min(i * 0.05, 0.2) + 's'));
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

// silent looping background clips: don't force autoplay on users who asked
// for reduced motion -- leave them on the poster frame instead
if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.motif-video').forEach(v => v.pause());
}

// subhero slideshow: crossfades through a set of photos on a timer, each
// already animating its own Ken Burns zoom/pan via CSS -- skipped entirely
// for reduced-motion users, who just see the first (active) photo, static
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.subhero-bg.slideshow').forEach(bg => {
    const slides = bg.querySelectorAll('.ss-slide');
    if (slides.length < 2) return;
    let current = [...slides].findIndex(s => s.classList.contains('active'));
    if (current < 0) current = 0;
    setInterval(() => {
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }, 5500);
  });
}

// story carousel: swaps the media + copy panel together, driven by the
// arrow buttons or the dots -- each panel's slides share a `data-slide`
// index so media and copy always advance in lockstep
document.querySelectorAll('.story.carousel').forEach(car => {
  const mediaSlides = car.querySelectorAll('.car-media .car-slide');
  const bodySlides = car.querySelectorAll('.car-body .car-slide');
  const dots = car.querySelectorAll('.car-dots .dot');
  const prevBtn = car.querySelector('.car-arrow.prev');
  const nextBtn = car.querySelector('.car-arrow.next');
  const total = bodySlides.length;
  if (!total) return;
  let current = 0;
  const show = (index) => {
    current = (index + total) % total;
    mediaSlides.forEach((el, i) => el.classList.toggle('active', i === current));
    bodySlides.forEach((el, i) => el.classList.toggle('active', i === current));
    dots.forEach((el, i) => el.classList.toggle('active', i === current));
  };
  // auto-advance on a timer, skipped for reduced-motion users; any manual
  // interaction (arrows or dots) restarts the timer instead of fighting it
  let timer;
  const AUTO_MS = 6000;
  const startAuto = () => {
    if (total < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timer = setInterval(() => show(current + 1), AUTO_MS);
  };
  const restartAuto = () => { clearInterval(timer); startAuto(); };

  prevBtn && prevBtn.addEventListener('click', () => { show(current - 1); restartAuto(); });
  nextBtn && nextBtn.addEventListener('click', () => { show(current + 1); restartAuto(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); restartAuto(); }));

  startAuto();
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
