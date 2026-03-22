'use strict';

/* ════════════════════════════════════════════════
   SCROLL PROGRESS BAR
════════════════════════════════════════════════ */
(function () {
  const bar = document.getElementById('progressBar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    bar.style.width = Math.min(pct * 100, 100) + '%';
  }, { passive: true });
})();

/* ════════════════════════════════════════════════
   MATRIX RAIN
════════════════════════════════════════════════ */
(function () {
  const c = document.getElementById('mx');
  const ctx = c.getContext('2d');
  const resize = () => { c.width = innerWidth; c.height = innerHeight; };
  resize(); addEventListener('resize', resize);
  const chars = '01アイウカキサシスabcdef0123456789!@#$>_/\\Neo4U';
  const fs = 14;
  let drops = [], speeds = [];
  const init = () => {
    const cols = Math.floor(c.width / fs);
    drops  = Array.from({ length: cols }, () => Math.random() * -80);
    speeds = Array.from({ length: cols }, () => 0.28 + Math.random() * 0.48);
  };
  init(); addEventListener('resize', init);
  setInterval(() => {
    ctx.fillStyle = 'rgba(0,0,0,.055)';
    ctx.fillRect(0, 0, c.width, c.height);
    drops.forEach((y, i) => {
      const ch    = chars[Math.floor(Math.random() * chars.length)];
      const alpha = .25 + Math.random() * .75;
      const g     = Math.floor(160 + Math.random() * 95);
      ctx.fillStyle = `rgba(0,${g},${Math.floor(30 + Math.random() * 35)},${alpha})`;
      ctx.font = fs + 'px Share Tech Mono';
      ctx.fillText(ch, i * fs, y * fs);
      if (y * fs > c.height && Math.random() > .975) drops[i] = 0;
      drops[i] += speeds[i];
    });
  }, 42);
})();

/* ════════════════════════════════════════════════
   CURSOR PARTICLE TRAIL
════════════════════════════════════════════════ */
const trailCanvas = document.getElementById('trailCanvas');
let tCtx = null;
if (trailCanvas) {
  trailCanvas.width  = innerWidth;
  trailCanvas.height = innerHeight;
  tCtx = trailCanvas.getContext('2d');
  addEventListener('resize', () => { trailCanvas.width = innerWidth; trailCanvas.height = innerHeight; });
}
const particles = [];
let lastPTime = 0;
function spawnParticle(x, y) {
  if (!tCtx) return;
  particles.push({ x, y, vx:(Math.random()-.5)*1.2, vy:(Math.random()-.5)*1.2-.4, life:1, size:Math.random()*2.5+.5, g:Math.floor(180+Math.random()*75) });
}
(function animP() {
  if (tCtx) {
    tCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.life -= .035;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      tCtx.beginPath();
      tCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      tCtx.fillStyle = `rgba(0,${p.g},50,${p.life*.7})`;
      tCtx.fill();
    }
  }
  requestAnimationFrame(animP);
})();

/* ════════════════════════════════════════════════
   CUSTOM CURSOR + AMBIENT AURA
════════════════════════════════════════════════ */
const cur   = document.getElementById('cur');
const cur2  = document.getElementById('cur2');
const aura  = document.getElementById('curAura');
let msX = 0, msY = 0, axs = 0, ays = 0;

addEventListener('mousemove', e => {
  msX = e.clientX; msY = e.clientY;
  const now = Date.now();
  if (now - lastPTime > 30) { spawnParticle(msX, msY); lastPTime = now; }
});
(function animCursor() {
  axs += (msX - axs) * 0.12;
  ays += (msY - ays) * 0.12;
  cur.style.left = msX + 'px'; cur.style.top = msY + 'px';
  cur2.style.left = axs + 'px'; cur2.style.top = ays + 'px';
  if (aura) { aura.style.left = msX + 'px'; aura.style.top = msY + 'px'; }
  requestAnimationFrame(animCursor);
})();
addEventListener('mousedown', () => { cur.style.transform = 'translate(-50%,-50%) scale(.65) rotate(45deg)'; });
addEventListener('mouseup',   () => { cur.style.transform = 'translate(-50%,-50%) scale(1) rotate(0)'; });

