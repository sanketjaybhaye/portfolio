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
   HERO HUD COUNTERS
════════════════════════════════════════════════ */
function initHUD() {
  // Uptime — fake boot time anchored to page load
  const startTime = Date.now();
  function updateUptime() {
    const el = document.getElementById('hudUptime');
    if (!el) return;
    const secs = Math.floor((Date.now() - startTime) / 1000);
    const d = Math.floor(secs / 86400);
    const h = Math.floor((secs % 86400) / 3600);
    const m = Math.floor((secs % 3600) / 60);
    el.textContent = `${d}d ${h}h ${m}m`;
  }
  setInterval(updateUptime, 60000);
  updateUptime();

  // Packets counter — random increments
  let pkts = Math.floor(Math.random() * 50000) + 12000;
  function updatePkts() {
    const el = document.getElementById('hudPkts');
    if (!el) return;
    pkts += Math.floor(Math.random() * 120) + 30;
    el.textContent = pkts.toLocaleString();
  }
  setInterval(updatePkts, 800);
  updatePkts();

  // System load — fluctuates realistically
  let load = 0.8 + Math.random() * 0.4;
  function updateLoad() {
    const el = document.getElementById('hudLoad');
    if (!el) return;
    load += (Math.random() - 0.5) * 0.15;
    load = Math.max(0.1, Math.min(3.5, load));
    el.textContent = load.toFixed(2);
  }
  setInterval(updateLoad, 1500);
  updateLoad();
}

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
   SECTION HEADING GLITCH SCRAMBLE
