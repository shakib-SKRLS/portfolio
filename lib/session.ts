export const RECOVERY_SESSION_KEY = "shakib-portfolio-recovered";

export function isSessionRecovered(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(RECOVERY_SESSION_KEY) === "1";
}

export function markSessionRecovered(): void {
  sessionStorage.setItem(RECOVERY_SESSION_KEY, "1");
}
