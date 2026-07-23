import express, { type ErrorRequestHandler, type RequestHandler } from "express";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PROVIDERS,
  decodePrincipal,
  getPrincipalEmail,
  parseAllowedEmails,
  parseProviders,
  type ProviderName,
} from "./auth.js";
import {
  createChatHandler,
  createGuestRateLimiter,
  type StreamingChatModel,
} from "./chat.js";
import {
  AccessRequestValidationError,
  createAccessRequestRateLimiter,
  createFormspreeAccessRequestSender,
  MAX_ACCESS_REQUEST_MESSAGE_LENGTH,
  parseAccessRequestBody,
  type AccessRequestSender,
} from "./access-request.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DIST_DIR = path.resolve(__dirname, "../../dist");

function securityMiddleware(): RequestHandler {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https:"],
        formAction: ["'self'", "https://formspree.io"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: null,
      },
    },
    crossOriginEmbedderPolicy: false,
    frameguard: { action: "deny" },
    hsts: { maxAge: 31_536_000, includeSubDomains: true },
    // Azure Easy Auth validates cookie-authenticated POST requests against the
    // same-origin Referer header. Keep cross-origin referrers private while
    // allowing that CSRF check to succeed.
    referrerPolicy: { policy: "same-origin" },
  });
}

function page(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
    <title>${title}</title>
    <style>
      :root { font-family: Montserrat, system-ui, sans-serif; color: #f5efe0; background: #5c6e3a; }
      * { box-sizing: border-box; }
      body { min-height: 100vh; margin: 0; display: grid; place-items: center; padding: 1.5rem; }
      main { width: min(30rem, 100%); padding: 2.25rem; border: 1px solid rgba(245,239,224,.4); border-radius: 1rem; background: rgba(24,35,17,.28); box-shadow: 0 1.25rem 3rem rgba(0,0,0,.18); }
      h1 { margin: 0 0 .75rem; font-family: Georgia, serif; font-size: clamp(2rem, 8vw, 3rem); font-weight: 500; }
      p { line-height: 1.6; }
      .actions { display: grid; gap: .75rem; margin-top: 1.5rem; }
      a, button { display: block; width: 100%; padding: .9rem 1rem; border: 0; border-radius: .65rem; color: #314021; background: #f5efe0; text-align: center; text-decoration: none; font: inherit; font-weight: 700; cursor: pointer; }
      a:hover, button:hover { background: #fffaf0; }
      form { display: grid; gap: .75rem; margin-top: 1.5rem; }
      label { font-weight: 700; }
      textarea { width: 100%; min-height: 7rem; resize: vertical; padding: .8rem; border: 1px solid rgba(245,239,224,.55); border-radius: .65rem; color: #f5efe0; background: rgba(24,35,17,.38); font: inherit; }
      textarea::placeholder { color: rgba(245,239,224,.68); }
      .error { padding: .75rem; border-radius: .5rem; color: #3f160f; background: #ffd7cc; }
      .quiet { font-size: .9rem; opacity: .82; }
    </style>
  </head>
  <body><main>${body}</main></body>
</html>`;
}

function loginPage(providers: ProviderName[]): string {
  const links = providers
    .map((provider) => {
      const config = PROVIDERS[provider];
      return `<a href="/.auth/login/${config.route}?post_login_redirect_uri=%2F">${config.label}</a>`;
    })
    .join("\n");

  return page(
    "Guest sign in",
    `<h1>Welcome</h1>
     <p>Please sign in with the same email address that received your invitation.</p>
     <div class="actions">${links}</div>
     <p class="quiet">Access is limited to invited guests.</p>`,
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function deniedPage({
  email,
  accessRequestsEnabled,
  error,
}: {
  email?: string | null;
  accessRequestsEnabled: boolean;
  error?: string;
}): string {
  const requestForm =
    email && accessRequestsEnabled
      ? `<p>Signed in as <strong>${escapeHtml(email)}</strong>.</p>
         ${error ? `<p class="error">${escapeHtml(error)}</p>` : ""}
         <form method="post" action="/request-access">
           <label for="message">Message <span class="quiet">(optional)</span></label>
           <textarea id="message" name="message" maxlength="${MAX_ACCESS_REQUEST_MESSAGE_LENGTH}" placeholder="Tell us how you know the couple."></textarea>
           <button type="submit">Request access</button>
         </form>`
      : `<p class="quiet">Access requests are not available right now. Please contact the couple directly.</p>`;

  return page(
    "Access denied",
    `<h1>Access denied</h1>
     <p>This account is not on the guest list. You can request access or try another account.</p>
     ${requestForm}
     <div class="actions"><a href="/.auth/logout?post_logout_redirect_uri=%2Flogin">Try another account</a></div>`,
  );
}

function accessRequestSubmittedPage(email: string): string {
  return page(
    "Access requested",
    `<h1>Request sent</h1>
     <p>We sent an access request for <strong>${escapeHtml(email)}</strong>. You will be able to sign in after the couple approves it.</p>
     <div class="actions"><a href="/.auth/logout?post_logout_redirect_uri=%2Flogin">Return to sign in</a></div>`,
  );
}

function accessRequestUnavailablePage(): string {
  return page(
    "Request unavailable",
    `<h1>Request not sent</h1>
     <p>We could not send your request right now. Please try again later or contact the couple directly.</p>
     <div class="actions"><a href="/">Try again</a></div>`,
  );
}

function accessRequestLimitedPage(): string {
  return page(
    "Request already sent",
    `<h1>Request already sent</h1>
     <p>We already received a recent request from this account. Please give the couple some time to approve it.</p>`,
  );
}

function isApiRequest(pathname: string): boolean {
  return pathname === "/api" || pathname.startsWith("/api/");
}

const apiBodyErrorHandler: ErrorRequestHandler = (error, request, response, next) => {
  if (!isApiRequest(request.path)) {
    next(error);
    return;
  }

  const status = typeof error?.status === "number" ? error.status : 500;
  if (status === 400 || status === 413) {
    response.status(400).json({ error: "Invalid chat request." });
    return;
  }

  console.error("API request failed", error);
  response.status(500).json({ error: "The request could not be completed." });
};

const accessRequestBodyErrorHandler: ErrorRequestHandler = (
  error,
  request,
  response,
  next,
) => {
  if (request.path !== "/request-access") {
    next(error);
    return;
  }

  const status = typeof error?.status === "number" ? error.status : 500;
  response.setHeader("Cache-Control", "no-store");
  if (status === 400 || status === 413) {
    response.status(400).type("html").send(accessRequestUnavailablePage());
    return;
  }

  console.error("Access request failed", error);
  response.status(500).type("html").send(accessRequestUnavailablePage());
};

export type CreateAppOptions = {
  allowedEmails?: Set<string>;
  providers?: ProviderName[];
  distDir?: string;
  chatModel?: StreamingChatModel;
  chatRateLimit?: {
    maxRequests?: number;
    windowMs?: number;
    now?: () => number;
  };
  accessRequestSender?: AccessRequestSender | null;
  accessRequestRateLimit?: {
    windowMs?: number;
    now?: () => number;
  };
};

export function createApp({
  allowedEmails = parseAllowedEmails(process.env.ALLOWED_EMAILS),
  providers = parseProviders(process.env.AUTH_PROVIDERS),
  distDir = DEFAULT_DIST_DIR,
  chatModel,
  chatRateLimit,
  accessRequestSender,
  accessRequestRateLimit,
}: CreateAppOptions = {}) {
  const app = express();
  const indexPath = path.join(distDir, "index.html");
  const checkChatRateLimit = createGuestRateLimiter(chatRateLimit);
  const sendAccessRequest =
    accessRequestSender === undefined
      ? createFormspreeAccessRequestSender()
      : accessRequestSender ?? undefined;
  const accessRequestRateLimiter = createAccessRequestRateLimiter(accessRequestRateLimit);

  app.disable("x-powered-by");
  app.use(securityMiddleware());
  app.use((_request, response, next) => {
    response.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
    next();
  });

  app.get("/healthz", (_request, response) => {
    response.setHeader("Cache-Control", "no-store");
    response.status(200).type("text/plain").send("ok");
  });

  app.get("/login", (_request, response) => {
    response.setHeader("Cache-Control", "no-store");
    response.status(200).type("html").send(loginPage(providers));
  });

  app.post(
    "/request-access",
    express.urlencoded({ extended: false, limit: "4kb" }),
    async (request, response) => {
      response.setHeader("Cache-Control", "no-store");
      const principal = decodePrincipal(request.get("x-ms-client-principal"));
      if (!principal) {
        response.redirect(303, "/login");
        return;
      }

      const email = getPrincipalEmail(principal);
      if (!email) {
        response
          .status(403)
          .type("html")
          .send(deniedPage({ accessRequestsEnabled: false }));
        return;
      }

      if (allowedEmails.has(email)) {
        response.redirect(303, "/");
        return;
      }

      if (!sendAccessRequest) {
        response.status(503).type("html").send(accessRequestUnavailablePage());
        return;
      }

      let message: string;
      try {
        ({ message } = parseAccessRequestBody(request.body));
      } catch (error) {
        if (!(error instanceof AccessRequestValidationError)) throw error;
        response
          .status(400)
          .type("html")
          .send(
            deniedPage({
              email,
              accessRequestsEnabled: true,
              error: "Please shorten your message and try again.",
            }),
          );
        return;
      }

      const rateLimit = accessRequestRateLimiter.reserve(email);
      if (!rateLimit.allowed) {
        response.setHeader("Retry-After", String(rateLimit.retryAfterSeconds));
        response.status(429).type("html").send(accessRequestLimitedPage());
        return;
      }

      try {
        await sendAccessRequest({
          email,
          provider: principal.auth_typ,
          message,
          requestedAt: new Date().toISOString(),
        });
      } catch (error) {
        accessRequestRateLimiter.release(email);
        console.error("Access request delivery failed", error);
        response.status(502).type("html").send(accessRequestUnavailablePage());
        return;
      }

      response.status(200).type("html").send(accessRequestSubmittedPage(email));
    },
  );

  app.use(accessRequestBodyErrorHandler);

  app.use((request, response, next) => {
    const apiRequest = isApiRequest(request.path);
    const rawPrincipal = request.get("x-ms-client-principal");
    if (!rawPrincipal) {
      if (apiRequest) {
        response.setHeader("Cache-Control", "no-store");
        return response.status(401).json({ error: "Your session has expired. Please sign in again." });
      }
      return response.redirect(302, "/login");
    }

    const principal = decodePrincipal(rawPrincipal);
    if (!principal) {
      response.setHeader("Cache-Control", "no-store");
      if (apiRequest) {
        return response.status(401).json({ error: "Your session has expired. Please sign in again." });
      }
      return response
        .status(401)
        .type("html")
        .send(deniedPage({ accessRequestsEnabled: false }));
    }

    const email = getPrincipalEmail(principal);
    if (!email || !allowedEmails.has(email)) {
      if (!email) {
        const claimTypes = principal.claims
          .map((claim) => (typeof claim?.typ === "string" ? claim.typ : null))
          .filter(Boolean);
        console.warn("Authenticated principal did not include a supported email claim", {
          provider: principal.auth_typ,
          claimTypes,
        });
      }
      response.setHeader("Cache-Control", "no-store");
      if (apiRequest) {
        return response.status(403).json({ error: "This account does not have access." });
      }
      return response
        .status(403)
        .type("html")
        .send(deniedPage({ email, accessRequestsEnabled: Boolean(sendAccessRequest) }));
    }

    response.locals.authenticatedEmail = email;
    response.setHeader("Cache-Control", "private, no-store");
    return next();
  });

  app.post(
    "/api/chat",
    express.json({ limit: "32kb", strict: true }),
    (_request, response, next) => {
      const email = response.locals.authenticatedEmail as string;
      const rateLimit = checkChatRateLimit(email);
      if (!rateLimit.allowed) {
        response.setHeader("Retry-After", String(rateLimit.retryAfterSeconds));
        response.status(429).json({ error: "Too many chat requests. Please try again shortly." });
        return;
      }
      next();
    },
    createChatHandler({ model: chatModel }),
  );

  app.use(apiBodyErrorHandler);

  app.use(
    express.static(distDir, {
      fallthrough: true,
      index: false,
      setHeaders(response) {
        response.setHeader("Cache-Control", "private, no-store");
      },
    }),
  );

  app.get("/{*path}", (_request, response) => {
    response.setHeader("Cache-Control", "private, no-store");
    response.sendFile(indexPath);
  });

  return app;
}