════════════════════════════════════════════════ */
function initHeadingScramble() {
  const CHARS = '!@#$%^&*<>?/\\|[]{}~0123456789ABCDEF';
  document.querySelectorAll('.sec-h').forEach(el => {
    const original = el.textContent;
    let animating = false;
    el.addEventListener('mouseenter', () => {
      if (animating) return;
      animating = true;
      let iter = 0;
      const interval = setInterval(() => {
        el.textContent = original.split('').map((ch, i) => {
          if (ch === ' ') return ' ';
          if (i < iter) return original[i];
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('');
        iter += 1.5;
        if (iter > original.length) { el.textContent = original; clearInterval(interval); animating = false; }
      }, 40);
    });
  });
}

/* ════════════════════════════════════════════════
   BUTTON PARTICLE EXPLOSION
════════════════════════════════════════════════ */
function initButtonParticles() {
  document.querySelectorAll('.btn-solid, .btn-ghost').forEach(btn => {
    btn.addEventListener('click', e => {
      if (!tCtx) return;
      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      for (let i = 0; i < 22; i++) {
        const angle = (Math.PI * 2 * i) / 22 + Math.random() * 0.4;
        const speed = 1.5 + Math.random() * 2.5;
        particles.push({
          x: cx, y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2,
          life: 1,
          size: Math.random() * 3.5 + 0.8,
          g: Math.floor(200 + Math.random() * 55)
        });
      }
    });
  });
}


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
   INTERACTIVE HERO TERMINAL
════════════════════════════════════════════════ */
function initHeroTerminal() {
  const input  = document.getElementById('itermInput');
  const output = document.getElementById('itermOutput');
  if (!input || !output) return;

  const COMMANDS = {
    help: () => [
      '<span class="iterm-hi">Available commands:</span>',
      '<span class="iterm-dim">──────────────────────────────────</span>',
      '  <span class="iterm-cmd">whoami</span>       — identity dump',
      '  <span class="iterm-cmd">skills</span>       — list the arsenal',
      '  <span class="iterm-cmd">status</span>       — current op status',
      '  <span class="iterm-cmd">tools</span>        — preferred toolset',
      '  <span class="iterm-cmd">pgp</span>          — public key info',
      '  <span class="iterm-cmd">contact</span>      — how to reach me',
      '  <span class="iterm-cmd">ctf</span>          — CTF stats',
      '  <span class="iterm-cmd">social</span>       — social handles',
      '  <span class="iterm-cmd">nmap</span>         — scan this machine',
      '  <span class="iterm-cmd">ls</span>           — list projects',
      '  <span class="iterm-cmd">cat resume</span>   — download resume info',
      '  <span class="iterm-cmd">sudo rm -rf</span>  — nice try',
      '  <span class="iterm-cmd">matrix</span>       — go deeper',
      '  <span class="iterm-cmd">ascii</span>        — show ASCII banner',
      '  <span class="iterm-cmd">resume</span>       — view/download resume',
      '  <span class="iterm-cmd">writeups</span>     — list CTF writeups',
      '  <span class="iterm-cmd">clear</span>        — clear terminal',
    ],
    whoami: () => [
      '<span class="iterm-res">uid=0(neo4u) gid=0(root) groups=0(root)</span>',
      '<span class="iterm-dim">──────────────────────────────────</span>',
      '<span class="iterm-res">Name     : <span class="iterm-hi">Sanket Jaybhaye</span></span>',
      '<span class="iterm-res">Alias    : <span class="iterm-cmd">Neo4U / null_byte_</span></span>',
      '<span class="iterm-res">Role     : Ethical Hacker · Security Researcher</span>',
      '<span class="iterm-res">Location : India 🇮🇳</span>',
      '<span class="iterm-res">Degree   : <span class="iterm-amber">B.Sc. CS · Class of 2026</span></span>',
      '<span class="iterm-res">Status   : <span class="iterm-cmd">ACTIVELY_HUNTING</span></span>',
    ],
    skills: () => [
      '<span class="iterm-hi">[ SKILL MATRIX ]</span>',
      '<span class="iterm-dim">──────────────────────────────────</span>',
      '<span class="iterm-res">Web Pentesting       <span class="iterm-cmd">████████████</span> 92%</span>',
      '<span class="iterm-res">Reverse Engineering  <span class="iterm-cmd">█████████░░░</span> 78%</span>',
      '<span class="iterm-res">Network Security     <span class="iterm-cmd">████████░░░░</span> 70%</span>',
      '<span class="iterm-res">Exploit Development  <span class="iterm-cmd">████████░░░░</span> 68%</span>',
      '<span class="iterm-res">Malware Analysis     <span class="iterm-cmd">███████░░░░░</span> 62%</span>',
      '<span class="iterm-res">CTF                  <span class="iterm-cmd">█████████░░░</span> 80%</span>',
    ],
    status: () => [
      '<span class="iterm-dim">[ STATUS REPORT ]</span>',
      '<span class="iterm-res">Platform   : HackerOne + Bugcrowd</span>',
      '<span class="iterm-res">Bugs Found : <span class="iterm-amber">30+</span></span>',
      '<span class="iterm-res">CTFs Played: <span class="iterm-amber">10+</span></span>',
      '<span class="iterm-res">Availability: <span class="iterm-cmd">OPEN TO WORK ✓</span></span>',
    ],
    tools: () => [
      '<span class="iterm-hi">[ PREFERRED TOOLSET ]</span>',
      '<span class="iterm-res">Recon    : nmap · shodan · amass · subfinder</span>',
      '<span class="iterm-res">Web      : burpsuite · sqlmap · ffuf · nikto</span>',
      '<span class="iterm-res">RE       : ghidra · gdb · pwndbg · radare2</span>',
      '<span class="iterm-res">Network  : wireshark · tcpdump · mitmproxy</span>',
      '<span class="iterm-res">Scripting: python · bash · pwntools</span>',
      '<span class="iterm-res">OS       : <span class="iterm-cmd">Kali Linux</span> · Parrot OS</span>',
    ],
    pgp: () => [
      '<span class="iterm-hi">[ PGP DETAILS ]</span>',
      '<span class="iterm-res">Algorithm : RSA 4096-bit</span>',
      '<span class="iterm-res">Key URL   : <span class="iterm-cmd">/public-key.asc</span></span>',
      '<span class="iterm-res">Usage     : Encrypt messages via contact form</span>',
      '<span class="iterm-dim">Tip: toggle PGP ON in the contact form ↓</span>',
    ],
    contact: () => [
      '<span class="iterm-hi">[ SECURE CHANNELS ]</span>',
      '<span class="iterm-res">Email    : neo4u.relay@gmail.com</span>',
      '<span class="iterm-res">GitHub   : github.com/sanketjaybhaye</span>',
      '<span class="iterm-res">HackerOne: hackerone.com/neo4u</span>',
      '<span class="iterm-dim">Recommended: use PGP encrypted contact form</span>',
    ],
    ctf: () => [
      '<span class="iterm-hi">[ CTF RECORDS ]</span>',
      '<span class="iterm-res">Events played : <span class="iterm-amber">10+</span></span>',
      '<span class="iterm-res">Categories    : Web · RE · Pwn · Crypto · OSINT</span>',
      '<span class="iterm-res">Best Rank     : <span class="iterm-cmd">Top 10%</span></span>',
      '<span class="iterm-dim">Profile: ctftime.org</span>',
    ],
    social: () => [
      '<span class="iterm-res">GitHub   : <span class="iterm-cmd">github.com/sanketjaybhaye</span></span>',
      '<span class="iterm-res">LinkedIn : <span class="iterm-cmd">linkedin.com/in/sanket-jaybhaye</span></span>',
      '<span class="iterm-res">Twitter  : <span class="iterm-cmd">@neo4u_</span></span>',
    ],
    nmap: () => [
      '<span class="iterm-dim">Starting Nmap 7.94 ( https://nmap.org )</span>',
      '<span class="iterm-res">Scanning <span class="iterm-hi">neo4u.onrender.com</span> [1 host]</span>',
      '<span class="iterm-dim">──────────────────────────────────</span>',
      '<span class="iterm-res">PORT     STATE  SERVICE  VERSION</span>',
      '<span class="iterm-cmd">443/tcp  open   https    Node.js/Express</span>',
      '<span class="iterm-cmd">80/tcp   open   http     → redirects to 443</span>',
      '<span class="iterm-amber">Host: neo4u.onrender.com — uptime: 99.9%</span>',
      '<span class="iterm-dim">Nmap done: 1 IP address (1 host up)</span>',
    ],
    ls: () => [
      '<span class="iterm-hi">drwxr-xr-x  projects/</span>',
      '<span class="iterm-res">  OP-001  Neo4U Portfolio     [<span class="iterm-cmd">LIVE</span>]</span>',
      '<span class="iterm-res">  OP-002  Bug Bounty Tools    [<span class="iterm-amber">PRIVATE</span>]</span>',
      '<span class="iterm-res">  OP-003  CTF Writeups        [<span class="iterm-amber">PRIVATE</span>]</span>',
      '<span class="iterm-dim">→ See full list in #projects section</span>',
    ],
    'cat resume': () => [
      '<span class="iterm-hi">[ RESUME.md ]</span>',
      '<span class="iterm-res">Education : B.Sc. CS · 2026</span>',
      '<span class="iterm-res">Focus     : Web Pentesting · Bug Bounty · CTF</span>',
      '<span class="iterm-res">Skills    : Python · Bash · C · Assembly</span>',
      '<span class="iterm-res">Status    : <span class="iterm-cmd">OPEN TO WORK</span></span>',
      '<span class="iterm-dim">→ Full details in #about and #timeline</span>',
    ],
    matrix: () => [
      '<span class="iterm-cmd">Wake up, Neo4U...</span>',
      '<span class="iterm-hi">The Matrix has you.</span>',
      '<span class="iterm-dim">Follow the white rabbit 🐇</span>',
    ],
    'sudo rm -rf': () => [
      '<span class="iterm-err">[sudo] password for neo4u: </span>',
      '<span class="iterm-err">rm: cannot remove \'/\': Permission denied</span>',
      '<span class="iterm-amber">Nice try. This system self-destructs on breach.</span>',
    ],
    ascii: () => [
      '<span class="iterm-cmd">  _   _            _  _   _ </span>',
      '<span class="iterm-cmd"> | \\ | | ___  ___ | || | | |</span>',
      '<span class="iterm-cmd"> |  \\| |/ _ \\/ _ \\| || |_| |</span>',
      '<span class="iterm-cmd"> | |\\  |  __/ (_) |__   _  |</span>',
      '<span class="iterm-cmd"> |_| \\_|\\___|\\___|   |_| \\_/</span>',
      '<span class="iterm-dim">  Ethical Hacker · Security Researcher</span>',
      '<span class="iterm-amber">  HTB #913 · TryHackMe TOP 1% · Bug Bounty</span>',
    ],
    resume: () => {
      setTimeout(() => { if(typeof openResumeModal === 'function') openResumeModal(); }, 200);
      return ['<span class="iterm-dim">Opening resume viewer...</span>'];
    },
    writeups: () => [
      '<span class="iterm-hi">[ CTF WRITEUPS ]</span>',
      '<span class="iterm-res">Blue       (HTB) — EternalBlue / MS17-010</span>',
      '<span class="iterm-res">Shocker    (HTB) — Shellshock CGI exploit</span>',
      '<span class="iterm-res">Kenobi     (THM) — SMB + ProFTPD + SUID</span>',
      '<span class="iterm-res">Pickle Rick(THM) — Web enumeration + RCE</span>',
      '<span class="iterm-dim">→ See #writeups section for full breakdowns</span>',
    ],
    clear: () => null,
  };

  const history = [];
  let histIdx = -1;

  function addLine(html) {
    const span = document.createElement('span');
    span.className = 'iterm-line';
    span.innerHTML = html;
    output.appendChild(span);
    output.scrollTop = output.scrollHeight;
  }

  function typeLines(lines, delay = 40) {
    lines.forEach((line, i) => {
      setTimeout(() => { addLine(line); }, i * delay);
    });
  }

  function runCommand(raw) {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

    // echo the command
    addLine(`<span class="iterm-dim">$ </span><span class="iterm-cmd">${raw}</span>`);
    history.unshift(raw); histIdx = -1;

    if (cmd === 'clear') { output.innerHTML = ''; return; }

    // find handler (exact match first, then prefix)
    const handler = COMMANDS[cmd] || COMMANDS[Object.keys(COMMANDS).find(k => cmd.startsWith(k))];
    if (handler) {
      const lines = handler();
      if (lines) typeLines(lines);
    } else {
      addLine(`<span class="iterm-err">command not found: ${raw} — try 'help'</span>`);
    }
  }

  // boot sequence
  const boot = [
    '<span class="iterm-dim">Neo4U Terminal v2.6 — Type <span class="iterm-cmd">help</span> for commands</span>',
    '<span class="iterm-dim">────────────────────────────────────</span>',
  ];
  setTimeout(() => typeLines(boot, 60), 800);

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      runCommand(input.value); input.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      histIdx = Math.min(histIdx + 1, history.length - 1);
      if (history[histIdx]) input.value = history[histIdx];
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      histIdx = Math.max(histIdx - 1, -1);
      input.value = histIdx >= 0 ? history[histIdx] : '';
    }
  });

  // click anywhere in terminal to focus input
  document.getElementById('heroTerminalWrap')?.addEventListener('click', () => input.focus());
}

