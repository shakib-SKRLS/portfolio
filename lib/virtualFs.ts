export interface ProjectFile {
  desc: string;
  content: string;
  repoUrl: string;
  language?: string;
}

export interface VirtualFs {
  about: string;
  skills: string;
  contact: string;
  projects: Record<string, ProjectFile>;
}

export interface CommandResult {
  output: string | null;
  html?: boolean;
  isError?: boolean;
  sideEffect?: "clear" | "mailto" | "open" | "clipboard" | "download";
  openUrl?: string;
  clipboardText?: string;
  downloadName?: string;
}

export interface TerminalLine {
  id: string;
  type: "echo" | "output" | "error";
  content: string;
  html?: boolean;
}

const GITHUB_USER = "shakib-SKRLS";
const EMAIL = "skrlskhan123@gmail.com";
export const RESUME_FILE = "Shakib_Khan_Resume.docx";
export const RESUME_URL = `/${RESUME_FILE}`;

const PROJECT_META: Record<
  string,
  { desc: string; language: string; body: string }
> = {
  Cyber_security: {
    desc: "security tooling",
    language: "Python",
    body: `Collection of offensive/defensive security exercises and tooling — recon,
scanning, and vulnerability-assessment scripts.

role    Solo — research + scripting
focus   Applying CEH v13 methodology hands-on in a controlled lab.`,
  },
  "Herb-supply-chain": {
    desc: "supply-chain transparency app",
    language: "JavaScript",
    body: `Web platform bringing transparency between herb suppliers and consumers.

role    Backend + API design
focus   Traceability from supplier to consumer — auth and data integrity.`,
  },
  "system-auditing-tool": {
    desc: "config/security audit CLI",
    language: "Python",
    body: `Audits system configuration and surfaces security-relevant misconfigurations.

role    Solo — build
focus   Automated checks against common hardening baselines.`,
  },
  FlightAndSearchService: {
    desc: "flight search backend",
    language: "JavaScript",
    body: `Backend service for flight search — query handling and results aggregation.

role    Backend service design
focus   API layer structured the way a real booking backend would be.`,
  },
  Auth_SERVICE: {
    desc: "authentication microservice",
    language: "JavaScript",
    body: `Standalone authentication service — tokens, sessions, access control.

role    Solo — build
focus   Security-first auth as a reusable service other apps sit behind.`,
  },
  tick_tack_toe_rust: {
    desc: "Rust CLI warm-up project",
    language: "Rust",
    body: `Tic-tac-toe in Rust — a systems-language warm-up project.

role    Solo — learning project
focus   Getting comfortable with Rust's ownership model.`,
  },
};

function projectFileName(repoName: string): string {
  return `${repoName}.md`;
}

function formatProjectContent(
  name: string,
  meta: { desc: string; language: string; body: string },
  repoUrl: string
): string {
  return `<span class="hl">${name}</span>  <span class="muted">[${meta.language}]</span>

${meta.body}
repo    <a href="${repoUrl}" target="_blank" rel="noopener">${repoUrl.replace("https://", "")}</a>`;
}

function defaultMeta(name: string, language?: string) {
  return {
    desc: language ? `${language} project` : "GitHub repository",
    language: language ?? "—",
    body: `Repository from github.com/${GITHUB_USER}/${name}.`,
  };
}

