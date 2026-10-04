import { useEffect, useState, type FormEvent } from "react";
import { PROVIDERS, type SessionResponse } from "../../shared/auth";
import {
  MAX_ACCESS_REQUEST_MESSAGE_LENGTH,
  type AccessRequestResponse,
} from "../../shared/access-request";

const LOGOUT_URL = "/.auth/logout?post_logout_redirect_uri=%2Flogin";

type RequestResult = "sent" | "limited" | "unavailable" | null;

export default function AuthApp() {
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<RequestResult>(null);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const login = window.location.pathname.replace(/\/$/, "") === "/login";

  useEffect(() => {
    const controller = new AbortController();
    async function loadSession() {
      try {
        const response = await fetch("/api/session", { signal: controller.signal });
        if (!response.ok) throw new Error("Could not load session");
        const data: SessionResponse = await response.json();
        if (controller.signal.aborted) return;
        if (!login && data.status === "anonymous") {
          window.location.replace("/login");
        } else if (!login && data.status === "allowed") {
          window.location.replace("/");
        } else {
          setSession(data);
        }
      } catch {
        if (!controller.signal.aborted) setLoadError(true);
      }
    }
    void loadSession();
    return () => controller.abort();
  }, [login]);

  const title = loadError
    ? "Sign in unavailable"
    : result === "sent"
      ? "Access requested"
      : result === "limited"
        ? "Request already sent"
        : result === "unavailable"
          ? "Request unavailable"
          : login ? "Guest sign in" : "Access denied";

  useEffect(() => {
    document.title = title;
  }, [title]);

  async function requestAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const body: AccessRequestResponse = await response.json();
      if (response.status === 401) {
        window.location.assign("/login");
      } else if (response.ok && body.status === "already_allowed") {
        window.location.assign("/");
      } else if (response.ok && body.status === "sent") {
        setSubmittedEmail(body.email);
        setResult("sent");
      } else if (response.status === 429) {
        setResult("limited");
      } else if (response.status === 400) {
        setError("error" in body ? body.error : "Please check your message and try again.");
      } else if (response.status === 403) {
        setSession((current) => current && { ...current, accessRequestsEnabled: false });
      } else {
        setResult("unavailable");
      }
    } catch {
      setResult("unavailable");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <main>
        <h1>Sign in unavailable</h1>
        <p>We could not load your sign-in information. Please try again.</p>
        <div className="actions"><a href={window.location.pathname}>Try again</a></div>
      </main>
    );
  }

  if (!session) return <main><p role="status">Loading…</p></main>;

  if (login) {
    return (
      <main>
        <h1>Welcome</h1>
        <p>Please sign in with the same email address that received your invitation.</p>
        <div className="actions">
          {session.providers.map((provider) => (
            <a key={provider} href={`/.auth/login/${PROVIDERS[provider].route}?post_login_redirect_uri=%2F`}>
              {PROVIDERS[provider].label}
            </a>
          ))}
        </div>
        <p className="quiet">Access is limited to invited guests.</p>
      </main>
    );
  }

  if (result === "sent") {
    return (
      <main>
        <h1>Request sent</h1>
        <p>We sent an access request for <strong>{submittedEmail}</strong>. You will be able to sign in after the couple approves it.</p>
        <div className="actions"><a href={LOGOUT_URL}>Return to sign in</a></div>
      </main>
    );
  }

  if (result === "limited") {
    return (
      <main>
        <h1>Request already sent</h1>
        <p>We already received a recent request from this account. Please give the couple some time to approve it.</p>
      </main>
    );
  }

  if (result === "unavailable") {
    return (
      <main>
        <h1>Request not sent</h1>
        <p>We could not send your request right now. Please try again later or contact the couple directly.</p>
        <div className="actions"><a href="/">Try again</a></div>
      </main>
    );
  }

  return (
    <main>
      <h1>Access denied</h1>
      <p>Thank you for visiting our website, we’re excited to share our day with you!
        To protect our private event information our website is only accessible with an email signin.
        Please request access for your email and we’ll make sure to get you on the list!</p>
      {session.email && session.accessRequestsEnabled ? (
        <>
          <p>Signed in as <strong>{session.email}</strong>.</p>
          {error && <p className="error" role="alert">{error}</p>}
          <form onSubmit={requestAccess}>
            <label htmlFor="message">Message <span className="quiet">(optional)</span></label>
            <textarea
              id="message"
              name="message"
              maxLength={MAX_ACCESS_REQUEST_MESSAGE_LENGTH}
              placeholder="Tell us how you know the couple."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <button type="submit" disabled={submitting}>{submitting ? "Sending…" : "Request access"}</button>
          </form>
        </>
      ) : (
        <p className="quiet">Access requests are not available right now. Please contact the couple directly.</p>
      )}
      <div className="actions"><a href={LOGOUT_URL}>Try another account</a></div>
    </main>
  );
}
