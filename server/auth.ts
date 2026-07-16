const EMAIL_CLAIM_TYPES = new Set([
  "email",
  "emails",
  "preferred_username",
  "upn",
  "unique_name",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn",
]);

export const PROVIDERS = {
  google: { label: "Continue with Google", route: "google" },
  aad: { label: "Continue with Microsoft", route: "aad" },
} as const;

export type ProviderName = keyof typeof PROVIDERS;

type PrincipalClaim = {
  typ?: unknown;
  val?: unknown;
};

export type ClientPrincipal = {
  auth_typ: string;
  claims: PrincipalClaim[];
};

function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function parseAllowedEmails(value = ""): Set<string> {
  const emails = new Set<string>();
  const invalid: string[] = [];

  for (const item of String(value).split(/[\s,;]+/)) {
    const email = normalizeEmail(item);
    if (!email) continue;
    if (!looksLikeEmail(email)) {
      invalid.push(item);
      continue;
    }
    emails.add(email);
  }

  if (invalid.length > 0) {
    throw new Error(
      `ALLOWED_EMAILS contains ${invalid.length} invalid entr${invalid.length === 1 ? "y" : "ies"}`,
    );
  }

  return emails;
}

export function parseProviders(value = "google,aad"): ProviderName[] {
  const selected: ProviderName[] = [];

  for (const item of String(value).split(/[\s,;]+/)) {
    const provider = item.trim().toLowerCase();
    if (!provider) continue;
    if (!(provider in PROVIDERS)) {
      throw new Error(`AUTH_PROVIDERS contains unsupported provider: ${item}`);
    }
    const providerName = provider as ProviderName;
    if (!selected.includes(providerName)) selected.push(providerName);
  }

  if (selected.length === 0) {
    throw new Error("AUTH_PROVIDERS must contain at least one provider");
  }

  return selected;
}

export function decodePrincipal(headerValue: unknown): ClientPrincipal | null {
  if (typeof headerValue !== "string" || headerValue.length === 0 || headerValue.length > 64_000) {
    return null;
  }

  try {
    const decoded = Buffer.from(headerValue, "base64").toString("utf8");
    const principal: unknown = JSON.parse(decoded);
    if (
      !principal ||
      typeof principal !== "object" ||
      typeof (principal as ClientPrincipal).auth_typ !== "string" ||
      !Array.isArray((principal as ClientPrincipal).claims)
    ) {
      return null;
    }
    return principal as ClientPrincipal;
  } catch {
    return null;
  }
}

export function getPrincipalEmail(principal: ClientPrincipal | null): string | null {
  if (!principal || !Array.isArray(principal.claims)) return null;

  for (const claim of principal.claims) {
    if (!claim || typeof claim.typ !== "string" || typeof claim.val !== "string") continue;
    if (!EMAIL_CLAIM_TYPES.has(claim.typ.toLowerCase())) continue;

    const email = normalizeEmail(claim.val);
    if (looksLikeEmail(email)) return email;
  }

  return null;
}
