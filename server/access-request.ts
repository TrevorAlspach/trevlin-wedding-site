export const MAX_ACCESS_REQUEST_MESSAGE_LENGTH = 500;
export const DEFAULT_ACCESS_REQUEST_RATE_WINDOW_MS = 12 * 60 * 60 * 1_000;

export type AccessRequest = {
  email: string;
  name: string | null;
  provider: string;
  message: string;
  requestedAt: string;
};

export type AccessRequestSender = (request: AccessRequest) => Promise<void>;

export class AccessRequestValidationError extends Error {}

export class AccessRequestDeliveryError extends Error {}

export function parseAccessRequestBody(value: unknown): { message: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AccessRequestValidationError("The request body must be an object");
  }

  const message = (value as Record<string, unknown>).message;
  if (message === undefined || message === "") return { message: "" };
  if (typeof message !== "string" || message.length > MAX_ACCESS_REQUEST_MESSAGE_LENGTH) {
    throw new AccessRequestValidationError("The message is invalid");
  }

  return { message: message.trim() };
}

export function createAccessRequestRateLimiter({
  windowMs = DEFAULT_ACCESS_REQUEST_RATE_WINDOW_MS,
  now = Date.now,
}: {
  windowMs?: number;
  now?: () => number;
} = {}) {
  const requestedAtByEmail = new Map<string, number>();

  return {
    reserve(email: string): { allowed: boolean; retryAfterSeconds: number } {
      const currentTime = now();
      const previousRequestAt = requestedAtByEmail.get(email);
      if (previousRequestAt !== undefined && currentTime - previousRequestAt < windowMs) {
        return {
          allowed: false,
          retryAfterSeconds: Math.max(
            1,
            Math.ceil((previousRequestAt + windowMs - currentTime) / 1_000),
          ),
        };
      }

      requestedAtByEmail.set(email, currentTime);
      return { allowed: true, retryAfterSeconds: 0 };
    },
    release(email: string): void {
      requestedAtByEmail.delete(email);
    },
  };
}

export function createFormspreeAccessRequestSender(
  formId = process.env.ACCESS_REQUEST_FORM_ID,
  fetchImplementation: typeof fetch = fetch,
): AccessRequestSender | undefined {
  const normalizedFormId = formId?.trim();
  if (!normalizedFormId) return undefined;
  if (!/^[a-zA-Z0-9]+$/.test(normalizedFormId)) {
    throw new Error("ACCESS_REQUEST_FORM_ID contains unsupported characters");
  }

  const endpoint = `https://formspree.io/f/${normalizedFormId}`;

  return async (request) => {
    let response: Response;
    try {
      response = await fetchImplementation(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _subject: "Wedding website access request",
          name: request.name || "Not provided by identity provider",
          email: request.email,
          identity_provider: request.provider,
          requested_at: request.requestedAt,
          message: request.message || "No message provided.",
        }),
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      throw new AccessRequestDeliveryError("The access request service could not be reached");
    }

    if (!response.ok) {
      throw new AccessRequestDeliveryError(
        `The access request service returned status ${response.status}`,
      );
    }
  };
}
