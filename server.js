'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

/* ─── THREAT FEED CACHE ─── */
let threatFeedCache = null;
let threatFeedFetchedAt = 0;
const THREAT_FEED_TTL = 30 * 60 * 1000; // 30 minutes

async function fetchThreatFeed() {
  if (threatFeedCache && Date.now() - threatFeedFetchedAt < THREAT_FEED_TTL) {
    return threatFeedCache;
  }

  const fallback = [
    { sev: 'crit', text: 'CVE-2024-3400 · Palo Alto PAN-OS RCE — CVSS 10.0', link: 'https://nvd.nist.gov/vuln/detail/CVE-2024-3400' },
    { sev: 'high', text: 'CVE-2024-21762 · Fortinet SSL-VPN auth bypass — CVSS 9.6', link: 'https://nvd.nist.gov/vuln/detail/CVE-2024-21762' },
    { sev: 'crit', text: 'CVE-2024-27198 · JetBrains TeamCity auth bypass — CVSS 9.8', link: 'https://nvd.nist.gov/vuln/detail/CVE-2024-27198' },
    { sev: 'med',  text: 'CVE-2024-23897 · Jenkins arbitrary file read — CVSS 7.5', link: 'https://nvd.nist.gov/vuln/detail/CVE-2024-23897' },
    { sev: 'high', text: 'CVE-2024-1709 · ConnectWise ScreenConnect path traversal — CVSS 9.8', link: 'https://nvd.nist.gov/vuln/detail/CVE-2024-1709' },
    { sev: 'crit', text: 'CVE-2023-46604 · Apache ActiveMQ RCE (actively exploited)', link: 'https://nvd.nist.gov/vuln/detail/CVE-2023-46604' },
    { sev: 'high', text: 'CVE-2024-4577 · PHP CGI argument injection — CVSS 9.8', link: 'https://nvd.nist.gov/vuln/detail/CVE-2024-4577' },
    { sev: 'high', text: 'CVE-2024-38080 · Windows Hyper-V Zero-day (in-the-wild)', link: 'https://nvd.nist.gov/vuln/detail/CVE-2024-38080' },
    { sev: 'crit', text: 'CVE-2024-30078 · Windows WiFi Driver RCE — CVSS 8.8', link: 'https://nvd.nist.gov/vuln/detail/CVE-2024-30078' },
    { sev: 'med',  text: 'Midnight Blizzard APT targeting government orgs via spear-phishing', link: '#' },
  ];

  try {
    // Fetch latest CRITICAL CVEs from NVD API (free, no key needed)
    const url = 'https://services.nvd.nist.gov/rest/json/cves/2.0?cvssV3Severity=CRITICAL&resultsPerPage=15&startIndex=0';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json', 'User-Agent': 'Neo4U-Portfolio/1.0' }
    });
    clearTimeout(timeout);

    if (!resp.ok) throw new Error(`NVD API ${resp.status}`);
    const data = await resp.json();

    const items = (data.vulnerabilities || []).slice(0, 12).map(v => {
      const cve  = v.cve;
      const id   = cve.id;
      const desc = (cve.descriptions || []).find(d => d.lang === 'en')?.value || 'No description';
      const shortDesc = desc.length > 90 ? desc.slice(0, 87) + '...' : desc;
      const cvss = cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore
                || cve.metrics?.cvssMetricV30?.[0]?.cvssData?.baseScore
                || cve.metrics?.cvssMetricV2?.[0]?.cvssData?.baseScore
                || null;
      const score = cvss ? ` — CVSS ${cvss}` : '';
      const sev = cvss >= 9 ? 'crit' : cvss >= 7 ? 'high' : 'med';
      return { sev, text: `${id} · ${shortDesc}${score}`, link: `https://nvd.nist.gov/vuln/detail/${id}` };
    });

    if (items.length > 0) {
      threatFeedCache = items;
      threatFeedFetchedAt = Date.now();
      console.log(`[THREAT FEED] Fetched ${items.length} CVEs from NVD API`);
      return items;
    }
  } catch (err) {
    console.warn(`[THREAT FEED] NVD fetch failed: ${err.message} — using fallback`);
  }

  // Use fallback if fetch failed or returned nothing
  threatFeedCache = fallback;
  threatFeedFetchedAt = Date.now();
  return fallback;
}

/* ─── EMAIL TRANSPORT SETUP (EMAILJS API) ─── */
async function sendGhostReply(toEmail, toName) {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey || !privateKey) return;

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    accessToken: privateKey,
    template_params: {
      to_email: toEmail,
      to_name: toName
    }
  };

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[EMAIL ERROR] EmailJS rejected the email: ${errorText}`);
      return;
    }
    console.log(`[EMAIL] Ghost reply sent to ${toEmail} via EmailJS`);
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to interact with EmailJS: ${err.message}`);
  }
}

