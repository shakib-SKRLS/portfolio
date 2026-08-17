# Shakib Khan — Terminal Portfolio

A fully terminal-driven personal portfolio for a backend developer and CEH v13-certified ethical hacker. The entire site is a genuine shell session — visitors interact through a fake breach intro, a three-step recovery gate, then a live command prompt backed by a virtual filesystem.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · JetBrains Mono

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Experience flow

1. **Breach intro** — Red status lines, real client metadata (IP, location, browser, OS), and a reassurance that nothing was stored.
2. **Recovery gate** — Three commands (`identify`, `trace --stop`, `restore`) unlock the terminal.
3. **Portfolio shell** — System header, wordmark, bio, and a live `guest@shakib:~$` prompt.

Returning visitors in the same tab session skip the intro (via `sessionStorage`).

## Commands

| Command | Description |
|---------|-------------|
| `help` | List all commands |
| `ls [path]` | List files at root or inside `projects/` |
| `cat <file>` | Print file contents (e.g. `cat about.md`, `cat projects/Auth_SERVICE.md`) |
| `whoami` | Short bio |
| `skills` | Tech stack JSON |
| `projects` | List project files |
| `open <project-name>` | Open that project's GitHub repo in a new tab |
| `contact` | GitHub, LinkedIn, email |
| `email` | Copy email to clipboard |
| `clear` | Clear the screen |
| `sudo hire-hakib` | Easter egg → mailto link |

## Project structure

```
app/                    Next.js App Router (layout, page, globals)
components/
  SessionGate.tsx       Breach intro + 3-step recovery gate (single scroll)
  BreachLog.tsx         Profile log display (IP, location, browser, etc.)
  TerminalHeader.tsx    Static sysinfo, logo, whoami/status blocks
  Terminal.tsx          Phase 2 shell — input, history, command dispatch
  PortfolioShell.tsx    Orchestrates breach → recovery → portfolio
lib/
  virtualFs.ts            Virtual filesystem + command handlers
  geoLookup.ts            IP geolocation with 3-provider fallback
  clientInfo.ts           Browser/OS parsing from navigator
  session.ts              sessionStorage recovery flag
scripts/
  fetch-repos.ts          Pulls GitHub repos at build time
data/
  github-repos.json       Generated repo list (committed fallback)
```

## IP geolocation fallback

During the breach intro, `lib/geoLookup.ts` fetches the visitor's public IP and approximate location client-side. Providers are tried in order with a ~4s timeout each:

1. `https://ipapi.co/json/`
2. `https://ipwho.is/`
3. `https://get.geojs.io/v1/ip/geo.json`

If all three fail (rate limit, network error, CORS block), fields show `unavailable` — nothing is fabricated. No server-side storage; data is displayed once and discarded.

## GitHub repo sync

Before each build, `scripts/fetch-repos.ts` calls the GitHub API for `shakib-SKRLS` and writes `data/github-repos.json`. Project `open` commands use live repo URLs when available.

```bash
npm run fetch-repos   # run manually
npm run build         # runs fetch-repos via prebuild hook
```

Optional: set `GITHUB_TOKEN` in your environment (or Vercel project settings) to avoid GitHub API rate limits during builds.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Framework preset: **Next.js** (auto-detected).
4. Build command: `npm run build` (default — includes `prebuild` repo fetch).
5. (Optional) Add `GITHUB_TOKEN` under **Settings → Environment Variables**.
6. Deploy.

No extra config needed — App Router + client-side geo fetch works out of the box.

## Design reference

The visual/interaction spec lives in `shakib-portfolio-preview.html` at the repo root.

## License

Private portfolio — all rights reserved.