/* ════════════════════════════════════════════════
   SKILL RADAR CHART (SVG)
════════════════════════════════════════════════ */
function initRadarChart() {
  const svg = document.getElementById('radarChart');
  const legend = document.getElementById('radarLegend');
  if (!svg || !legend) return;

  const CX = 200, CY = 200, R = 130;
  const domains = [
    { label: 'Web Pentesting',   pct: 92, color: '#00ff41' },
    { label: 'Exploit Dev',      pct: 68, color: '#00ffcc' },
    { label: 'Rev Engineering',  pct: 78, color: '#ffb000' },
    { label: 'Network Security', pct: 70, color: '#00cc34' },
    { label: 'Malware Analysis', pct: 62, color: '#00ffcc' },
    { label: 'CTF Challenges',   pct: 80, color: '#00ff41' },
  ];
  const N = domains.length;
  const angleStep = (Math.PI * 2) / N;
  const angleOffset = -Math.PI / 2; // start top

  function polar(angle, radius) {
    return { x: CX + radius * Math.cos(angle), y: CY + radius * Math.sin(angle) };
  }

  // SVG namespace helper
  function el(tag, attrs) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
    return e;
  }

  // background rings
  [0.25, 0.5, 0.75, 1].forEach(r => {
    const pts = domains.map((_, i) => {
      const a = angleOffset + i * angleStep;
      const p = polar(a, R * r);
      return `${p.x},${p.y}`;
    }).join(' ');
    svg.appendChild(el('polygon', {
      points: pts,
      fill: 'none',
      stroke: 'rgba(0,255,65,0.08)',
      'stroke-width': '1',
    }));
  });

  // axis lines & labels — split into 2 lines if long
  domains.forEach((d, i) => {
    const a = angleOffset + i * angleStep;
    const outer = polar(a, R);
    const labelR = R + 26;
    const lp = polar(a, labelR);
    svg.appendChild(el('line', {
      x1: CX, y1: CY, x2: outer.x, y2: outer.y,
      stroke: 'rgba(0,255,65,0.1)', 'stroke-width': '1',
    }));

    // Split label into 2 lines if long
    const words = d.label.toUpperCase().split(' ');
    const mid = Math.ceil(words.length / 2);
    const line1 = words.slice(0, mid).join(' ');
    const line2 = words.slice(mid).join(' ');
    const anchor = Math.abs(lp.x - CX) < 10 ? 'middle' : lp.x > CX ? 'start' : 'end';
    const baseline = lp.y < CY ? 'auto' : 'hanging';

    if (line2) {
      // Two-line label
      const text1 = el('text', { x: lp.x, y: lp.y - 6, 'text-anchor': anchor, 'dominant-baseline': baseline, fill: 'rgba(0,255,65,0.45)', 'font-size': '8', 'font-family': 'Share Tech Mono, monospace', 'letter-spacing': '0.5' });
      text1.textContent = line1;
      svg.appendChild(text1);
      const text2 = el('text', { x: lp.x, y: lp.y + 6, 'text-anchor': anchor, 'dominant-baseline': baseline, fill: 'rgba(0,255,65,0.45)', 'font-size': '8', 'font-family': 'Share Tech Mono, monospace', 'letter-spacing': '0.5' });
      text2.textContent = line2;
      svg.appendChild(text2);
    } else {
      const text = el('text', { x: lp.x, y: lp.y, 'text-anchor': anchor, 'dominant-baseline': baseline, fill: 'rgba(0,255,65,0.45)', 'font-size': '8', 'font-family': 'Share Tech Mono, monospace', 'letter-spacing': '0.5' });
      text.textContent = line1;
      svg.appendChild(text);
    }
  });

  // data polygon — starts at 0 and animates
  function makePoints(factor) {
    return domains.map((d, i) => {
      const a = angleOffset + i * angleStep;
      const p = polar(a, R * (d.pct / 100) * factor);
      return `${p.x},${p.y}`;
    }).join(' ');
  }

  const fill = el('polygon', {
    points: makePoints(0),
    fill: 'rgba(0,255,65,0.06)',
    stroke: '#00ff41',
    'stroke-width': '1.5',
    filter: 'url(#glow)',
  });

  // glow filter
  const defs = el('defs', {});
  const filter = el('filter', { id: 'glow', x: '-20%', y: '-20%', width: '140%', height: '140%' });
  const feGaussian = el('feGaussianBlur', { stdDeviation: '3', result: 'blur' });
  const feMerge = el('feMerge', {});
  const n1 = el('feMergeNode', { in: 'blur' });
  const n2 = el('feMergeNode', { in: 'SourceGraphic' });
  feMerge.appendChild(n1); feMerge.appendChild(n2);
  filter.appendChild(feGaussian); filter.appendChild(feMerge);
  defs.appendChild(filter);
  svg.appendChild(defs);
  svg.appendChild(fill);

  // vertex dots
  const dots = domains.map((d, i) => {
    const a = angleOffset + i * angleStep;
    const p = polar(a, R * (d.pct / 100));
    const circle = el('circle', {
      cx: p.x, cy: p.y, r: '4',
      fill: '#00ff41',
      filter: 'url(#glow)',
    });
    svg.appendChild(circle);
    return circle;
  });

  // animate expansion on scroll into view
  const observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    observer.disconnect();
    let start = null;
    const dur = 1200;
    function step(ts) {
      if (!start) start = ts;
      const factor = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - factor, 3);
      fill.setAttribute('points', makePoints(ease));
      domains.forEach((d, i) => {
        const a = angleOffset + i * angleStep;
        const p = polar(a, R * (d.pct / 100) * ease);
        dots[i].setAttribute('cx', p.x);
        dots[i].setAttribute('cy', p.y);
      });
      if (factor < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, { threshold: 0.3 });
  observer.observe(svg);

  // legend
  domains.forEach(d => {
    const item = document.createElement('div');
    item.className = 'radar-legend-item';
    item.innerHTML = `<span class="radar-dot" style="background:${d.color};box-shadow:0 0 6px ${d.color}"></span>${d.label}<span class="radar-pct">${d.pct}%</span>`;
    legend.appendChild(item);
  });

  // Tooltip on vertex dots
  domains.forEach((d, i) => {
    dots[i].style.cursor = 'pointer';
    dots[i].addEventListener('mouseenter', () => {
      dots[i].setAttribute('r', '6');
    });
    dots[i].addEventListener('mouseleave', () => {
      dots[i].setAttribute('r', '4');
    });
  });
}

