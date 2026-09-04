export const CONSENT_KEY = "beleg-consent";
export const CONSENT_COOKIE = "beleg_consent";
export const CONSENT_EVENT = "beleg-consent";

export type ConsentChoice = "essential" | "all";

const YEAR = 60 * 60 * 24 * 365;

let memory: ConsentChoice | null = null;

function isChoice(value: string | null | undefined): value is ConsentChoice {
  return value === "essential" || value === "all";
}

function readCookie(): ConsentChoice | null {
  const match = document.cookie.match(
    /(?:^|; )beleg_consent=(all|essential)(?:;|$)/,
  );
  return match ? (match[1] as ConsentChoice) : null;
}

function readStore(store: Storage): ConsentChoice | null {
  try {
    const raw = store.getItem(CONSENT_KEY);
    return isChoice(raw) ? raw : null;
  } catch {
    return null;
  }
}

function writeStore(store: Storage, choice: ConsentChoice): void {
  try {
    store.setItem(CONSENT_KEY, choice);
  } catch {
    /* private mode */
  }
}

function applyConsent(choice: ConsentChoice): void {
  memory = choice;
  document.documentElement.dataset.consent = choice;
}

function readDom(): ConsentChoice | null {
  if (typeof document === "undefined") return null;
  const value = document.documentElement.dataset.consent;
  return isChoice(value) ? value : null;
}

export function getConsent(): ConsentChoice | null {
  if (memory) return memory;
  if (typeof window === "undefined") return null;

  const found =
    readCookie() ??
    readStore(window.sessionStorage) ??
    readStore(window.localStorage) ??
    readDom();

  if (found) applyConsent(found);
  return found;
}

export function setConsent(choice: ConsentChoice): void {
  applyConsent(choice);
  writeStore(window.sessionStorage, choice);
  writeStore(window.localStorage, choice);

  const expires = new Date(Date.now() + YEAR * 1000).toUTCString();
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${choice}; Path=/; Max-Age=${YEAR}; Expires=${expires}; SameSite=Lax${secure}`;

  window.dispatchEvent(new Event(CONSENT_EVENT));
}

export const CONSENT_BOOT_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )beleg_consent=(all|essential)/);var v=m?m[1]:null;if(!v){try{v=sessionStorage.getItem("beleg-consent")||localStorage.getItem("beleg-consent")}catch(e){}}if(v==="all"||v==="essential"){document.documentElement.setAttribute("data-consent",v);if(!m){var d=new Date(Date.now()+31536000000).toUTCString();document.cookie="beleg_consent="+v+"; Path=/; Max-Age=31536000; Expires="+d+"; SameSite=Lax"+(location.protocol==="https:"?"; Secure":"")}}}catch(e){}})();`;
