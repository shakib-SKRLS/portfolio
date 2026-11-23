"use client";

import { useEffect, useMemo, useState } from "react";
import SessionGate from "@/components/SessionGate";
import Terminal from "@/components/Terminal";
import TerminalBootLoader from "@/components/TerminalBootLoader";
import { buildVirtualFs } from "@/lib/virtualFs";
import githubRepos from "@/data/github-repos.json";
import type { GitHubRepoEntry } from "@/data/github-repos";
import { isSessionRecovered, markSessionRecovered } from "@/lib/session";

type Phase = "gate" | "loading" | "portfolio";

export default function PortfolioShell() {
  const [phase, setPhase] = useState<Phase>("gate");

  const fs = useMemo(
    () => buildVirtualFs(githubRepos as GitHubRepoEntry[]),
    []
  );

  // Returning visitors in the same tab session skip the breach intro
  // (README "Experience flow"). Checked in an effect so the server render
  // and the first client render agree — sessionStorage is client-only.
  useEffect(() => {
    if (isSessionRecovered()) setPhase("loading");
  }, []);

  if (phase === "gate") {
    return (
      <SessionGate
        onComplete={() => {
          markSessionRecovered();
          // SessionGate already plays TerminalBootLoader in its own
          // "booting" phase, so go straight to the terminal — no
          // second loader.
          setPhase("portfolio");
        }}
      />
    );
  }

  if (phase === "loading") {
    return <TerminalBootLoader onComplete={() => setPhase("portfolio")} />;
  }

  return <Terminal fs={fs} />;
}
