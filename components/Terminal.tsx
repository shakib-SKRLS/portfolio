"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import TerminalHeader from "@/components/TerminalHeader";
import {
  EMAIL_ADDRESS,
  PROMPT,
  executeCommand,
  type TerminalLine,
  type VirtualFs,
} from "@/lib/virtualFs";

interface TerminalProps {
  fs: VirtualFs;
}

let lineCounter = 0;
function nextId() {
  return `line-${++lineCounter}`;
}

export default function Terminal({ fs }: TerminalProps) {
  const [showHeader, setShowHeader] = useState(true);
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const screenRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputBarRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    const el = screenRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, showHeader, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const focusInput = () => inputRef.current?.focus();
    document.addEventListener("click", focusInput);
    return () => document.removeEventListener("click", focusInput);
  }, []);

  useEffect(() => {
    const inputEl = inputRef.current;
    if (!inputEl || typeof window === "undefined") return;

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
  }, []);

  const runCommand = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      const echoLine: TerminalLine = {
        id: nextId(),
        type: "echo",
        content: trimmed,
      };

      const result = executeCommand(trimmed, fs);

      if (result.sideEffect === "clear") {
        setLines([]);
        setShowHeader(false);
        setHistory((h) => [...h, trimmed]);
        setHistoryIndex(-1);
        return;
      }

      const newLines: TerminalLine[] = [echoLine];

      if (result.output) {
        newLines.push({
          id: nextId(),
          type: result.isError ? "error" : "output",
          content: result.output,
          html: result.html,
        });
      }

      setLines((prev) => [...prev, ...newLines]);
      setHistory((h) => [...h, trimmed]);
      setHistoryIndex(-1);

      if (result.sideEffect === "mailto") {
        setTimeout(() => {
          window.location.href = `mailto:${EMAIL_ADDRESS}`;
        }, 900);
      }

      if (result.sideEffect === "open" && result.openUrl) {
        window.open(result.openUrl, "_blank", "noopener,noreferrer");
      }

      if (result.sideEffect === "clipboard" && result.clipboardText) {
        navigator.clipboard?.writeText(result.clipboardText).catch(() => {});
      }

      if (result.sideEffect === "download" && result.openUrl) {
        const anchor = document.createElement("a");
        anchor.href = result.openUrl;
        anchor.download = result.downloadName ?? "resume.docx";
        anchor.rel = "noopener";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
      }
    },
    [fs]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      runCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      setHistoryIndex((idx) => {
        const next = idx === -1 ? history.length - 1 : Math.max(0, idx - 1);
        setInput(history[next] ?? "");
        return next;
      });
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (history.length === 0) return;
      setHistoryIndex((idx) => {
        const next = idx === -1 ? -1 : idx + 1;
        if (next >= history.length) {
          setInput("");
          return -1;
        }
        setInput(history[next] ?? "");
        return next;
      });
    }
  };

  return (
    <div className="flex h-[100dvh] flex-col">
      <div
        ref={screenRef}
        className="terminal-scroll mx-auto w-full max-w-[960px] flex-1 overflow-y-auto px-6 pb-5 pt-14 sm:px-10"
      >
        {showHeader && <TerminalHeader />}
        {lines.map((line) => (
          <LineRenderer key={line.id} line={line} />
        ))}
      </div>

      <div
        ref={inputBarRef}
        className="mx-auto w-full max-w-[960px] shrink-0 border-t border-border px-6 pb-[max(26px,env(safe-area-inset-bottom))] pt-4 sm:px-10"
      >
        <div className="promptline flex items-center gap-2.5">
          <span className="shrink-0 text-[13px] text-accent">{PROMPT}</span>
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
            placeholder="type a command (try: help)"
            aria-label="Terminal command input"
            className="min-w-0 flex-1 border-none bg-transparent font-mono text-[13px] text-text caret-accent outline-none placeholder:text-muted focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

function LineRenderer({ line }: { line: TerminalLine }) {
  if (line.type === "echo") {
    return (
      <div className="echo my-[34px] mb-3 text-[13px]">
        <span className="mr-2 text-accent">$</span>
        <span className="text-text">{line.content}</span>
      </div>
    );
  }

  if (line.type === "error") {
    if (line.html) {
      return (
        <div
          className="err mb-10 text-[13px] text-[#e2685f]"
          dangerouslySetInnerHTML={{ __html: line.content }}
        />
      );
    }
    return (
      <div className="err mb-10 text-[13px] text-[#e2685f]">{line.content}</div>
    );
  }

  if (line.html) {
    return (
      <div
        className="resp terminal-out mb-10 whitespace-pre-wrap text-[13px] leading-[1.85] text-text-dim"
        dangerouslySetInnerHTML={{ __html: line.content }}
      />
    );
  }

  return (
    <div className="resp terminal-out mb-10 whitespace-pre-wrap text-[13px] leading-[1.85] text-text-dim">
      {line.content}
    </div>
  );
}
