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
    referrerPolicy: { policy: "no-referrer" },
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
      a { display: block; padding: .9rem 1rem; border-radius: .65rem; color: #314021; background: #f5efe0; text-align: center; text-decoration: none; font-weight: 700; }
      a:hover { background: #fffaf0; }
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

function deniedPage(): string {
  return page(
    "Access denied",
    `<h1>Access denied</h1>
     <p>This account is not on the guest list. Try another account or contact the couple if this looks wrong.</p>
     <div class="actions"><a href="/.auth/logout?post_logout_redirect_uri=%2Flogin">Try another account</a></div>`,
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
};

export function createApp({
  allowedEmails = parseAllowedEmails(process.env.ALLOWED_EMAILS),
  providers = parseProviders(process.env.AUTH_PROVIDERS),
  distDir = DEFAULT_DIST_DIR,
  chatModel,
  chatRateLimit,
}: CreateAppOptions = {}) {
  const app = express();
  const indexPath = path.join(distDir, "index.html");
  const checkChatRateLimit = createGuestRateLimiter(chatRateLimit);

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
      return response.status(401).type("html").send(deniedPage());
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
      return response.status(403).type("html").send(deniedPage());
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