export function buildVirtualFs(
  githubRepos: { name: string; html_url: string; language: string | null }[] = []
): VirtualFs {
  const projects: Record<string, ProjectFile> = {};
  const repoMap = new Map(githubRepos.map((r) => [r.name, r]));

  const allNames = new Set([
    ...Object.keys(PROJECT_META),
    ...githubRepos.map((r) => r.name),
  ]);

  for (const name of Array.from(allNames)) {
    const repo = repoMap.get(name);
    const meta =
      PROJECT_META[name] ?? defaultMeta(name, repo?.language ?? undefined);
    const repoUrl =
      repo?.html_url ?? `https://github.com/${GITHUB_USER}/${name}`;
    const fname = projectFileName(name);

    projects[fname] = {
      desc: meta.desc,
      repoUrl,
      language: meta.language,
      content: formatProjectContent(name, meta, repoUrl),
    };
  }

  return {
    about: `Backend developer who thinks in systems and tries to break them on purpose.
<span class="hl">CEH v13 certified</span> — security isn't a checklist I bolt on at the
end, it's part of how I design things from the first schema.

Most of what I build lives on the server: APIs, auth services, data
pipelines. I care about the boring things that make backend work good —
clear service boundaries, sane error handling, and not leaving doors
unlocked because nobody checked.

Currently bootstrapping my own startup. Open to freelance, collabs, and
contract work — response time under 24 hours.`,

    skills: `{
  <span class="hl">"languages"</span>: ["JavaScript", "Python", "Rust", "Go", "C++", "Bash"],
  <span class="hl">"backend"</span>: ["Node.js", "Express", "Django", "Docker", "MongoDB", "PostgreSQL"],
  <span class="hl">"security"</span>: ["Kali Linux", "Burp Suite", "Wireshark", "Metasploit", "CEH v13"]
}`,

    contact: `{
  <span class="hl">"github"</span>   : "<a href="https://github.com/${GITHUB_USER}" target="_blank" rel="noopener">github.com/${GITHUB_USER}</a>",
  <span class="hl">"linkedin"</span> : "<a href="https://www.linkedin.com/in/shakib-khan-810265237/" target="_blank" rel="noopener">in/shakib-khan-810265237</a>",
  <span class="hl">"email"</span>    : "<a href="mailto:${EMAIL}">${EMAIL}</a>"
}`,

    projects,
  };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] ?? c
  );
}

function lsRoot(fs: VirtualFs): string {
  const rows = [
    `<tr><td class="fname">about.md</td><td class="fdesc">who I am</td></tr>`,
    `<tr><td class="fname">skills.json</td><td class="fdesc">tech stack</td></tr>`,
    `<tr><td class="fname">contact.json</td><td class="fdesc">reach me</td></tr>`,
    `<tr><td class="fname">${RESUME_FILE}</td><td class="fdesc">download resume</td></tr>`,
    `<tr><td class="fname">projects/</td><td class="fdesc">directory — ${Object.keys(fs.projects).length} case studies</td></tr>`,
  ];
  return `<table class="ls">${rows.join("")}</table>`;
}

function lsProjects(fs: VirtualFs): string {
  const rows = Object.entries(fs.projects).map(
    ([fname, file]) =>
      `<tr><td class="fname">${fname}</td><td class="fdesc">${file.desc}</td></tr>`
  );
  return `<table class="ls">${rows.join("")}</table>`;
}

function resolveProjectFile(fs: VirtualFs, path: string): ProjectFile | null {
  const clean = path.replace(/^\.?\/?/, "");
  if (clean.startsWith("projects/")) {
    const fname = clean.split("/")[1];
    return fs.projects[fname] ?? null;
  }
  if (fs.projects[clean]) return fs.projects[clean];
  return null;
}

function findProjectByName(
  fs: VirtualFs,
  name: string
): { fname: string; file: ProjectFile } | null {
  const normalized = name.replace(/\.md$/i, "").toLowerCase();
  for (const [fname, file] of Object.entries(fs.projects)) {
    const base = fname.replace(/\.md$/i, "").toLowerCase();
    if (base === normalized) return { fname, file };
  }
  return null;
}

