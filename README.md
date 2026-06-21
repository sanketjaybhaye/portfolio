# Neo4U Portfolio

Hacker-themed personal portfolio built with **Node.js + Express + lowdb**.

## Quick Start

```bash
npm install
node server.js
# → http://localhost:3000
```

Dev mode (auto-restart):
```bash
npm run dev
```

## Editing Content

All portfolio content lives in **`portfolio.db.json`** — just edit the JSON and refresh the browser:

| Key | What it controls |
|-----|-----------------|
| `profile` | Alias, bio, location, counters |
| `skills` | 4 skill blocks, bar %s, tool chips |
| `projects` | 6 project cards, badges, links |
| `ctf` | Scoreboard rows + achievement cards |
| `contactLinks` | Email, GitHub, HTB, Twitter |
| `messages` | Contact form submissions (auto-filled) |

## Environment Variables

Copy `.env.example` → `.env` before deploying:

```env
PORT=3000
NODE_ENV=production
ADMIN_TOKEN=your-secret-token   # protects GET /api/messages
ALLOWED_ORIGIN=https://yourdomain.com
```

## Deployment

### Railway / Render / Fly.io
1. Push to GitHub (`.gitignore` already excludes `node_modules` and `portfolio.db.json`)
2. Set env vars on the platform dashboard
3. Set **start command**: `node server.js`
4. Note: `portfolio.db.json` is **not** committed — the DB is auto-seeded on first start

### Self-hosted (VPS)
```bash
npm install --production
NODE_ENV=production node server.js
# Or use PM2:
pm2 start server.js --name portfolio
```

## Update OG/Social Tags

Before deploying, update these in `public/index.html`:
- `og:url` → your real domain
- `og:image` / `twitter:image` → upload a preview screenshot
- `twitter:site` → your Twitter handle

## File Structure

```
Portfolio/
├── server.js          ← Express backend + REST API
├── package.json
├── .env.example       ← Copy to .env for production
├── .gitignore
├── portfolio.db.json  ← Auto-generated database (NOT committed)
└── public/
    ├── index.html     ← HTML shell
    ├── style.css      ← All styles
    └── app.js         ← All frontend JS + animations
```
