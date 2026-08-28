// sticky header shadow
const nav=document.getElementById('nav');
if(nav){addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>10));}

// FAQ accordion
document.querySelectorAll('.faq-q').forEach(q=>{
  q.addEventListener('click',()=>{
    const item=q.parentElement;
    const open=item.classList.contains('open');
    item.parentElement.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('open'));
    if(!open)item.classList.add('open');
  });
});

// reveal on scroll
const io=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// mobile off-canvas menu
(function(){
  const toggle=document.querySelector('.nav-toggle');
  const menu=document.querySelector('.mobile-menu');
  const backdrop=document.querySelector('.mm-backdrop');
  const closeBtn=document.querySelector('.mm-close');
  if(!toggle||!menu) return;
  const open=()=>{menu.classList.add('open');backdrop&&backdrop.classList.add('open');document.body.classList.add('mm-open');};
  const close=()=>{menu.classList.remove('open');backdrop&&backdrop.classList.remove('open');document.body.classList.remove('mm-open');};
  toggle.addEventListener('click',open);
  closeBtn&&closeBtn.addEventListener('click',close);
  backdrop&&backdrop.addEventListener('click',close);
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
})();