export function executeCommand(raw: string, fs: VirtualFs): CommandResult {
  const trimmed = raw.trim();
  if (!trimmed) return { output: null };

  const lower = trimmed.toLowerCase();

  if (lower === "help") {
    return {
      output: `available commands:

  whoami        // short bio
  skills        // tech stack
  projects      // list projects
  contact       // github, linkedin, email
  resume        // download resume (.docx)
  email         // copy email to clipboard
  clear         // clear the screen

<span class="muted">advanced: ls · cat &lt;file&gt; · open &lt;project-name&gt;</span>`,
      html: true,
    };
  }

  if (lower === "whoami") {
    return { output: fs.about, html: true };
  }

  if (lower === "skills") {
    return { output: fs.skills, html: true };
  }

  if (lower === "contact") {
    return { output: fs.contact, html: true };
  }

  if (lower === "email") {
    return {
      output: `copied <span class="hl">${EMAIL}</span> to clipboard`,
      html: true,
      sideEffect: "clipboard",
      clipboardText: EMAIL,
    };
  }

  if (lower === "resume") {
    return {
      output: `downloading <span class="hl">${RESUME_FILE}</span> ...`,
      html: true,
      sideEffect: "download",
      openUrl: RESUME_URL,
      downloadName: RESUME_FILE,
    };
  }

  if (lower === "projects") {
    return {
      output:
        lsProjects(fs) +
        `\n<span class="muted">run "cat projects/&lt;name&gt;" for details, or "open &lt;name&gt;" for the repo.</span>`,
      html: true,
    };
  }

  if (lower === "clear") {
    return { output: null, sideEffect: "clear" };
  }

  if (lower === "sudo hire-shakib") {
    return {
      output: `[sudo] password for guest: ********
Permission granted.
<span class="hl">opening mailto:${EMAIL} ...</span>`,
      html: true,
      sideEffect: "mailto",
    };
  }

  const parts = trimmed.split(/\s+/);
  const base = parts[0].toLowerCase();
  const args = parts.slice(1);

  if (base === "ls") {
    const path = args.join(" ").trim();
    if (!path) return { output: lsRoot(fs), html: true };
    if (path.replace(/\/$/, "") === "projects")
      return { output: lsProjects(fs), html: true };
    return {
      output: `<span class="err">ls: ${escapeHtml(path)}: no such directory</span>`,
      html: true,
      isError: true,
    };
  }

  if (base === "cat") {
    const path = args.join(" ").trim();
    if (!path)
      return {
        output: `<span class="err">usage: cat &lt;file&gt;</span>`,
        html: true,
        isError: true,
      };

    const clean = path.replace(/^\.?\/?/, "");
    if (clean === "about.md") return { output: fs.about, html: true };
    if (clean === "skills.json") return { output: fs.skills, html: true };
    if (clean === "contact.json") return { output: fs.contact, html: true };
    if (
      clean.toLowerCase() === RESUME_FILE.toLowerCase() ||
      clean.toLowerCase() === "resume.docx"
    )
      return {
        output: `binary file — run <span class="hl">resume</span> to download ${RESUME_FILE}`,
        html: true,
      };

    const project = resolveProjectFile(fs, path);
    if (project) return { output: project.content, html: true };

    return {
      output: `<span class="err">cat: ${escapeHtml(path)}: no such file — try "ls"</span>`,
      html: true,
      isError: true,
    };
  }

  if (base === "open") {
    const name = args.join(" ").trim();
    if (!name)
      return {
        output: `<span class="err">usage: open &lt;project-name&gt;</span>`,
        html: true,
        isError: true,
      };

    const match = findProjectByName(fs, name);
    if (!match)
      return {
        output: `<span class="err">open: no project matching "${escapeHtml(name)}" — try "projects"</span>`,
        html: true,
        isError: true,
      };

    const displayName = match.fname.replace(/\.md$/i, "");
    return {
      output: `opening ${displayName} on GitHub ...`,
      sideEffect: "open",
      openUrl: match.file.repoUrl,
    };
  }

  return {
    output: `command not found: ${escapeHtml(trimmed)} — try <span class="hl">help</span>`,
    html: true,
    isError: true,
  };
}

export const PROMPT = "guest@shakib:~$";
export const EMAIL_ADDRESS = EMAIL;
