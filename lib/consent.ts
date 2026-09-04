export const CONSENT_KEY = "beleg-consent";
export const CONSENT_COOKIE = "beleg_consent";
export const CONSENT_EVENT = "beleg-consent";

export type ConsentChoice = "essential" | "all";

const YEAR = 60 * 60 * 24 * 365;

function readCookie(): ConsentChoice | null {
  const match = document.cookie.match(
    /(?:^|; )beleg_consent=(all|essential)(?:;|$)/,
  );
  return match ? (match[1] as ConsentChoice) : null;
}

export function getConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  const fromCookie = readCookie();
  if (fromCookie) return fromCookie;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (raw === "essential" || raw === "all") return raw;
  } catch {
    /* private mode can block storage */
  }
  return null;
}

export function setConsent(choice: ConsentChoice): void {
  document.cookie = `${CONSENT_COOKIE}=${choice}; Path=/; Max-Age=${YEAR}; SameSite=Lax`;
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    /* cookie is enough */
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}
