import type { BreachSnapshot } from "@/lib/breachContent";
import { formatLocation } from "@/lib/geoLookup";

export function BreachLog({ snapshot }: { snapshot: BreachSnapshot }) {
  const { geo, client } = snapshot;

  return (
    <div className="mb-10">
      <div className="mb-6 text-[13px] font-medium tracking-wide text-accent-red animate-blink-warning">
        ⚠ SYSTEM PROFILED ⚠
      </div>

      <div className="breach-log text-[13px] leading-loose">
        <BreachRow label="IP" value={geo.ip} />
        <BreachRow label="Location" value={formatLocation(geo)} />
        <BreachRow label="ISP" value={geo.isp} />
        <BreachRow label="OS" value={client.os} />
        <BreachRow label="Browser" value={client.browser} />
        <BreachRow label="Screen" value={client.screen} />
        <BreachRow label="Timezone" value={client.timezone} />
        <BreachRow label="Local time" value={client.localTime} />
      </div>
    </div>
  );
}

function BreachRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3.5">
      <span className="w-[88px] shrink-0 text-[11.5px] uppercase tracking-wide text-muted">
        {label}
      </span>
      <span className="text-accent-red">{value}</span>
    </div>
  );
}
