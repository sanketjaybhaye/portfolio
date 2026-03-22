'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

/* ─── DATABASE SETUP ─── */
const adapter = new FileSync(path.join(__dirname, 'portfolio.db.json'));
const db = low(adapter);

/* ─── SEED DEFAULT DATA ─── */
db.defaults({
  profile: {
    alias: 'null_byte',
    location: '[REDACTED]',
    clearance: 'root',
    focus: ['web_pentesting', 'rev_engineering', 'exploit_dev', 'malware_analysis'],
    certifications: 'OSCP·CEH·eJPT',
    status: 'available',
    bio: [
      "A digital ghost operating at the edge of systems. I <em>break things legally</em> so they can't be broken illegally. 5+ years hunting vulnerabilities across web apps, binaries, and networks.",
      "I've poked holes in Fortune 500 infrastructure, reported <em>zero-day vulnerabilities</em> to major vendors, and competed against the world's best hackers in elite CTF competitions.",
      "Currently running <em>independent security research</em> and accepting pentest contracts. If you have a system that needs hardening — I'm your null byte."
    ],
    counters: [
      { value: 134, label: 'CVEs Reported' },
      { value: 52, label: 'CTFs Played' },
      { value: 320, label: 'Bugs Found' },
      { value: 14, label: 'Hall of Fames' }
    ]
  },

  skills: [
    {
      id: 'web',
      icon: '🕷',
      title: 'Web Security',
      bars: [
        { name: 'SQL Injection', pct: 96 },
        { name: 'XSS / CSRF / SSRF', pct: 93 },
        { name: 'Auth Bypass / IDOR', pct: 91 },
        { name: 'API Exploitation', pct: 88 }
      ],
      tools: []
    },
    {
      id: 'rev',
      icon: '🔬',
      title: 'Reverse Engineering',
      bars: [
        { name: 'IDA Pro / Ghidra', pct: 90 },
        { name: 'x86/x64 Assembly', pct: 85 },
        { name: 'Binary Exploitation', pct: 82 },
        { name: 'Malware Analysis', pct: 80 }
      ],
      tools: []
    },
    {
      id: 'net',
      icon: '🌐',
      title: 'Network & Infra',
      bars: [
        { name: 'Network Recon', pct: 94 },
        { name: 'Active Directory', pct: 84 },
        { name: 'Packet Analysis', pct: 89 },
        { name: 'Cloud Pentesting', pct: 76 }
      ],
      tools: []
    },
    {
      id: 'lang',
      icon: '⚙️',
      title: 'Languages & Tools',
      bars: [
        { name: 'Python / Bash', pct: 96 },
        { name: 'C / C++', pct: 74 },
        { name: 'Metasploit / Burp Suite', pct: 93 },
        { name: 'Nmap / Wireshark', pct: 91 }
      ],
      tools: ['Kali Linux', 'pwndbg', 'radare2', 'sqlmap', 'ffuf', 'hashcat', 'john', 'BeEF']
    }
  ],

  projects: [
    {
      id: 'op-001',
      badge: 'CRITICAL',
      badgeClass: 'bc',
      name: 'BYTE PHANTOM',
      desc: 'Advanced SQLi framework with WAF-bypass chains. Handles time-based blind, error-based, union & stacked queries across MySQL, MSSQL, PostgreSQL, Oracle.',
      tags: ['Python', 'SQLi', 'WAF Bypass', 'OWASP Top 10'],
      links: [{ label: 'GitHub', href: '#' }, { label: 'Write-up', href: '#' }, { label: 'Demo', href: '#' }]
    },
    {
      id: 'op-002',
      badge: 'HIGH',
      badgeClass: 'bh',
      name: 'GHOST OSINT',
      desc: 'Passive recon engine aggregating 45+ sources — DNS records, cert transparency logs, social media, darkweb paste sites. Full profile in under 60 seconds.',
      tags: ['OSINT', 'Python', 'Recon', 'Threat Intel'],
      links: [{ label: 'GitHub', href: '#' }, { label: 'Write-up', href: '#' }]
    },
    {
      id: 'op-003',
      badge: 'CRITICAL',
      badgeClass: 'bc',
      name: 'NULL LOADER',
      desc: 'Polymorphic shellcode generator & loader with AMSI/EDR evasion. Defeats static and behavioral analysis. Generates position-independent shellcode for any arch.',
      tags: ['C', 'ASM', 'AV Evasion', 'PE Injection'],
      links: [{ label: 'Private Repo', href: '#' }, { label: 'Write-up', href: '#' }]
    },
    {
      id: 'op-004',
      badge: 'MEDIUM',
      badgeClass: 'bm',
      name: 'CIPHER AUDIT',
      desc: 'TLS/crypto weakness scanner. Detects weak cipher suites, padding oracle, timing attacks, key mismanagement and BEAST/POODLE across web targets.',
      tags: ['Crypto', 'TLS', 'Python', 'Audit'],
      links: [{ label: 'GitHub', href: '#' }, { label: 'Demo', href: '#' }]
    },
    {
      id: 'op-005',
      badge: 'HIGH',
      badgeClass: 'bh',
      name: 'FUZZBYTE',
      desc: 'Schema-aware REST API fuzzer. Auto-discovers undocumented endpoints, IDOR flaws, mass assignment bugs, and business logic vulnerabilities at scale.',
      tags: ['API', 'Fuzzing', 'IDOR', 'REST'],
      links: [{ label: 'GitHub', href: '#' }, { label: 'Demo', href: '#' }]
    },
    {
      id: 'op-006',
      badge: 'RESEARCH',
      badgeClass: 'bl',
      name: 'AD BLOODHOUND+',
      desc: 'Extended Active Directory attack path tool. Identifies Kerberoastable accounts, DCSync paths, ACL abuses, and lateral movement chains in enterprise networks.',
      tags: ['AD', 'Kerberos', 'PowerShell', 'BloodHound'],
      links: [{ label: 'GitHub', href: '#' }, { label: 'Write-up', href: '#' }]
    }
  ],

  ctf: {
    scores: [
      { rank: '#1', comp: 'DEF CON CTF 2024', pts: '9,820', gold: true },
      { rank: '#1', comp: 'NahamCon CTF 2024', pts: '8,600', gold: true },
      { rank: '#3', comp: 'HackTheBox Global', pts: '7,440', gold: false },
      { rank: '#2', comp: 'Google CTF 2023', pts: '6,950', gold: false },
      { rank: '#4', comp: 'PicoCTF 2023', pts: '6,700', gold: false },
      { rank: '#5', comp: 'DownUnderCTF 2023', pts: '5,880', gold: false },
      { rank: '#6', comp: 'CTFtime Global Top 10', pts: '5,200', gold: false }
    ],
    achievements: [
      {
        icon: '🏆',
        title: 'DEF CON CTF FINALIST',
        body: 'Top 5 worldwide in the most prestigious hacking competition. Solved 16 challenges across pwn, crypto, reversing, and web categories under extreme time pressure.',
        foot: 'Las Vegas · 2024 · Team: PHANTOM_NULL'
      },
      {
        icon: '🔓',
        title: 'ZERO-DAY RCE — FORTUNE 500',
        body: 'Discovered a critical remote code execution vulnerability in an enterprise authentication service used by millions. Responsibly disclosed. CVE-2024-XXXXX assigned.',
        foot: 'Bug Bounty · $18,500 Reward · CRITICAL Severity'
      },
      {
        icon: '⭐',
        title: 'HALL OF FAME × 14',
        body: 'Recognized by Google, Microsoft, Meta, Apple, Amazon, and 9 others for responsible vulnerability disclosure through their official bug bounty programs.',
        foot: '2020–2024 · Various Programs'
      },
      {
        icon: '📜',
        title: 'OSCP + CEH + eJPT CERTIFIED',
        body: 'Offensive Security Certified Professional with advanced pentesting credentials. Occasional trainer at university cybersecurity workshops and local hacker meetups.',
        foot: 'Certifications · 2020–2024'
      }
    ]
  },

  contactLinks: [
    { platform: 'Email (PGP)', handle: 'nullbyte@pm.me', href: 'mailto:nullbyte@pm.me' },
    { platform: 'GitHub', handle: 'github/null-byte', href: 'https://github.com/sanketjaybhaye' },
    { platform: 'HackTheBox', handle: 'HTB/null_byte', href: 'https://app.hackthebox.com/profile/null_byte' },
    { platform: 'Twitter / X', handle: '@null_byte_', href: 'https://twitter.com/null_byte_' }
  ],

  messages: [],

  services: [
    {
      icon: '🎯',
      title: 'Penetration Testing',
      desc: 'Full-scope web, network, and infrastructure pentests. OWASP-aligned methodology, detailed reports with PoC for every finding.',
      tags: ['Web App', 'Network', 'API', 'Cloud']
    },
    {
      icon: '🔍',
      title: 'Bug Bounty Consulting',
      desc: 'Set up and triage your bug bounty program. Define scope, severity guidelines, and response workflows that attract quality researchers.',
      tags: ['HackerOne', 'Bugcrowd', 'Private Programs']
    },
    {
      icon: '📋',
      title: 'Code & Architecture Review',
      desc: 'Manual source code audit for security vulnerabilities. Covers authentication flaws, injection points, crypto misuse, and insecure design patterns.',
      tags: ['SAST', 'DAST', 'Threat Modeling']
    },
    {
      icon: '🎓',
      title: 'Security Training',
      desc: 'Hands-on workshops for developer teams: secure coding, OWASP Top 10 walkthroughs, CTF-style labs, and red team fundamentals.',
      tags: ['Workshops', 'CTF Labs', 'Red Team Basics']
    }
  ],

  timeline: [
    {
      year: '2024',
      title: 'Independent Security Researcher',
      org: 'Self-Employed',
      type: 'work',
      desc: 'Full-time independent research, private pentest engagements, and bug bounty hunting. DEF CON CTF finalist. 50+ CVEs reported.'
    },
    {
      year: '2023',
      title: 'Senior Penetration Tester',
      org: 'Red Team Corp',
      type: 'work',
      desc: 'Led red team engagements for Fortune 500 clients. Specialized in Active Directory attacks, cloud infrastructure pentesting, and social engineering.'
    },
    {
      year: '2022',
      title: 'OSCP + CEH Certified',
      org: 'Offensive Security / EC-Council',
      type: 'cert',
      desc: 'Passed OSCP (Offensive Security Certified Professional) with distinction. Completed CEH practical exam. Began eJPT research track.'
    },
    {
      year: '2021',
      title: 'Security Analyst',
      org: 'CyberShield Inc.',
      type: 'work',
      desc: 'SOC analyst and junior pentester. First CVE published (CVE-2021-XXXXX). Started competing in international CTF competitions.'
    },
    {
      year: '2020',
      title: 'B.Sc. Computer Science',
      org: 'University of Technology',
      type: 'edu',
      desc: 'Graduated with First Class Honours. Thesis on adversarial machine learning and evasion attacks. Founded the university cyber security club.'
    }
  ],

  pgp: {
    fingerprint: '65F4 D2B0 2C38 CFB3 2534 E285 B1F6 20A7 3CD5 EB6E',
    keyId: '0x3CD5EB6E',
    keyUrl: '/public-key.asc',
    algorithm: 'RSA 4096'
  }

}).write();

