# Shakib Khan — Terminal Portfolio

A fully terminal-driven personal portfolio for a backend developer and CEH v13-certified ethical hacker. The entire site is one full-height shell — content lives behind commands, not on static page sections.

**Live stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · JetBrains Mono

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Description |
|---------|-------------|
| `help` | List all commands |
| `ls [path]` | List files at root or inside `projects/` |
| `cat <file>` | Print file contents (e.g. `cat about.md`, `cat projects/Auth_SERVICE.md`) |
| `whoami` | One-line identity |
| `projects` | List project files |
| `open <project-name>` | Open that project's GitHub repo in a new tab |
| `contact` | Shortcut for `cat contact.json` |
| `clear` | Clear the screen |
| `sudo hire-shakib` | Fake sudo password animation → mailto link |

## Project structure

```
app/                  Next.js App Router (layout, page, globals)
components/
  TerminalHeader.tsx  Static sysinfo, logo, whoami/status blocks, availability pill
  Terminal.tsx        Input/output engine, history, focus handling
  PortfolioShell.tsx  Loads filesystem + renders terminal
lib/
  virtualFs.ts        Virtual filesystem data + command handlers
scripts/
  fetch-repos.ts      Pulls GitHub repos at build time
data/
  github-repos.json   Generated repo list (committed fallback)
```

## GitHub repo sync

Before each build, `scripts/fetch-repos.ts` calls the GitHub API for `shakib-SKRLS` and writes `data/github-repos.json`. New public repos surface automatically as project files.

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

No extra config needed — App Router + static JSON import works out of the box.

## Design reference

The visual/interaction spec lives in `shakib-portfolio-preview.html` at the repo root. The Next.js app implements the same terminal UX with component separation and build-time GitHub integration.

## License

Private portfolio — all rights reserved.