function applyCursorListeners() {
  document.querySelectorAll('a,button,.proj-card,.ach,.c-link,.tool-chip,.counter-card,.svc-card').forEach(el => {
    el.addEventListener('mouseenter', () => { cur.style.width='32px'; cur.style.height='32px'; cur.style.borderColor='var(--green2)'; if(aura) aura.style.opacity='.2'; });
    el.addEventListener('mouseleave', () => { cur.style.width='18px'; cur.style.height='18px'; cur.style.borderColor='var(--green)'; if(aura) aura.style.opacity='.07'; });
  });
}

/* ════════════════════════════════════════════════
   3D TILT ON PROJECT CARDS
════════════════════════════════════════════════ */
function init3DTilt() {
  document.querySelectorAll('.proj-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const x  = (e.clientX - r.left) / r.width  - 0.5;
      const y  = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 7}deg) translateY(-6px) scale(1.01)`;
      card.style.boxShadow = `${-x*18}px ${-y*12}px 40px rgba(0,255,65,.12), 0 24px 60px rgba(0,0,0,.6)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });
}

/* ════════════════════════════════════════════════
   SIDE NAVIGATION DOTS (section indicator)
════════════════════════════════════════════════ */
function initSideNav() {
  const sideNav = document.getElementById('sideNav');
  const dots    = document.querySelectorAll('#sideNav .side-dot');
  const hero    = document.getElementById('hero');
  const sections= [...dots].map(d => document.querySelector(d.getAttribute('href')));

  /* hide side-nav while hero is in view */
  if (sideNav && hero) {
    const heroObs = new IntersectionObserver(([entry]) => {
      sideNav.style.opacity    = entry.isIntersecting ? '0' : '1';
      sideNav.style.pointerEvents = entry.isIntersecting ? 'none' : 'all';
    }, { threshold: 0.1 });
    heroObs.observe(hero);
  }

  /* active dot synced to scroll position */
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      dots.forEach(d => d.classList.remove('active'));
      const dot = document.querySelector(`#sideNav a[href="#${entry.target.id}"]`);
      if (dot) dot.classList.add('active');
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => { if (s) spy.observe(s); });
}

/* ════════════════════════════════════════════════
   HEX STREAM (auto-refresh)
════════════════════════════════════════════════ */
function buildHex() {
  const el = document.getElementById('hexStream');
  if (!el) return;
  let h = '';
  for (let i = 0; i < 300; i++) {
    h += Math.floor(Math.random()*256).toString(16).padStart(2,'0').toUpperCase() + ' ';
    if (i % 12 === 11) h += '\n';
  }
  el.textContent = h;
}
buildHex(); setInterval(buildHex, 3500);

/* ════════════════════════════════════════════════
   LIVE CLOCK
════════════════════════════════════════════════ */
(function tick() {
  const el = document.getElementById('liveTime');
  if (el) {
    const istTime = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });
    el.textContent = `ONLINE · IST ${istTime} · ACCEPTING CONTRACTS`;
  }
  setTimeout(tick, 1000);
})();

/* ════════════════════════════════════════════════
   LIVE ACTIVITY TICKER
════════════════════════════════════════════════ */
function initActivityTicker() {
  const el = document.getElementById('activityTicker');
  if (!el) return;
  const items = [
    'Running nmap scan on 10.0.0.0/24...','Fuzzing /api/v2/admin with ffuf...','Decompiling binary with Ghidra...',
    'Intercepting traffic via BurpSuite...','Exploiting SQL injection on target...','Cracking hash with hashcat...',
    'Enumerating Active Directory path...','Analysing malware sample in sandbox...','Submitting CVE to NVD database...',
    'Solving PWN challenge #42 on CTFtime...',
  ];
  let i = 0;
  function next() {
    el.style.opacity = '0';
    setTimeout(() => { el.textContent = '> ' + items[i]; el.style.opacity = '1'; i = (i+1) % items.length; }, 400);
  }
  next(); setInterval(next, 3200);
}

