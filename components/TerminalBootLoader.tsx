"use client";

import { useEffect, useRef, useState } from "react";

const BOOT_LINES = [
  "initializing SKRLS_TERM v1.0.0",
  "verifying decryption key .................... OK",
  "mounting /dev/github ........................ OK",
  "mounting /dev/linkedin ...................... OK",
  "checking credentials ........................ CEH v13 VERIFIED",
  "starting guest shell ........................ OK",
];

interface TerminalBootLoaderProps {
  onComplete: () => void;
}

export default function TerminalBootLoader({ onComplete }: TerminalBootLoaderProps) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      setVisibleLines(BOOT_LINES);
      setProgress(100);
      const timer = setTimeout(() => onCompleteRef.current(), 400);
      return () => clearTimeout(timer);
    }

    let index = 0;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const schedule = (fn: () => void, delay: number) => {
      timers.push(setTimeout(fn, delay));
    };

    const showNext = () => {
      if (cancelled) return;

      const line = BOOT_LINES[index];
      if (!line) {
        setProgress(100);
        schedule(() => {
          if (cancelled) return;
          onCompleteRef.current();
        }, 500);
        return;
      }

      setVisibleLines((prev) => [...prev, line]);
      setProgress(Math.round(((index + 1) / BOOT_LINES.length) * 100));
      index++;
      schedule(showNext, 120 + Math.random() * 80);
    };

    showNext();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg px-6"
      aria-live="polite"
      aria-label="Loading terminal"
    >
      <div className="w-full max-w-[960px]">
        <p className="mb-8 text-[11px] uppercase tracking-[0.2em] text-muted">
          SKRLS_TERM
        </p>

        <div className="space-y-2 text-[13px] leading-relaxed text-text-dim">
          {visibleLines.map((line, i) => (
            <div key={i} className="animate-boot-line">
              {renderLine(line)}
            </div>
          ))}
        </div>

        <div className="mt-10 h-px w-full overflow-hidden bg-border">
          <div
            className="h-full bg-accent transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function renderLine(line: string) {
  if (line.includes("CEH v13 VERIFIED")) {
    const [before] = line.split("CEH v13 VERIFIED");
    return (
      <>
        {before}
        <span className="text-accent">CEH v13 VERIFIED</span>
      </>
    );
  }

  if (line.endsWith(" OK")) {
    const before = line.slice(0, -3);
    return (
      <>
        {before}
        <span className="text-accent"> OK</span>
      </>
    );
  }

  return line;
}
