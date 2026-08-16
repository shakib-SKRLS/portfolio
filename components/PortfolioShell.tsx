"use client";

import { useMemo, useState } from "react";
import StartupLoader from "@/components/StartupLoader";
import Terminal from "@/components/Terminal";
import { buildVirtualFs } from "@/lib/virtualFs";
import githubRepos from "@/data/github-repos.json";
import type { GitHubRepoEntry } from "@/data/github-repos";

export default function PortfolioShell() {
  const [ready, setReady] = useState(false);

  const fs = useMemo(
    () => buildVirtualFs(githubRepos as GitHubRepoEntry[]),
    []
  );

  return (
    <>
      {!ready && <StartupLoader onComplete={() => setReady(true)} />}
      {ready && <Terminal fs={fs} />}
    </>
  );
}