/* ════════════════════════════════════════════════
   HERO SUBTITLE TYPEWRITER
════════════════════════════════════════════════ */
function initSubtitleCycler() {
  const roles = ['Ethical Hacker','Security Researcher','CTF Champion','Bug Bounty Hunter','Exploit Developer','Malware Analyst'];
  const el = document.getElementById('heroRole');
  if (!el) return;
  let ri = 0, ci = 0, del = false;
  function type() {
    const role = roles[ri];
    if (!del) {
      el.textContent = role.slice(0, ++ci);
      if (ci === role.length) { del = true; setTimeout(type, 1800); return; }
      setTimeout(type, 70 + Math.random()*40);
    } else {
      el.textContent = role.slice(0, --ci);
      if (ci === 0) { del = false; ri = (ri+1) % roles.length; setTimeout(type, 300); return; }
      setTimeout(type, 38);
    }
  }
  type();
}

/* ════════════════════════════════════════════════
   TERMINAL TYPING ANIMATION
════════════════════════════════════════════════ */
function runTerminalTyping(html) {
  const tb = document.getElementById('termBody');
  if (!tb) return;
  const lines = html.split('<br>');
  tb.innerHTML = '';
  let li = 0;
  function next() {
    if (li >= lines.length) return;
    const span = document.createElement('span');
    span.innerHTML = lines[li] + (li < lines.length-1 ? '<br>':'');
    tb.appendChild(span); li++;
    setTimeout(next, 55 + Math.random()*40);
  }
  next();
}

/* ════════════════════════════════════════════════
   BOOT GLITCH
════════════════════════════════════════════════ */
/* boot glitch — brightness only, no hue-rotate so title stays green */
setTimeout(() => {
  document.body.style.filter = 'brightness(1.3) contrast(1.1)';
  setTimeout(() => document.body.style.filter = 'none', 55);
  setTimeout(() => { document.body.style.filter = 'brightness(.8)'; setTimeout(() => document.body.style.filter = 'none', 45); }, 140);
  setTimeout(() => { document.body.style.filter = 'brightness(1.15)'; setTimeout(() => document.body.style.filter = 'none', 35); }, 350);
}, 600);


/* ════════════════════════════════════════════════
   SCROLL SPY (top nav)
════════════════════════════════════════════════ */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav:not(#sideNav) a[href^="#"]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(a => a.classList.remove('active'));
      const a = document.querySelector(`nav:not(#sideNav) a[href="#${entry.target.id}"]`);
      if (a) a.classList.add('active');
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => obs.observe(s));
}

/* ════════════════════════════════════════════════
   MOBILE HAMBURGER
════════════════════════════════════════════════ */
function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const navUl  = document.querySelector('nav:not(#sideNav) ul');
  if (!toggle || !navUl) return;
  toggle.addEventListener('click', () => {
    const open = navUl.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
  });
  navUl.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navUl.classList.remove('open'); toggle.classList.remove('open'); toggle.setAttribute('aria-expanded','false');
  }));
  document.addEventListener('click', e => {
    if (!e.target.closest('nav:not(#sideNav)')) { navUl.classList.remove('open'); toggle.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); }
  });
}

/* ════════════════════════════════════════════════
   SCROLL TO TOP
════════════════════════════════════════════════ */
function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ════════════════════════════════════════════════
   INTERSECTION OBSERVER (reveal + counters + skill bars)
