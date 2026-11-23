import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const GITHUB_USER = "shakib-SKRLS";
const OUTPUT = join(process.cwd(), "data", "github-repos.json");

interface GitHubRepo {
  name: string;
  html_url: string;
  language: string | null;
  fork: boolean;
  archived: boolean;
}

interface SlimRepo {
  name: string;
  html_url: string;
  language: string | null;
}

async function fetchRepos(): Promise<SlimRepo[]> {
  const url = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "shakib-portfolio-build",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.warn(
        `[fetch-repos] GitHub API returned ${res.status} — using static project list only`
      );
      return [];
    }
    const data = (await res.json()) as GitHubRepo[];
    return data
      .filter((r) => !r.fork && !r.archived)
      .map(
        (r): SlimRepo => ({
          name: r.name,
          html_url: r.html_url,
          language: r.language,
        })
      );
  } catch (err) {
    console.warn("[fetch-repos] Failed to reach GitHub API:", err);
    return [];
  }
}

async function main() {
  mkdirSync(join(process.cwd(), "data"), { recursive: true });
  const repos = await fetchRepos();
  if (repos.length === 0) {
    // Never wipe the committed fallback (data/github-repos.json) when the
    // API is unreachable or rate-limited: prebuild runs on every build.
    console.warn(
      "[fetch-repos] No repos fetched — keeping existing data/github-repos.json"
    );
    return;
  }
  writeFileSync(OUTPUT, JSON.stringify(repos, null, 2));
  console.log(`[fetch-repos] Wrote ${repos.length} repos to ${OUTPUT}`);
}

main();