/* ════════════════════════════════════════════════
   LIVE THREAT FEED — fetches real CVEs from /api/threat-feed
════════════════════════════════════════════════ */
async function initThreatFeed() {
  const ticker = document.getElementById('tfTicker');
  if (!ticker) return;

  // Static fallback shown immediately while fetch runs
  const fallback = [
    { sev: 'crit', text: 'CVE-2024-3400 · Palo Alto PAN-OS RCE — CVSS 10.0', link: 'https://nvd.nist.gov/vuln/detail/CVE-2024-3400' },
    { sev: 'high', text: 'CVE-2024-21762 · Fortinet SSL-VPN auth bypass — CVSS 9.6', link: 'https://nvd.nist.gov/vuln/detail/CVE-2024-21762' },
    { sev: 'crit', text: 'CVE-2024-27198 · JetBrains TeamCity auth bypass — CVSS 9.8', link: '' },
    { sev: 'med',  text: 'CVE-2024-23897 · Jenkins arbitrary file read — CVSS 7.5', link: '' },
    { sev: 'high', text: 'CVE-2024-4577 · PHP CGI argument injection — CVSS 9.8', link: '' },
    { sev: 'crit', text: 'CVE-2023-46604 · Apache ActiveMQ RCE (actively exploited)', link: '' },
  ];

  function renderTicker(items) {
    const clsMap = { crit: 'tf-sev-crit', high: 'tf-sev-high', med: 'tf-sev-med' };
    const iconMap = { crit: '🔴', high: '🟠', med: '🟡' };
    // Duplicate for seamless loop
    const html = [...items, ...items].map(it => {
      const cls  = clsMap[it.sev] || 'tf-sev-med';
      const icon = iconMap[it.sev] || '🟡';
      const href = it.link && it.link !== '#' ? ` onclick="window.open('${it.link}','_blank')"` : '';
      return `<span class="tf-item"${href}>${icon}&nbsp;<span class="${cls}">[${(it.sev||'med').toUpperCase()}]</span>&nbsp;${it.text}&nbsp;&nbsp;·&nbsp;</span>`;
    }).join('');
    ticker.innerHTML = html;
  }

  // Show fallback immediately
  renderTicker(fallback);

  // Fetch real CVEs from server (which calls NVD API with caching)
  try {
    const items = await fetch('/api/threat-feed').then(r => r.json());
    if (Array.isArray(items) && items.length > 0) {
      renderTicker(items);
    }
  } catch (e) {
    console.warn('[Threat Feed] Could not load live feed:', e.message);
  }
}