════════════════════════════════════════════════ */
const countersAnimated = new Set();
function makeObserver() {
  return new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('on');
      e.target.querySelectorAll('.sr-fill').forEach(b => setTimeout(() => { b.style.width = b.dataset.w + '%'; }, 150));
      e.target.querySelectorAll('[data-target]').forEach(el => {
        if (countersAnimated.has(el)) return;
        countersAnimated.add(el);
        const target = parseInt(el.dataset.target); let c = 0;
        const step = Math.max(1, Math.ceil(target/55));
        const t = setInterval(() => { c = Math.min(c+step,target); el.textContent = c+(target>=100?'+':''); if(c>=target) clearInterval(t); }, 28);
      });
    });
  }, { threshold: .12 });
}
let globalObserver = makeObserver();
function observeAll() {
  document.querySelectorAll('.rev,.rev-l,.rev-r').forEach(el => globalObserver.observe(el));
}

/* ════════════════════════════════════════════════
   PROJECT MODAL
════════════════════════════════════════════════ */
let allProjects = [];
function openProjectModal(project) {
  const modal = document.getElementById('projModal');
  if (!modal) return;
  const [opPrefix, opNum] = project.id.toUpperCase().split('-');
  modal.querySelector('.modal-badge').className = `modal-badge pc-badge ${project.badgeClass}`;
  modal.querySelector('.modal-badge').textContent = project.badge;
  modal.querySelector('.modal-id').innerHTML  = `${opPrefix}<b>:${opNum}</b>`;
  modal.querySelector('.modal-name').textContent = project.name;
  modal.querySelector('.modal-desc').textContent  = project.desc;
  modal.querySelector('.modal-tags').innerHTML    = project.tags.map(t=>`<span class="pc-tag">${t}</span>`).join('');
  modal.querySelector('.modal-links').innerHTML   = project.links.map(l=>`<a href="${l.href}" class="btn btn-ghost" style="font-size:.65rem;padding:8px 18px" ${l.href!=='#'?'target="_blank" rel="noopener"':'onclick="event.preventDefault();"'}>${l.label}</a>`).join('');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  applyCursorListeners();
}
function closeProjectModal() {
  const modal = document.getElementById('projModal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('click',  e => { if (e.target.id==='projModal') closeProjectModal(); });
document.addEventListener('keydown', e => { if (e.key==='Escape') closeProjectModal(); });

/* ════════════════════════════════════════════════
   COPY TO CLIPBOARD
════════════════════════════════════════════════ */
function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = '✓ COPIED'; btn.style.color = 'var(--green)';
    setTimeout(() => { btn.textContent = orig; btn.style.color = ''; }, 1800);
  }).catch(() => {});
}

/* ════════════════════════════════════════════════
   CONTACT FORM
════════════════════════════════════════════════ */
function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function setFieldError(id, show) {
  const el = document.getElementById(id); if (!el) return;
  el.style.borderBottomColor = show ? 'var(--red)' : '';
  el.style.borderColor       = show ? 'var(--red)' : '';
  if (show) { el.style.animation='none'; requestAnimationFrame(() => el.style.animation='shake .3s ease'); }
}

let pgpData = null;
let usePgp  = false;

window.togglePgpEncrypt = function(btn) {
  if (!pgpData) return;
  usePgp = !usePgp;
  const lock  = btn.querySelector('.pgp-lock');
  const label = btn.querySelector('.pgp-toggle-label');
  const send  = document.getElementById('sendBtn');
  if (usePgp) {
    btn.classList.add('active');
    lock.textContent  = '🔒';
    label.textContent = 'PGP ON — message will be encrypted';
    send.textContent  = './send --pgp-encrypt';
  } else {
    btn.classList.remove('active');
    lock.textContent  = '🔓';
    label.textContent = 'PGP OFF — message sent plaintext';
    send.textContent  = './send --plaintext';
  }
};