/* ─── SIMPLE IN-MEMORY RATE LIMITER ─── */
const rateLimitMap = new Map();
function rateLimit(windowMs, max) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const rec = rateLimitMap.get(ip) || { count: 0, start: now };
    if (now - rec.start > windowMs) { rec.count = 0; rec.start = now; }
    rec.count++;
    rateLimitMap.set(ip, rec);
    if (rec.count > max) {
      return res.status(429).json({ error: 'Too many requests. Try again later.' });
    }
    next();
  };
}

/* ─── EXPRESS APP ─── */
const app = express();

/* ─── SECURITY HEADERS ─── */
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json({ limit: '10kb' }));  // Prevent large payload attacks
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0  // Cache static assets in prod
}));

/* ─── API ROUTES ─── */

app.get('/api/profile', (req, res) => res.json(db.get('profile').value()));
app.get('/api/skills', (req, res) => res.json(db.get('skills').value()));
app.get('/api/projects', (req, res) => res.json(db.get('projects').value()));
app.get('/api/ctf', (req, res) => res.json(db.get('ctf').value()));
app.get('/api/contact-links', (req, res) => res.json(db.get('contactLinks').value()));
app.get('/api/services', (req, res) => res.json(db.get('services').value()));
app.get('/api/timeline', (req, res) => res.json(db.get('timeline').value()));
app.get('/api/pgp', (req, res) => res.json(db.get('pgp').value()));