/* ════════════════════════════════════════════════
   KONAMI CODE — BREACH OVERLAY
════════════════════════════════════════════════ */
function initKonamiCode() {
  const SEQ = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let idx = 0;
  const overlay = document.getElementById('breachOverlay');
  const code    = document.getElementById('breachCode');
  const clear   = document.getElementById('breachClear');
  if (!overlay) return;

  const phrases = [
    'SCANNING BIOMETRICS...',
    'TRACING IP: 127.0.0.1',
    'CRACKING AES-256 KEY...',
    'BYPASSING FIREWALL...',
    'ACCESS LEVEL: OMEGA',
    'KERNEL EXPLOIT LOADED',
    '> PAYLOAD EXECUTED ✓',
  ];

  function launchBreach() {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    code.textContent = '';
    clear.classList.remove('show');

    phrases.forEach((phrase, i) => {
      setTimeout(() => { code.textContent = phrase; }, i * 500);
    });
    setTimeout(() => { clear.classList.add('show'); }, phrases.length * 500 + 500);
    setTimeout(() => {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }, phrases.length * 500 + 3500);
  }

  document.addEventListener('keydown', e => {
    if (e.key === SEQ[idx]) {
      idx++;
      if (idx === SEQ.length) { idx = 0; launchBreach(); }
    } else {
      idx = e.key === SEQ[0] ? 1 : 0;
    }
  });

  // click overlay to dismiss early
  overlay.addEventListener('click', () => {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  });
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
    initHeroTerminal();
    initRadarChart();
    initThreatFeed();   // async — fetches real CVEs
    initKonamiCode();
    initHUD();
    initHeadingScramble();
    initButtonParticles();
    hideLoader();

  } catch (err) {
    console.error('[Neo4U] Bootstrap failed:', err);
    hideLoader();
  }
});


