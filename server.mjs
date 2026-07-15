import express from "express";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DIST_DIR = path.join(__dirname, "dist");

const EMAIL_CLAIM_TYPES = new Set([
  "email",
  "emails",
  "preferred_username",
  "upn",
  "unique_name",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn",
]);

const PROVIDERS = {
  google: { label: "Continue with Google", route: "google" },
  aad: { label: "Continue with Microsoft", route: "aad" },
};

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function looksLikeEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function parseAllowedEmails(value = "") {
  const emails = new Set();
  const invalid = [];

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
    throw new Error(`ALLOWED_EMAILS contains ${invalid.length} invalid entr${invalid.length === 1 ? "y" : "ies"}`);
  }

  return emails;
}

export function parseProviders(value = "google,aad") {
  const selected = [];

  for (const item of String(value).split(/[\s,;]+/)) {
    const provider = item.trim().toLowerCase();
    if (!provider) continue;
    if (!PROVIDERS[provider]) {
      throw new Error(`AUTH_PROVIDERS contains unsupported provider: ${item}`);
    }
    if (!selected.includes(provider)) selected.push(provider);
  }

  if (selected.length === 0) {
    throw new Error("AUTH_PROVIDERS must contain at least one provider");
  }

  return selected;
}

export function decodePrincipal(headerValue) {
  if (typeof headerValue !== "string" || headerValue.length === 0 || headerValue.length > 64_000) {
    return null;
  }

  try {
    const decoded = Buffer.from(headerValue, "base64").toString("utf8");
    const principal = JSON.parse(decoded);
    if (!principal || typeof principal.auth_typ !== "string" || !Array.isArray(principal.claims)) {
      return null;
    }
    return principal;
  } catch {
    return null;
  }
}

export function getPrincipalEmail(principal) {
  if (!principal || !Array.isArray(principal.claims)) return null;

  for (const claim of principal.claims) {
    if (!claim || typeof claim.typ !== "string" || typeof claim.val !== "string") continue;
    if (!EMAIL_CLAIM_TYPES.has(claim.typ.toLowerCase())) continue;

    const email = normalizeEmail(claim.val);
    if (looksLikeEmail(email)) return email;
  }

  return null;
}

function securityMiddleware() {
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

function page(title, body) {
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

function loginPage(providers) {
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

function deniedPage() {
  return page(
    "Access denied",
    `<h1>Access denied</h1>
     <p>This account is not on the guest list. Try another account or contact the couple if this looks wrong.</p>
     <div class="actions"><a href="/.auth/logout?post_logout_redirect_uri=%2Flogin">Try another account</a></div>`,
  );
}

export function createApp({
  allowedEmails = parseAllowedEmails(process.env.ALLOWED_EMAILS),
  providers = parseProviders(process.env.AUTH_PROVIDERS),
  distDir = DEFAULT_DIST_DIR,
} = {}) {
  const app = express();
  const indexPath = path.join(distDir, "index.html");

  app.disable("x-powered-by");
  app.use(securityMiddleware());
  app.use((request, response, next) => {
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
    const rawPrincipal = request.get("x-ms-client-principal");
    if (!rawPrincipal) {
      return response.redirect(302, "/login");
    }

    const principal = decodePrincipal(rawPrincipal);
    if (!principal) {
      response.setHeader("Cache-Control", "no-store");
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
      return response.status(403).type("html").send(deniedPage());
    }

    response.locals.authenticatedEmail = email;
    response.setHeader("Cache-Control", "private, no-store");
    return next();
  });

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

export function startServer() {
  const allowedEmails = parseAllowedEmails(process.env.ALLOWED_EMAILS);
  const providers = parseProviders(process.env.AUTH_PROVIDERS);
  const port = Number.parseInt(process.env.PORT || "80", 10);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  if (allowedEmails.size === 0) {
    console.warn("ALLOWED_EMAILS is empty; all authenticated users will be denied");
  }

  return createApp({ allowedEmails, providers }).listen(port, "0.0.0.0", () => {
    console.log(`Wedding site authorization server listening on port ${port}`);
    console.log(`Loaded ${allowedEmails.size} allowed guest email address(es)`);
  });
}

const entryPoint = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (entryPoint === import.meta.url) startServer();