window.handleSend = async function(btn) {
  const nameEl = document.getElementById('fName'), emailEl = document.getElementById('fEmail'), msgEl = document.getElementById('fMsg');
  const name = nameEl.value.trim(), email = emailEl.value.trim(), message = msgEl.value.trim();
  let err = false;
  if (!name)               { setFieldError('fName',true);  err=true; } else setFieldError('fName',false);
  if (!isValidEmail(email)){ setFieldError('fEmail',true); err=true; } else setFieldError('fEmail',false);
  if (!message)            { setFieldError('fMsg',true);   err=true; } else setFieldError('fMsg',false);
  if (err) {
    btn.textContent='> [ERROR] invalid / missing fields'; btn.style.background='var(--red)'; btn.style.color='var(--white)';
    setTimeout(()=>{ btn.textContent=usePgp?'./send --pgp-encrypt':'./send --plaintext'; btn.style.background='var(--green)'; btn.style.color='var(--g0)'; },2000); return;
  }
  btn.textContent='> processing payload...'; btn.style.background='var(--green3)'; btn.style.color='var(--white)'; btn.disabled=true;
  
  let finalMessage = message;
  try {
    if (usePgp && window.openpgp && pgpData) {
      btn.textContent='> encrypting with RSA-4096...';
      const pubKey = await fetch(pgpData.keyUrl).then(r=>r.text());
      const publicKey = await openpgp.readKey({ armoredKey: pubKey });
      finalMessage = await openpgp.encrypt({
        message: await openpgp.createMessage({ text: message }),
        encryptionKeys: publicKey
      });
    }

    const data = await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,message:finalMessage})}).then(r=>r.json());
    if (data.success) {
      btn.textContent='> [OK] message transmitted ✓'; btn.style.background='var(--green2)'; btn.style.color='var(--g0)';
      nameEl.value=''; emailEl.value=''; msgEl.value='';
      setTimeout(()=>{ btn.textContent=usePgp?'./send --pgp-encrypt':'./send --plaintext'; btn.style.background='var(--green)'; btn.style.color='var(--g0)'; btn.disabled=false; },3000);
    } else throw new Error(data.error);
  } catch (e) {
    btn.textContent='> [FAIL] transmission error'; btn.style.background='var(--red)'; btn.style.color='var(--white)'; btn.disabled=false;
    console.error('Send error:', e);
    setTimeout(()=>{ btn.textContent=usePgp?'./send --pgp-encrypt':'./send --plaintext'; btn.style.background='var(--green)'; btn.style.color='var(--g0)'; },2500);
  }
};
document.addEventListener('keydown', e => {
  if ((e.ctrlKey||e.metaKey) && e.key==='Enter') {
    const btn = document.getElementById('sendBtn');
    if (btn && document.activeElement?.id==='fMsg') handleSend(btn);
  }
});

/* ════════════════════════════════════════════════
   RENDER HELPERS
════════════════════════════════════════════════ */
const profLabel = p => p>=90?'Expert':p>=75?'Advanced':p>=60?'Proficient':'Intermediate';

function renderProfile(profile) {
  const focusItems = profile.focus.map(f=>`<span class="tp">&nbsp;&nbsp;&nbsp;&nbsp;<span class="tv">"${f}"</span>,</span><br>`).join('');
  runTerminalTyping(`
    <span class="tl">┌──(Neo4U㉿darknode)-[~]</span><br>
    <span class="tl">└─<span class="ts">$</span> cat profile.json</span><br>
    <br>
    <span class="tp">{</span><br>
    <span class="tp">&nbsp;&nbsp;<span class="tk">"alias"</span>      : <span class="tv">"${profile.alias}"</span>,</span><br>
    <span class="tp">&nbsp;&nbsp;<span class="tk">"location"</span>   : <span class="tv">"${profile.location}"</span>,</span><br>
    <span class="tp">&nbsp;&nbsp;<span class="tk">"clearance"</span>  : <span class="tv">"${profile.clearance}"</span>,</span><br>
    <span class="tp">&nbsp;&nbsp;<span class="tk">"focus"</span>      : [</span><br>
    ${focusItems}
    <span class="tp">&nbsp;&nbsp;],</span><br>
    <span class="tp">&nbsp;&nbsp;<span class="tk">"certifications"</span>: <span class="tv">"${profile.certifications}"</span>,</span><br>
    <span class="tp">&nbsp;&nbsp;<span class="tk">"status"</span>     : <span class="ts">"${profile.status}"</span></span><br>
    <span class="tp">}</span><br>
    <br>
    <span class="tl">└─<span class="ts">$</span> <span class="tcursor"></span></span>
  `);
  const at = document.getElementById('aboutText');
  const bioHtml = profile.bio.map(p=>`<p>${p}</p>`).join('');
  const cntHtml  = profile.counters.map(c=>`<div class="counter-card rev"><div class="cnt-num" data-target="${c.value}">0</div><div class="cnt-lbl">${c.label}</div></div>`).join('');
  at.innerHTML = `${bioHtml}<div class="counters">${cntHtml}</div>`;
}