/* ════════════════════════════════════════════════
   RENDER WRITEUPS
════════════════════════════════════════════════ */
let allWriteups = [];
function renderWriteups(writeups) {
  allWriteups = writeups;
  const grid = document.getElementById('wuGrid');
  if (!grid) return;
  grid.innerHTML = writeups.map((w, i) => {
    const tags = w.tags.map(t => '<span class="wu-tag">' + t + '</span>').join('');
    return '<div class="wu-card rev" style="--pi:' + i + '" data-platform="' + w.platform + '" data-diff="' + w.difficulty + '" onclick="openWuModal(allWriteups[' + i + '])">'
         + '<div class="wu-card-head">'
         + '<span class="wu-platform ' + w.platform + '">' + w.platform + '</span>'
         + '<span class="wu-diff ' + w.difficulty + '">' + w.difficulty + '</span>'
         + '</div>'
         + '<div class="wu-card-name">' + w.name + '</div>'
         + '<div class="wu-card-cat">' + w.category + ' &nbsp;·&nbsp; ' + (w.os || '') + '</div>'
         + '<div class="wu-card-tags">' + tags + '</div>'
         + '<div class="wu-card-foot">[ CLICK TO READ WRITEUP ]</div>'
         + '</div>';
  }).join('');

  // Filter logic
  document.querySelectorAll('.wu-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.wu-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      document.querySelectorAll('.wu-card').forEach(card => {
        const show = f === 'all'
          || card.dataset.platform === f
          || card.dataset.diff === f;
        card.classList.toggle('wu-card-hidden', !show);
      });
    });
  });
}

function openWuModal(w) {
  const modal = document.getElementById('wuModal');
  if (!modal) return;
  const pl = modal.querySelector('#wuModalPlatform');
  pl.textContent = w.platform;
  pl.className = 'wu-modal-platform ' + w.platform;
  const df = modal.querySelector('#wuModalDiff');
  df.textContent = w.difficulty;
  df.className = 'wu-modal-diff ' + w.difficulty;
  modal.querySelector('#wuModalName').textContent = w.name;
  modal.querySelector('#wuModalCat').textContent = w.category + (w.os ? '  ·  ' + w.os : '');
  modal.querySelector('#wuModalTags').innerHTML = w.tags.map(t => '<span class="wu-tag">' + t + '</span>').join('');
  modal.querySelector('#wuModalSummary').textContent = w.summary;
  modal.querySelector('#wuModalSteps').innerHTML = (w.steps || []).map((s, i) =>
    '<div class="wu-step"><div class="wu-step-num">' + (i+1) + '</div><div>' + s + '</div></div>'
  ).join('');
  const link = modal.querySelector('#wuModalLink');
  link.href = w.writeupUrl || '#';
  if (!w.writeupUrl || w.writeupUrl === '#') { link.style.display = 'none'; } else { link.style.display = ''; }
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  applyCursorListeners();
}
window.closeWuModal = function() {
  const modal = document.getElementById('wuModal');
  if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
};
document.addEventListener('click', e => { if (e.target.id === 'wuModal') closeWuModal(); });

/* ════════════════════════════════════════════════
   RENDER CERTIFICATIONS
════════════════════════════════════════════════ */
function renderCertifications(certs) {
  const grid = document.getElementById('certsGrid');
  if (!grid) return;
  grid.innerHTML = certs.map((c, i) => {
    const colorStyle = 'color:' + c.color + ';border-color:' + c.color + ';';
    return '<div class="cert-card rev" style="--si:' + i + ';border-color:' + c.color + '22">'
         + '<div class="cert-status">' + c.status + '</div>'
         + '<div class="cert-badge-wrap" style="' + colorStyle + '">' + c.badge + '</div>'
         + '<div class="cert-platform">' + c.platform + '</div>'
         + '<div class="cert-name" style="color:' + c.color + '">' + c.name + '</div>'
         + '<div class="cert-desc">' + c.desc + '</div>'
         + '<div class="cert-issued">Achieved: ' + c.issued + '</div>'
         + (c.profileUrl && c.profileUrl !== '#certs' && c.profileUrl !== '#about'
            ? '<a href="' + c.profileUrl + '" class="cert-link" target="_blank" rel="noopener">View Profile ↗</a>'
            : '') + '</div>';
  }).join('');
}

/* ════════════════════════════════════════════════
   RESUME MODAL
════════════════════════════════════════════════ */
window.openResumeModal = function() {
  const modal = document.getElementById('resumeModal');
  if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; applyCursorListeners(); }
};
window.closeResumeModal = function() {
  const modal = document.getElementById('resumeModal');
  if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
};
document.addEventListener('click', e => { if (e.target.id === 'resumeModal') closeResumeModal(); });

/* ════════════════════════════════════════════════
   VISITOR COUNTER
════════════════════════════════════════════════ */
async function initVisitorCounter() {
  try {
    // Count this visit
    const res = await fetch('/api/visitors', { method: 'POST' }).then(r => r.json());
    const count = res.count || 0;
    const el = document.getElementById('hudVisitors');
    if (el) {
      el.textContent = count.toLocaleString();
      el.title = count.toLocaleString() + ' unique operators';
    }
  } catch (e) {
    try {
      const res = await fetch('/api/visitors').then(r => r.json());
      const el = document.getElementById('hudVisitors');
      if (el) el.textContent = (res.count || 0).toLocaleString();
    } catch(e2) {}
  }
}

