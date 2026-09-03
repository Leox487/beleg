import "server-only";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Cloudflare is in the request path of a public write, so a hung call must not
// pin the function for the platform timeout.
const TIMEOUT_MS = 8000;

export type TurnstileResult = {
  success: boolean;
  /** Cloudflare's `error-codes`, or a synthetic code when we never got there. */
  errorCodes: string[];
};

/**
 * Whether Turnstile enforcement is switched on for this deployment. Callers
 * gate on this so a deployment without keys keeps working; `verifyTurnstileToken`
 * itself always fails closed.
 */
export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Fail closed: an unset secret means we cannot tell a human from a bot,
    // so we must not vouch for the token.
    console.error("TURNSTILE_SECRET_KEY is not configured; rejecting token");
    return { success: false, errorCodes: ["missing-input-secret"] };
  }
  if (!token) {
    return { success: false, errorCodes: ["missing-input-response"] };
  }

  const form = new URLSearchParams({ secret, response: token });
  if (remoteIp && remoteIp !== "unknown") {
    form.set("remoteip", remoteIp);
  }

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      console.error(`Turnstile siteverify returned ${res.status}`);
      return { success: false, errorCodes: ["internal-error"] };
    }

    const data = (await res.json()) as {
      success?: unknown;
      "error-codes"?: unknown;
    };
    const rawCodes = data["error-codes"];
    const errorCodes = Array.isArray(rawCodes)
      ? rawCodes.filter((c): c is string => typeof c === "string")
      : [];

    return { success: data.success === true, errorCodes };
  } catch (error) {
    console.error("Turnstile verification failed:", error);
    return { success: false, errorCodes: ["internal-error"] };
  }
}