// Contact form — rate limited: max 3 submissions per IP per 15 min
app.post('/api/contact', rateLimit(15 * 60 * 1000, 3), (req, res) => {
  const { name, email, message } = req.body;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ''));
  if (!name || !emailOk || !message) {
    return res.status(400).json({ error: 'All fields required and email must be valid.' });
  }
  const entry = {
    id: Date.now(),
    name: String(name).slice(0, 120),
    email: String(email).slice(0, 200),
    message: String(message).slice(0, 15000),
    timestamp: new Date().toISOString()
  };
  db.get('messages').push(entry).write();
  console.log(`[MSG] ${entry.timestamp} | From: ${entry.name} <${entry.email}>`);
  res.json({ success: true, id: entry.id });
});

// Messages endpoint — protected by token in production
app.get('/api/messages', (req, res) => {
  const adminToken = process.env.ADMIN_TOKEN;
  if (adminToken && req.headers['x-admin-token'] !== adminToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json(db.get('messages').value());
});

// Block direct access to database file
app.get('/portfolio.db.json', (req, res) => res.status(403).json({ error: 'Forbidden' }));

// SPA fallback — serve index.html for any unknown route
app.use((req, res) => {
  // Don't fallback for API routes that don't exist
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ─── GLOBAL ERROR HANDLER ─── */
app.use((err, req, res, _next) => {
  console.error('[ERR]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

/* ─── START SERVER ─── */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n  ██ null_byte portfolio`);
  console.log(`  ▸ Local:   http://localhost:${PORT}`);
  console.log(`  ▸ Mode:    ${process.env.NODE_ENV || 'development'}`);
  console.log(`  ▸ DB:      portfolio.db.json\n`);
});