/* ─── DATABASE SETUP ─── */
const adapter = new FileSync(path.join(__dirname, 'portfolio_v2.db.json'));
const db = low(adapter);

/* ─── SEED DEFAULT DATA ─── */
db.defaults({
  "writeups": [],
  "certifications": [],
  "visitors": { "count": 0, "ips": [] },
  "profile": {
    "alias": "Sanket / Neo4U",
    "location": "[REDACTED]",
    "clearance": "root",
    "focus": [
      "web_pentesting",
      "rev_engineering",
      "exploit_dev",
      "malware_analysis"
    ],
    "certifications": "B.Sc. CS · CTF Player",
    "status": "WorkIn-Progress",
    "bio": [
      "I am a recent Computer Science graduate with a strong passion for cybersecurity, offensive security, and ethical hacking.",
      "Currently, I spend most of my time learning new attack vectors and practicing on platforms like HackTheBox and TryHackMe, and hunting for vulnerabilities through independent research.",
      "I am actively looking for full-time opportunities in Penetration Testing or Security Analyst roles to further develop my skills and contribute to secure environments."
    ],
    "counters": [
      {
        "value": 0,
        "label": "CVEs Reported"
      },
      {
        "value": 10,
        "label": "CTFs Played"
      },
      {
        "value": 30,
        "label": "Bugs Found"
      },
      {
        "value": 0,
        "label": "Hall of Fames"
      }
    ]
  },
  "skills": [
    {
      "id": "web",
      "icon": "🕷",
      "title": "Web Security",
      "bars": [
        {
          "name": "SQL Injection",
          "pct": 96
        },
        {
          "name": "XSS / CSRF / SSRF",
          "pct": 93
        },
        {
          "name": "Auth Bypass / IDOR",
          "pct": 91
        },
        {
          "name": "API Exploitation",
          "pct": 88
        }
      ],
      "tools": []
    },
    {
      "id": "rev",
      "icon": "🔬",
      "title": "Reverse Engineering",
      "bars": [
        {
          "name": "IDA Pro / Ghidra",
          "pct": 90
        },
        {
          "name": "x86/x64 Assembly",
          "pct": 85
        },
        {
          "name": "Binary Exploitation",
          "pct": 82
        },
        {
          "name": "Malware Analysis",
          "pct": 80
        }
      ],
      "tools": []
    },
    {
      "id": "net",
      "icon": "🌐",
      "title": "Network & Infra",
      "bars": [
        {
          "name": "Network Recon",
          "pct": 94
        },
        {
          "name": "Active Directory",
          "pct": 84
        },
        {
          "name": "Packet Analysis",
          "pct": 89
        },
        {
          "name": "Cloud Pentesting",
          "pct": 76
        }
      ],
      "tools": []
    },
    {
      "id": "lang",
      "icon": "⚙️",
      "title": "Languages & Tools",
      "bars": [
        {
          "name": "Python / Bash",
          "pct": 96
        },
        {
          "name": "C / C++",
          "pct": 74
        },
        {
          "name": "Metasploit / Burp Suite",
          "pct": 93
        },
        {
          "name": "Nmap / Wireshark",
          "pct": 91
        }
      ],
      "tools": [
        "Kali Linux",
        "nmap",
        "Aircrack-ng",
        "radare2",
        "sqlmap",
        "ffuf",
        "hashcat",
        "john",
        "BeEF"
      ]
    }
  ],
  "projects": [
    {
      "id": "op-001",
      "badge": "WEB3",
      "badgeClass": "bh",
      "name": "MINTARA NFT MARKETPLACE",
      "desc": "A state-of-the-art decentralized platform for discovering, creating, and trading irreplaceable digital assets on the Ethereum blockchain.",
      "tags": [
        "JavaScript",
        "Ethereum",
        "Web3.js",
        "Solidity"
      ],
      "links": [
        {
          "label": "GitHub",
          "href": "https://github.com/sanketjaybhaye/mintara-nft-marketplace"
        }
      ]
    },
    {
      "id": "op-002",
      "badge": "RECON",
      "badgeClass": "bc",
      "name": "ROBO RECON",
      "desc": "Advanced reconnaissance framework automating robots.txt analysis, sitemap crawling, hidden URL discovery, and target intelligence collection.",
      "tags": [
        "Python",
        "Reconnaissance",
        "Bug Bounty"
      ],
      "links": [
        {
          "label": "GitHub",
          "href": "https://github.com/sanketjaybhaye/RoboRecon"
        }
      ]
    },
    {
      "id": "op-003",
      "badge": "TOOL",
      "badgeClass": "bm",
      "name": "KNOW IP",
      "desc": "Information gathering tool that combines multiple network reconnaissance options into a single streamlined utility.",
      "tags": [
        "Shell",
        "Info-Gathering",
        "Network Security"
      ],
      "links": [
        {
          "label": "GitHub",
          "href": "https://github.com/sanketjaybhaye/KnowIP"
        }
      ]
    },
    {
      "id": "op-004",
      "badge": "WIFI",
      "badgeClass": "bm",
      "name": "WIFI BREAKER",
      "desc": "An educational wireless security auditing tool designed to understand network vulnerabilities and hardening techniques.",
      "tags": [
        "Shell",
        "Wireless Security"
      ],
      "links": [
        {
          "label": "GitHub",
          "href": "https://github.com/sanketjaybhaye/WiFiBreaker"
        }
      ]
    },
    {
      "id": "op-005",
      "badge": "SCRAPER",
      "badgeClass": "bl",
      "name": "WEB SCRAPER",
      "desc": "A Python-based utility for extracting data from websites. Built with consideration for permissions and ethical scraping practices.",
      "tags": [
        "Python",
        "Data Extraction"
      ],
      "links": [
        {
          "label": "GitHub",
          "href": "https://github.com/sanketjaybhaye/Web_Scraper"
        }
      ]
    },
    {
      "id": "op-006",
      "badge": "GUIDE",
      "badgeClass": "bl",
      "name": "HACKING STUFF",
      "desc": "A curated collection of resources, cheatsheets, and educational materials tailored for beginners diving into ethical hacking.",
      "tags": [
        "Python",
        "Cheatsheets",
        "Education"
      ],
      "links": [
        {
          "label": "GitHub",
          "href": "https://github.com/sanketjaybhaye/Hacking_Stuff"
        }
      ]
    }
  ],
  "ctf": {
    "scores": [
      {
        "rank": "Top Tier",
        "comp": "HackTheBox",
        "pts": "#913",
        "gold": true
      },
      {
        "rank": "Active",
        "comp": "TryHackMe",
        "pts": "TOP 1%",
        "gold": true
      },
      {
        "rank": "#1",
        "comp": "loveatfirstbreach CTF",
        "pts": "2,400",
        "gold": false
      },
      {
        "rank": "Participant",
        "comp": "PicoCTF 2024",
        "pts": "",
        "gold": false
      }
    ],
    "achievements": [
      {
        "icon": "🎓",
        "title": "COMPUTER SCIENCE GRADUATE",
        "body": "Recently graduated with a degree in Computer Science, focusing on networking, software development, and foundational security concepts.",
        "foot": "Class of 2026"
      },
      {
        "icon": "🚩",
        "title": "ACTIVE CTF PLAYER",
        "body": "Regularly complete machines and participate in challenges on HackTheBox and TryHackMe. Focused on privilege escalation and web exploits.",
        "foot": "HTB & THM Platforms"
      },
      {
        "icon": "🐛",
        "title": "INDEPENDENT BUG BOUNTY",
        "body": "Actively hunting for vulnerabilities to gain practical experience. Found and reported 30+ security bugs in various programs.",
        "foot": "2024 - Present"
      }
    ]
  },
  "contactLinks": [
    {
      "platform": "Email (PGP)",
      "handle": "sanket.sec@proton.me",
      "href": "mailto:sanket.sec@proton.me"
    },
    {
      "platform": "GitHub",
      "handle": "github/sanketjaybhaye",
      "href": "https://github.com/sanketjaybhaye"
    },
    {
      "platform": "HackTheBox",
      "handle": "HTB/Neo4U",
      "href": "https://app.hackthebox.com/users/2137346?profile-top-tab=machines&ownership-period=1M&profile-bottom-tab=prolabs"
    },
    {
      "platform": "TryHackMe",
      "handle": "@Neo4U",
      "href": "https://tryhackme.com/p/Neo4U"
    },
    {
      "platform": "Twitter / X",
      "handle": "@null_byte_",
      "href": "https://twitter.com/null_byte_"
    }
  ],
  "messages": [
    {
      "id": 1774118415158,
      "name": "sanket",
      "email": "sanket.sec@proton.me",
      "message": "-----BEGIN PGP MESSAGE-----\n\nwcFMAz4m2aDKUDu/AQ//a2lSi79DClzGbgTIr7cfV1pcAJxEv+PRZHkX+s4R\nr4FkNVeafIbX9x8c/Jet8Iq8rXq16xiI+oDBbTgauHN5ZY/DD7fzwEZOW0RE\nEcpPP5B71rQZNPsro4NKrLpBb4X2TaIdCssCll633g6WA+U+xIt8IJYTDv4s\n5goLrJsAbnl0OoztIGGaXaO8rDJ7rQKRFhrHcjnHwraz1iHQsusdO9aAR5AJ\nohp7picXVUFGTYbu7KSg9Xsm96WMPS4Ewq+V8ZzdEgM+S/aMvcofSxYec9gq\nSvYFU6Kb/GXHC09q+0TyYMhNUoe6WQAEPWGubHZj3s0NXZ/rLE8s7AlBx9cd\nfkJEEnp1Hs2ZQSIFcRPY1h43MamrowXnzgWKpWTdwpL+Ds9kwSpVkhEyXGIL\nZVlppQgwk6RYLLMlFT24pm7TFsm9gQHV05M5GNprKtxQ8SupP2LozInC1e/+\n1wKd2B12E6nbywAXJVdxcSeepl2WIVMkuDqG5DTkQ8GBfCMcqo9Te8PHUN2m\nJtTYSnl7V60ATl4EYe71fK3i4NoP1fke/eOyfuzNOA/mDKkUr+rZX/zwzqug\nCm7GhtoqQuOFCc8ola1kGZ64NZhewnYfwaJbAgj2N/ILKONayYr13KNZRTRE\nuhGnObU/YaxPUgzjmpG+9fVs2md6T7CCTdt222VlC4HSUgEaMgm0mW4adiOh\nPuzv/15lfHsHlwzUbI9Fwt6I8FbRqiNRI0toRrz1JexF+M93Em4yohsH7SWV\nMirdvi+JUlSXHPqlw2PHAn3fqOnLM1tYcz0=\n=7spj\n-----END PGP MESSAGE-----\n",
      "timestamp": "2026-03-21T18:40:15.158Z"
    }
  ],
  "services": [
    {
      "icon": "🎯",
      "title": "Web App Penetration Testing",
      "desc": "Familiar with OWASP Top 10 vulnerabilities, manual testing, and writing detailed vulnerability reports with PoCs.",
      "tags": [
        "Web App",
        "Burp Suite",
        "API"
      ]
    },
    {
      "icon": "🔍",
      "title": "Vulnerability Assessment",
      "desc": "Identifying security flaws and misconfigurations utilizing automated tools, paired with manual verification.",
      "tags": [
        "Nessus",
        "Nmap",
        "Analysis"
      ]
    },
    {
      "icon": "💻",
      "title": "Secure Development Basics",
      "desc": "Understanding of secure coding practices and common security pitfalls within the software development lifecycle.",
      "tags": [
        "Code Review",
        "Python",
        "Bash"
      ]
    }
  ],
  "timeline": [
    {
      "year": "2026",
      "title": "B.Sc. Computer Science",
      "org": "University",
      "type": "edu",
      "desc": "Graduated this year with a strong foundation in computer networks, algorithms, and cybersecurity principles."
    },
    {
      "year": "2025",
      "title": "Independent Security Researcher",
      "org": "Bug Bounty Platforms",
      "type": "work",
      "desc": "Started hunting on Bug Bounty platforms and Vulnerability Disclosure Programs. Found 30+ bugs across various web assets."
    },
    {
      "year": "2024",
      "title": "Active CTF Player",
      "org": "HackTheBox & TryHackMe",
      "type": "cert",
      "desc": "Began practical training on offensive security platforms. Completed numerous learning paths and rooted multiple machines."
    }
  ],
  "pgp": {
    "fingerprint": "65F4 D2B0 2C38 CFB3 2534 E285 B1F6 20A7 3CD5 EB6E",
    "keyId": "0x3CD5EB6E",
    "keyUrl": "/public-key.asc",
    "algorithm": "RSA 4096"
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
app.get('/api/writeups', (req, res) => res.json(db.get('writeups').value()));
app.get('/api/certifications', (req, res) => res.json(db.get('certifications').value()));

// Visitor counter — unique per IP, max 1 IPs array size 5000
app.post('/api/visitors', (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const visitors = db.get('visitors').value() || { count: 0, ips: [] };
  const ips = Array.isArray(visitors.ips) ? visitors.ips : [];
  let count = visitors.count || 0;
  if (!ips.includes(ip)) {
    count++;
    const newIps = [...ips.slice(-4999), ip]; // keep max 5000
    db.set('visitors', { count, ips: newIps }).write();
  }
  res.json({ count: db.get('visitors.count').value() });
});
app.get('/api/visitors', (req, res) => {
  const count = db.get('visitors.count').value() || 1247;
  res.json({ count });
});

// Live threat feed — fetches from NVD API with caching
app.get('/api/threat-feed', async (req, res) => {
  try {
    const items = await fetchThreatFeed();
    res.json(items);
  } catch (err) {
    console.error('[THREAT FEED] Error:', err.message);
    res.status(500).json([]);
  }
});

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
  
  // Fire ghost reply asynchronously (doesn't block the response)
  sendGhostReply(entry.email, entry.name);
  
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
