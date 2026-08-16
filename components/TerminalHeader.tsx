const GITHUB_USER = "shakib-SKRLS";
const EMAIL = "skrlskhan123@gmail.com";

export default function TerminalHeader() {
  return (
    <>
      <div className="sysinfo mb-11 text-[13px] leading-loose">
        <div className="row flex gap-3.5">
          <span className="k w-[78px] shrink-0 text-muted">SYS.NAME</span>
          <span className="v text-text-dim">SKRLS_TERM v1.0.0</span>
        </div>
        <div className="row flex gap-3.5">
          <span className="k w-[78px] shrink-0 text-muted">SYS.AUTH</span>
          <span className="v text-accent">GUEST_ACCESS_GRANTED</span>
        </div>
        <div className="row flex gap-3.5">
          <span className="k w-[78px] shrink-0 text-muted">SYS.NODE</span>
          <span className="v text-text-dim">github.com/{GITHUB_USER}</span>
        </div>
      </div>

      <div className="logo mb-11">
        <div className="l1 text-[38px] font-bold leading-none tracking-[2px] text-text">
          SHAKIB
        </div>
        <div className="l2 mt-2 pl-[3px] text-[15px] font-light tracking-[16px] text-muted">
          KHAN
        </div>
        <div className="rule mt-[22px] h-px w-full bg-border" />
      </div>

      <div className="cmdline mb-4 text-[13px] text-text-dim">
        <span className="p mr-2 text-accent">$</span>whoami
      </div>
      <div className="out mb-10 text-[13px] leading-[1.85] text-text-dim">
        Backend developer who thinks in systems and tries to break them on
        purpose. <span className="hl text-text">CEH v13 certified</span> —
        security isn&apos;t a checklist I bolt on at the end, it&apos;s part of
        how I design things from the first schema.
        <br />
        <br />
        4+ years across JavaScript, Python, Rust, and Go — building APIs, auth
        services, and security tooling. Currently bootstrapping{" "}
        <span className="hl text-text">my own startup</span>.
      </div>

      <div className="cmdline mb-4 text-[13px] text-text-dim">
        <span className="p mr-2 text-accent">$</span>cat status.txt
      </div>
      <div className="kv mb-7 text-[13px] leading-loose">
        <div className="row flex gap-3.5">
          <span className="k w-[88px] shrink-0 pt-0.5 text-[11.5px] uppercase tracking-wide text-muted">
            Focus
          </span>
          <span className="v text-text-dim">
            Backend systems — API design — Security
          </span>
        </div>
        <div className="row flex gap-3.5">
          <span className="k w-[88px] shrink-0 pt-0.5 text-[11.5px] uppercase tracking-wide text-muted">
            Stack
          </span>
          <span className="v text-text-dim">
            Node · Express · Django · Docker · PostgreSQL
          </span>
        </div>
        <div className="row flex gap-3.5">
          <span className="k w-[88px] shrink-0 pt-0.5 text-[11.5px] uppercase tracking-wide text-muted">
            Contact
          </span>
          <span className="v text-text-dim">
            <a href={`mailto:${EMAIL}`} className="terminal-link">
              {EMAIL}
            </a>
          </span>
        </div>
      </div>

      <div className="pill mb-11 inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-[11.5px] tracking-wide text-text-dim">
        <span className="dot h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent shadow-[0_0_6px_var(--accent)]" />
        AVAILABLE — OPEN TO FREELANCE / CONTRACTS
      </div>
    </>
  );
}
