"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import TerminalBootLoader from "@/components/TerminalBootLoader";
import { BreachLog } from "@/components/BreachLog";
import { getClientInfo } from "@/lib/clientInfo";
import {
  BREACH_STATUS_LINES,
  type BreachSnapshot,
} from "@/lib/breachContent";
import {
  BREACH_REASSURANCE,
  CIPHER_HINT,
  DECRYPT_INSTRUCTION,
  ENCRYPTED_MESSAGE_LINES,
  ENCRYPTED_NOTICE,
} from "@/lib/breachCipher";
import { lookupGeoCached } from "@/lib/geoLookup";

const RECOVERY_PROMPT = "root@unknown:~#";

const STEPS = [
  { command: "identify", success: "✓ identity confirmed." },
  { command: "trace --stop", success: "✓ trace terminated." },
  { command: "restore", success: "✓ access restored." },
] as const;

function normalizeInput(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeCommand(command: string): string {
  return command.toLowerCase().replace(/[^a-z0-9]/g, "");
}

interface OutputLine {
  id: string;
  type: "echo" | "success" | "error";
  content: string;
}

let lineId = 0;
function nextLineId() {
  return `gate-${++lineId}`;
}

type BreachPhase =
  | "status"
  | "profile"
  | "encrypted"
  | "recovery"
  | "decrypted"
  | "booting";

interface SessionGateProps {
  onComplete: () => void;
}

export default function SessionGate({ onComplete }: SessionGateProps) {
  const [breachPhase, setBreachPhase] = useState<BreachPhase>("status");
  const [statusCount, setStatusCount] = useState(0);
  const [snapshot, setSnapshot] = useState<BreachSnapshot | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [lines, setLines] = useState<OutputLine[]>([]);
  const [input, setInput] = useState("");

  const screenRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputBarRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const scrollToBottom = useCallback(() => {
    const el = screenRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [statusCount, breachPhase, lines, snapshot, scrollToBottom]);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const client = getClientInfo();
    lookupGeoCached().then((geo) => {
      setSnapshot({ geo, client });
    });

    if (reducedMotion) {
      setStatusCount(BREACH_STATUS_LINES.length);
      setBreachPhase("profile");
      return;
    }

    let index = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const showNext = () => {
      if (index < BREACH_STATUS_LINES.length) {
        index++;
        setStatusCount(index);
        timers.push(setTimeout(showNext, 400));
      } else {
        timers.push(setTimeout(() => setBreachPhase("profile"), 300));
      }
    };

    timers.push(setTimeout(showNext, 200));
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (breachPhase !== "profile" || !snapshot) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const delay = reducedMotion ? 0 : 2000;

    const timer = setTimeout(() => setBreachPhase("encrypted"), delay);
    return () => clearTimeout(timer);
  }, [breachPhase, snapshot]);

  useEffect(() => {
    if (breachPhase !== "encrypted") return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const delay = reducedMotion ? 0 : 1800;

    const timer = setTimeout(() => setBreachPhase("recovery"), delay);
    return () => clearTimeout(timer);
  }, [breachPhase]);

  useEffect(() => {
    if (breachPhase !== "decrypted") return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const delay = reducedMotion ? 800 : 4000;

    const timer = setTimeout(() => setBreachPhase("booting"), delay);
    return () => clearTimeout(timer);
  }, [breachPhase]);

  useEffect(() => {
    if (breachPhase !== "recovery") return;
    inputRef.current?.focus();
  }, [breachPhase]);

  useEffect(() => {
    if (breachPhase !== "recovery") return;

    const focusInput = () => inputRef.current?.focus();
    document.addEventListener("click", focusInput);
    return () => document.removeEventListener("click", focusInput);
  }, [breachPhase]);

  useEffect(() => {
    const inputEl = inputRef.current;
    if (!inputEl || breachPhase !== "recovery" || typeof window === "undefined")
      return;

    const scrollInputIntoView = () => {
      setTimeout(() => {
        inputBarRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
      }, 100);
    };

    inputEl.addEventListener("focus", scrollInputIntoView);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", scrollInputIntoView);
    }

    return () => {
      inputEl.removeEventListener("focus", scrollInputIntoView);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", scrollInputIntoView);
      }
    };
  }, [breachPhase]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || breachPhase !== "recovery") return;

    const current = STEPS[stepIndex];
    const echoLine: OutputLine = {
      id: nextLineId(),
      type: "echo",
      content: trimmed,
    };

    const normalized = normalizeInput(trimmed);
    const expected = normalizeCommand(current.command);

    if (normalized === expected) {
      const successLine: OutputLine = {
        id: nextLineId(),
        type: "success",
        content: current.success,
      };
      setLines((prev) => [...prev, echoLine, successLine]);
      setInput("");

      if (stepIndex >= STEPS.length - 1) {
        setBreachPhase("decrypted");
      } else {
        setStepIndex((i) => i + 1);
      }
    } else {
      const errorLine: OutputLine = {
        id: nextLineId(),
        type: "error",
        content: `invalid command — expected: ${current.command}`,
      };
      setLines((prev) => [...prev, echoLine, errorLine]);
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  const showProfile =
    snapshot &&
    (breachPhase === "profile" ||
      breachPhase === "encrypted" ||
      breachPhase === "recovery" ||
      breachPhase === "decrypted");

  const showEncrypted =
    breachPhase === "encrypted" ||
    breachPhase === "recovery" ||
    breachPhase === "decrypted";

  if (breachPhase === "booting") {
    return <TerminalBootLoader onComplete={() => onCompleteRef.current()} />;
  }

  return (
    <div className="flex h-[100dvh] flex-col">
      <div
        ref={screenRef}
        className="terminal-scroll mx-auto w-full max-w-[960px] flex-1 overflow-y-auto px-6 pb-5 pt-14 sm:px-10"
        aria-live="polite"
      >
        <div className="mb-10 space-y-2 text-[13px] leading-relaxed">
          {BREACH_STATUS_LINES.slice(0, statusCount).map((line) => (
            <div key={line} className="text-accent-red animate-boot-line">
              {line}
            </div>
          ))}
        </div>

        {showProfile && snapshot && (
          <div className="animate-boot-line">
            <BreachLog snapshot={snapshot} />
          </div>
        )}

        {showEncrypted && (
          <div className="mb-10 animate-boot-line">
            <div className="mb-4 space-y-1 text-[13px] leading-relaxed text-accent-red">
              <p>{ENCRYPTED_NOTICE}</p>
              <p>{DECRYPT_INSTRUCTION}</p>
            </div>

            <div className="mb-4 rounded border border-border px-4 py-3">
              <p className="mb-2 text-[11px] uppercase tracking-wide text-muted">
                cipher: XOR-128 · key: [locked — complete recovery to decrypt]
              </p>
              <div className="space-y-0.5 break-all text-[12px] leading-relaxed text-text-dim">
                {ENCRYPTED_MESSAGE_LINES.map((line, i) => (
                  <div key={i} className="font-mono">{line}</div>
                ))}
              </div>
            </div>

            <p className="text-[12.5px] leading-[1.75] text-muted">
              {CIPHER_HINT}
            </p>
          </div>
        )}

        {breachPhase === "decrypted" && (
          <div className="mb-10 animate-boot-line">
            <p className="mb-3 text-[11px] uppercase tracking-wide text-accent">
              ✓ message decrypted
            </p>
            <p className="text-[13px] leading-[1.85] text-text-dim">
              {BREACH_REASSURANCE}
            </p>
          </div>
        )}

        {(breachPhase === "recovery" || breachPhase === "decrypted") &&
          lines.map((line) => (
            <div key={line.id}>
              {line.type === "echo" && (
                <div className="my-3 text-[13px]">
                  <span className="mr-2 text-accent-red">{RECOVERY_PROMPT}</span>
                  <span className="text-text">{line.content}</span>
                </div>
              )}
              {line.type === "success" && (
                <div className="mb-6 text-[13px] text-text-dim">{line.content}</div>
              )}
              {line.type === "error" && (
                <div className="mb-6 text-[13px] text-accent-red">{line.content}</div>
              )}
            </div>
          ))}
      </div>

      {breachPhase === "recovery" && (
        <div
          ref={inputBarRef}
          className="mx-auto w-full max-w-[960px] shrink-0 border-t border-border px-6 pb-[max(26px,env(safe-area-inset-bottom))] pt-4 sm:px-10"
        >
          <p className="mb-2 text-[11px] tracking-wide text-muted">
            recovery step {stepIndex + 1} of {STEPS.length} — decrypt the message
          </p>
          <div className="promptline flex items-center gap-2.5">
            <span className="shrink-0 text-[13px] text-accent-red">
              {RECOVERY_PROMPT}
            </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              enterKeyHint="go"
              aria-label="Recovery command input"
              className="min-w-0 flex-1 border-none bg-transparent font-mono text-[13px] text-text caret-accent-red outline-none placeholder:text-muted focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-red"
            />
          </div>
        </div>
      )}
    </div>
  );
}
