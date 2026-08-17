"use client";

import { useMemo, useState, useEffect } from "react";
import SessionGate from "@/components/SessionGate";
import Terminal from "@/components/Terminal";
import { buildVirtualFs } from "@/lib/virtualFs";
import { isSessionRecovered, markSessionRecovered } from "@/lib/session";
import githubRepos from "@/data/github-repos.json";
import type { GitHubRepoEntry } from "@/data/github-repos";

type Phase = "loading" | "gate" | "portfolio";

export default function PortfolioShell() {
  const [phase, setPhase] = useState<Phase>("loading");

  const fs = useMemo(
    () => buildVirtualFs(githubRepos as GitHubRepoEntry[]),
    []
  );

  useEffect(() => {
    setPhase(isSessionRecovered() ? "portfolio" : "gate");
  }, []);

  const handleGateComplete = () => {
    markSessionRecovered();
    setPhase("portfolio");
  };

  if (phase === "loading") {
    return <div className="h-[100dvh] bg-bg" aria-hidden="true" />;
  }

  if (phase === "portfolio") {
    return <Terminal fs={fs} />;
  }

  return <SessionGate onComplete={handleGateComplete} />;
}