/* ════════════════════════════════════════════════
   WORLD MAP SVG (simple dot map showing India)
════════════════════════════════════════════════ */
function initWorldMap() {
  const svg = document.getElementById('worldMapSvg');
  if (!svg) return;

  // Simplified continent outlines as path data (approximate, lightweight)
  const continents = [
    // North America
    'M 80 80 L 160 60 L 200 90 L 210 140 L 180 170 L 140 160 L 100 130 Z',
    // South America
    'M 150 175 L 185 170 L 200 200 L 195 250 L 170 280 L 145 260 L 140 220 Z',
    // Europe
    'M 360 55 L 420 50 L 440 70 L 430 95 L 400 100 L 370 90 L 350 75 Z',
    // Africa
    'M 370 110 L 430 105 L 450 140 L 445 200 L 420 240 L 390 245 L 365 210 L 355 160 Z',
    // Asia (simplified)
    'M 440 45 L 600 40 L 640 65 L 650 100 L 620 130 L 580 145 L 530 150 L 490 140 L 460 120 L 435 90 Z',
    // Australia
    'M 560 210 L 620 200 L 650 220 L 645 260 L 610 275 L 565 265 L 550 240 Z',
    // Greenland
    'M 200 25 L 250 20 L 265 40 L 255 60 L 220 65 L 195 50 Z',
  ];

  const ns = 'http://www.w3.org/2000/svg';
  continents.forEach(d => {
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'rgba(0,255,65,0.08)');
    path.setAttribute('stroke', 'rgba(0,255,65,0.2)');
    path.setAttribute('stroke-width', '0.5');
    svg.appendChild(path);
  });

  // India pin position (approx 78E, 22N -> SVG coords)
  // ViewBox 800x400, so lng maps to x: (78+180)/360*800=573, lat maps to y: (90-22)/180*400=151
  const indiaX = 573, indiaY = 151;

  // Pulsing ring
  const ring = document.createElementNS(ns, 'circle');
  ring.setAttribute('cx', indiaX);
  ring.setAttribute('cy', indiaY);
  ring.setAttribute('r', '6');
  ring.setAttribute('fill', 'none');
  ring.setAttribute('stroke', '#00ff41');
  ring.setAttribute('stroke-width', '1.5');
  ring.setAttribute('opacity', '0.6');
  ring.classList.add('wm-pin-ring');
  svg.appendChild(ring);

  // Dot
  const dot = document.createElementNS(ns, 'circle');
  dot.setAttribute('cx', indiaX);
  dot.setAttribute('cy', indiaY);
  dot.setAttribute('r', '4');
  dot.setAttribute('fill', '#00ff41');
  dot.setAttribute('filter', 'url(#glow)');
  dot.classList.add('wm-pin');
  svg.appendChild(dot);

  // Label
  const label = document.createElementNS(ns, 'text');
  label.setAttribute('x', indiaX + 10);
  label.setAttribute('y', indiaY - 4);
  label.setAttribute('fill', 'rgba(0,255,65,0.6)');
  label.setAttribute('font-size', '10');
  label.setAttribute('font-family', 'Share Tech Mono, monospace');
  label.textContent = 'Neo4U';
  svg.appendChild(label);
}

