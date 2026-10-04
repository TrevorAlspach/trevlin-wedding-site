export const MAX_ACCESS_REQUEST_MESSAGE_LENGTH = 500;

export type AccessRequestResponse =
  | { status: "sent"; email: string }
  | { status: "already_allowed" }
  | { status: "rate_limited"; error: string; retryAfterSeconds: number }
  | {
      status: "unauthenticated" | "forbidden" | "unavailable" | "invalid_message" | "invalid_request" | "error";
      error: string;
    };