function renderSkills(skills) {
  document.getElementById('skillsGrid').innerHTML = skills.map((s,si) => {
    const bars = s.bars.map(b=>`<div class="skill-row"><div class="sr-top"><span>${b.name}</span><span class="sr-pct-label">${b.pct}% <em>${profLabel(b.pct)}</em></span></div><div class="sr-track"><div class="sr-fill" data-w="${b.pct}"></div></div></div>`).join('');
    const tools = s.tools.length?`<div class="tools-row">${s.tools.map(t=>`<span class="tool-chip">${t}</span>`).join('')}</div>`:'';
    return `<div class="skill-block rev" style="--si:${si}"><div class="sb-head"><span class="sb-icon">${s.icon}</span><span class="sb-title">${s.title}</span></div>${bars}${tools}</div>`;
  }).join('');
}

function renderProjects(projects) {
  allProjects = projects;
  document.getElementById('projGrid').innerHTML = projects.map((p,pi) => {
    const [opPrefix, opNum] = p.id.toUpperCase().split('-');
    const tags  = p.tags.map(t=>`<span class="pc-tag">${t}</span>`).join('');
    const links = p.links.map(l=>`<a href="${l.href}" class="pc-link" ${l.href!=='#'?'target="_blank" rel="noopener"':''} onclick="event.stopPropagation()">${l.label}</a>`).join('');
    return `<div class="proj-card rev" style="--pi:${pi}" onclick="openProjectModal(allProjects[${pi}])"><span class="pc-badge ${p.badgeClass}">${p.badge}</span><div class="pc-id">${opPrefix}<b>:${opNum}</b></div><div class="pc-name">${p.name}</div><p class="pc-desc">${p.desc}</p><div class="pc-tags">${tags}</div><div class="pc-links">${links}</div><div class="card-expand-hint">[ CLICK TO EXPAND ]</div></div>`;
  }).join('');
}

function renderServices(services) {
  document.getElementById('servicesGrid').innerHTML = services.map((s,i) => {
    const tags = s.tags.map(t => `<span class="svc-tag">${t}</span>`).join('');
    return `
      <div class="svc-card rev" style="--si:${i}">
        <div class="svc-icon">${s.icon}</div>
        <div class="svc-title">${s.title}</div>
        <p class="svc-desc">${s.desc}</p>
        <div class="svc-tags">${tags}</div>
      </div>`;
  }).join('');
}

function renderTimeline(timeline) {
  document.getElementById('timelineWrap').innerHTML = `
    <div class="tl-line"></div>
    ${timeline.map((item, i) => {
      const isLeft = i % 2 === 0;
      const dotEl  = `<div class="tl-dot tl-dot--${item.type}"></div>`;
      const card   = `
        <div class="tl-card">
          <div class="tl-year">${item.year}</div>
          <div class="tl-title">${item.title}</div>
          <div class="tl-org tl-org--${item.type}">${item.org}</div>
          <p class="tl-desc">${item.desc}</p>
        </div>`;
      return `
        <div class="tl-item rev ${isLeft ? 'tl-left' : 'tl-right'}">
          ${isLeft
            ? `${card}${dotEl}<div class="tl-empty"></div>`
            : `<div class="tl-empty"></div>${dotEl}${card}`}
        </div>`;
    }).join('')}
  `;
}