/* ════════════════════════════════════════════════
   COMMAND PALETTE (Ctrl+K)
════════════════════════════════════════════════ */
function initCommandPalette() {
  const overlay = document.getElementById('cmdPalette');
  const input   = document.getElementById('cmdPaletteInput');
  const results = document.getElementById('cmdPaletteResults');
  if (!overlay || !input || !results) return;

  // Items catalog
  const items = [
    // Sections
    { icon: '🏠', label: 'Home — Hero', category: 'Section', action: () => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' }) },
    { icon: '👤', label: 'About — Who am I', category: 'Section', action: () => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }) },
    { icon: '⚔️', label: 'Skills — Arsenal', category: 'Section', action: () => document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' }) },
    { icon: '💻', label: 'Projects — Active Exploits', category: 'Section', action: () => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }) },
    { icon: '🎯', label: 'Services — What I Offer', category: 'Section', action: () => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }) },
    { icon: '📅', label: 'Timeline — Experience', category: 'Section', action: () => document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' }) },
    { icon: '🚩', label: 'CTF — Scoreboard', category: 'Section', action: () => document.getElementById('ctf')?.scrollIntoView({ behavior: 'smooth' }) },
    { icon: '📝', label: 'Writeups — CTF Solutions', category: 'Section', action: () => document.getElementById('writeups')?.scrollIntoView({ behavior: 'smooth' }) },
    { icon: '🏅', label: 'Certifications — Clearance Level', category: 'Section', action: () => document.getElementById('certs')?.scrollIntoView({ behavior: 'smooth' }) },
    { icon: '✉️', label: 'Contact — Secure Channel', category: 'Section', action: () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) },
    // Actions
    { icon: '📄', label: 'View Resume', category: 'Action', action: () => openResumeModal() },
    { icon: '🔑', label: 'Download PGP Key', category: 'Action', action: () => window.open('/public-key.asc', '_blank') },
    { icon: '⬆️', label: 'Scroll to Top', category: 'Action', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    // Links
    { icon: '🐙', label: 'GitHub Profile', category: 'Link', action: () => window.open('https://github.com/sanketjaybhaye', '_blank') },
    { icon: '🔴', label: 'HackTheBox Profile', category: 'Link', action: () => window.open('https://app.hackthebox.com/users/2137346', '_blank') },
    { icon: '🟢', label: 'TryHackMe Profile', category: 'Link', action: () => window.open('https://tryhackme.com/p/Neo4U', '_blank') },
  ];

  let activeIdx = -1;

  function renderResults(query) {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? items.filter(it => it.label.toLowerCase().includes(q) || it.category.toLowerCase().includes(q))
      : items;
    activeIdx = filtered.length > 0 ? 0 : -1;

    if (filtered.length === 0) {
      results.innerHTML = '<div class="cp-no-results">> no results found for: ' + (query || '...') + '</div>';
      return;
    }

    results.innerHTML = filtered.map((it, i) =>
      '<div class="cp-result' + (i === 0 ? ' cp-active' : '') + '" data-idx="' + i + '">'
      + '<div class="cp-icon">' + it.icon + '</div>'
      + '<div class="cp-label">' + it.label + '</div>'
      + '<div class="cp-category">' + it.category + '</div>'
      + '</div>'
    ).join('');

    results.querySelectorAll('.cp-result').forEach((el, i) => {
      el.addEventListener('click', () => { filtered[i].action(); closePalette(); });
      el.addEventListener('mouseenter', () => {
        activeIdx = i;
        results.querySelectorAll('.cp-result').forEach(e => e.classList.remove('cp-active'));
        el.classList.add('cp-active');
      });
    });
    return filtered;
  }

  let currentFiltered = [];
  function openPalette() {
    overlay.classList.add('open');
    input.value = '';
    currentFiltered = renderResults('');
    setTimeout(() => input.focus(), 50);
  }
  function closePalette() {
    overlay.classList.remove('open');
    input.value = '';
  }

  // Ctrl+K to open
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      overlay.classList.contains('open') ? closePalette() : openPalette();
    }
    if (e.key === 'Escape' && overlay.classList.contains('open')) closePalette();

    if (overlay.classList.contains('open')) {
      const els = results.querySelectorAll('.cp-result');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIdx = Math.min(activeIdx + 1, els.length - 1);
        els.forEach((el, i) => el.classList.toggle('cp-active', i === activeIdx));
        els[activeIdx]?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIdx = Math.max(activeIdx - 1, 0);
        els.forEach((el, i) => el.classList.toggle('cp-active', i === activeIdx));
        els[activeIdx]?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter' && activeIdx >= 0 && currentFiltered) {
        e.preventDefault();
        currentFiltered[activeIdx]?.action();
        closePalette();
      }
    }
  });

  input.addEventListener('input', () => { currentFiltered = renderResults(input.value); activeIdx = 0; });

  // Click backdrop to close
  overlay.addEventListener('click', e => { if (e.target === overlay) closePalette(); });

  // Btn in nav
  const btn = document.getElementById('cmdPaletteBtn');
  if (btn) btn.addEventListener('click', openPalette);
}

/* ════════════════════════════════════════════════
   TERMINAL TAB AUTOCOMPLETE + ASCII COMMAND
════════════════════════════════════════════════ */
function patchHeroTerminal() {
  const input = document.getElementById('itermInput');
  if (!input) return;

  const cmdNames = ['help','whoami','skills','status','tools','pgp','contact','ctf','social','nmap','ls','cat resume','matrix','sudo rm -rf','clear','ascii'];

  input.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const val = input.value.toLowerCase();
      if (!val) return;
      const match = cmdNames.find(c => c.startsWith(val) && c !== val);
      if (match) {
        input.value = match;
      } else {
        const matches = cmdNames.filter(c => c.startsWith(val));
        if (matches.length > 1) {
          const out = document.getElementById('itermOutput');
          if (out) {
            const span = document.createElement('span');
            span.className = 'iterm-line';
            span.innerHTML = '<span class="iterm-dim">' + matches.join('  ') + '</span>';
            out.appendChild(span);
            out.scrollTop = out.scrollHeight;
          }
        }
      }
    }
  });

  // Mobile quick commands
  document.querySelectorAll('.mq-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.cmd;
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      input.focus();
    });
  });
}

/* ════════════════════════════════════════════════
   BOOTSTRAP — UPDATE
════════════════════════════════════════════════ */
// Patch the DOMContentLoaded to call new functions.
// We hook into window load as a supplement (main bootstrap runs in existing app.js)
window.addEventListener('load', async () => {
  try {
    const [writeups, certifications] = await Promise.all([
      fetch('/api/writeups').then(r => r.json()),
      fetch('/api/certifications').then(r => r.json()),
    ]);
    renderWriteups(writeups);
    renderCertifications(certifications);
    observeAll();
    applyCursorListeners();
    initHeadingScramble();
  } catch(e) {
    console.warn('[Neo4U extras] Failed to load writeups/certs:', e.message);
  }

  initCommandPalette();
  initVisitorCounter();
  initWorldMap();
  patchHeroTerminal();
});
