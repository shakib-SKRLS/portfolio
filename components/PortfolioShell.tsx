"use client";

import { useMemo, useState } from "react";
import Terminal from "@/components/Terminal";
import TerminalBootLoader from "@/components/TerminalBootLoader";
import { buildVirtualFs } from "@/lib/virtualFs";
import githubRepos from "@/data/github-repos.json";
import type { GitHubRepoEntry } from "@/data/github-repos";

type Phase = "loading" | "portfolio";

export default function PortfolioShell() {
  const [phase, setPhase] = useState<Phase>("loading");

  const fs = useMemo(
    () => buildVirtualFs(githubRepos as GitHubRepoEntry[]),
    []
  );

  if (phase === "loading") {
    return <TerminalBootLoader onComplete={() => setPhase("portfolio")} />;
  }

  return <Terminal fs={fs} />;
}
