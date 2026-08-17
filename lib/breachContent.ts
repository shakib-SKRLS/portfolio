import type { ClientInfo } from "@/lib/clientInfo";
import type { GeoInfo } from "@/lib/geoLookup";

export const BREACH_STATUS_LINES = [
  "> incoming connection intercepted",
  "> unauthorized session detected on this device",
  "> tracing origin ...",
];

export interface BreachSnapshot {
  geo: GeoInfo;
  client: ClientInfo;
}