function renderCTF(ctf) {
  document.getElementById('ctfScoreboard').innerHTML = `
    <div class="sb-thead"><span>Rank</span><span>Event</span><span style="text-align:right">Score</span></div>
    ${ctf.scores.map((s,i) => `<div class="sb-row${s.gold?' gold':''}" style="--ri:${i}"><span class="sb-rank">${s.rank}</span><span class="sb-comp">${s.comp}</span><span class="sb-pts">${s.pts}</span></div>`).join('')}
  `;
  document.getElementById('ctfAchievements').innerHTML = ctf.achievements.map((a,i) => `
    <div class="ach" style="--ai:${i}">
      <div class="ach-ico">${a.icon}</div>
      <div><div class="ach-title">${a.title}</div><div class="ach-body">${a.body}</div><div class="ach-foot">${a.foot}</div></div>
    </div>`).join('');
}

function renderContactLinks(links) {
  document.getElementById('contactLinks').innerHTML = links.map(l => `
    <a href="${l.href}" class="c-link" ${l.href.startsWith('mailto')||l.href.startsWith('http')?'target="_blank" rel="noopener"':''}>
      <div class="cl-platform">${l.platform}</div>
      <div class="cl-handle">${l.handle}</div>
      <button class="copy-btn" onclick="event.preventDefault();event.stopPropagation();copyToClipboard('${l.handle}',this)">COPY</button>
    </a>`).join('');
}

function renderPGP(pgp) {
  if (!pgp) return;
  pgpData = pgp;
  document.getElementById('pgpFingerprint').textContent = pgp.fingerprint;
  document.getElementById('pgpMeta').innerHTML = `<span>ALG: ${pgp.algorithm}</span><span>KEY ID: ${pgp.keyId}</span>`;
  const footKey = document.getElementById('pgpKey');
  if (footKey) {
    const start = pgp.fingerprint.split(' ').slice(0,3).join(' ');
    footKey.textContent = start + ' ···';
    footKey.nextElementSibling.setAttribute('onclick', `copyToClipboard('${pgp.fingerprint}', this)`);
  }
}

/* ════════════════════════════════════════════════
   PAGE LOADER
════════════════════════════════════════════════ */
function hideLoader() {
  const loader = document.getElementById('pageLoader');
  if (loader) { loader.style.opacity='0'; setTimeout(()=>loader.remove(), 400); }
}

/* ════════════════════════════════════════════════
   BOOTSTRAP
════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const [profile, skills, projects, ctf, contactLinks, services, timeline, pgp] = await Promise.all([
      fetch('/api/profile').then(r=>r.json()),
      fetch('/api/skills').then(r=>r.json()),
      fetch('/api/projects').then(r=>r.json()),
      fetch('/api/ctf').then(r=>r.json()),
      fetch('/api/contact-links').then(r=>r.json()),
      fetch('/api/services').then(r=>r.json()),
      fetch('/api/timeline').then(r=>r.json()),
      fetch('/api/pgp').then(r=>r.json()),
    ]);

    renderProfile(profile);
    renderPGP(pgp);
    renderSkills(skills);
    renderProjects(projects);
    renderServices(services);
    renderTimeline(timeline);
    renderCTF(ctf);
    renderContactLinks(contactLinks);

    observeAll();
    applyCursorListeners();
    initScrollSpy();
    initSideNav();
    initMobileMenu();
    initScrollTop();
    initSubtitleCycler();
    initActivityTicker();
    init3DTilt();
    hideLoader();

  } catch (err) {
    console.error('[Neo4U] Bootstrap failed:', err);
    hideLoader();
  }
});
