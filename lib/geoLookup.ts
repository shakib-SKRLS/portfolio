export interface GeoInfo {
  ip: string;
  city: string;
  region: string;
  country: string;
  isp: string;
}

const UNAVAILABLE = "unavailable";
const TIMEOUT_MS = 4000;

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function emptyGeo(): GeoInfo {
  return {
    ip: UNAVAILABLE,
    city: UNAVAILABLE,
    region: UNAVAILABLE,
    country: UNAVAILABLE,
    isp: UNAVAILABLE,
  };
}

async function tryIpApiCo(): Promise<GeoInfo> {
  const res = await fetchWithTimeout("https://ipapi.co/json/");
  if (!res.ok) throw new Error("ipapi.co failed");
  const data = await res.json();
  if (data.error) throw new Error(data.reason ?? "ipapi.co error");
  return {
    ip: data.ip ?? UNAVAILABLE,
    city: data.city ?? UNAVAILABLE,
    region: data.region ?? UNAVAILABLE,
    country: data.country_name ?? UNAVAILABLE,
    isp: data.org ?? UNAVAILABLE,
  };
}

async function tryIpWhoIs(): Promise<GeoInfo> {
  const res = await fetchWithTimeout("https://ipwho.is/");
  if (!res.ok) throw new Error("ipwho.is failed");
  const data = await res.json();
  if (!data.success) throw new Error(data.message ?? "ipwho.is error");
  return {
    ip: data.ip ?? UNAVAILABLE,
    city: data.city ?? UNAVAILABLE,
    region: data.region ?? UNAVAILABLE,
    country: data.country ?? UNAVAILABLE,
    isp: data.connection?.isp ?? UNAVAILABLE,
  };
}

async function tryGeoJs(): Promise<GeoInfo> {
  const res = await fetchWithTimeout("https://get.geojs.io/v1/ip/geo.json");
  if (!res.ok) throw new Error("geojs failed");
  const data = await res.json();
  return {
    ip: data.ip ?? UNAVAILABLE,
    city: data.city ?? UNAVAILABLE,
    region: data.region ?? UNAVAILABLE,
    country: data.country ?? UNAVAILABLE,
    isp: data.organization_name ?? UNAVAILABLE,
  };
}

let cachedGeoPromise: Promise<GeoInfo> | null = null;

/**
 * Cached geo lookup — survives React Strict Mode remounts without refetch flicker.
 */
export function lookupGeoCached(): Promise<GeoInfo> {
  if (!cachedGeoPromise) {
    cachedGeoPromise = lookupGeo();
  }
  return cachedGeoPromise;
}

/**
 * Fetches public IP + geolocation via three free providers in sequence.
 * Each provider has a ~4s timeout; falls through on failure/rate-limit.
 * Never fabricates data — returns "unavailable" when all providers fail.
 */
export async function lookupGeo(): Promise<GeoInfo> {
  const providers = [tryIpApiCo, tryIpWhoIs, tryGeoJs];
  for (const provider of providers) {
    try {
      return await provider();
    } catch {
      continue;
    }
  }
  return emptyGeo();
}

export function formatLocation(geo: GeoInfo): string {
  const parts = [geo.city, geo.region, geo.country].filter(
    (p) => p && p !== UNAVAILABLE
  );
  return parts.length > 0 ? parts.join(", ") : UNAVAILABLE;
}
