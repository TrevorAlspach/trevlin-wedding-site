import express, {
  type ErrorRequestHandler,
  type RequestHandler,
} from "express";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  decodePrincipal,
  getPrincipalEmail,
  getPrincipalName,
  parseAllowedEmails,
  parseAdminEmail,
  parseProviders,
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
  parseAccessRequestBody,
  type AccessRequestSender,
} from "./access-request.js";

import type { ProviderName, SessionResponse } from "../shared/auth.js";
import type { AccessRequestResponse } from "../shared/access-request.js";
import type { Repository } from "typeorm";
import type { Guest } from "./db/guest.js";
import { RsvpError, type RsvpService } from "./rsvp.js";

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
        frameSrc: ["'self'", "https://www.google.com"],
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

function isApiRequest(pathname: string): boolean {
  return pathname === "/api" || pathname.startsWith("/api/");
}

const requestErrorHandler: ErrorRequestHandler = (error, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }
  const status = typeof error?.status === "number" ? error.status : 500;
  if (status === 400 || status === 413) {
    response.status(400).json({ status: "invalid_request", error: "Invalid request body." });
    return;
  }
  console.error("Request failed", error);
  response.status(500).json({ status: "error", error: "The request could not be completed." });
};

export type CreateAppOptions = {
  allowedEmails?: Set<string>;
  adminEmail?: string | null;
  providers?: ProviderName[];
  distDir?: string;
  guestRepository?: Pick<Repository<Guest>, "find">;
  rsvpService?: RsvpService;
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
  adminEmail = parseAdminEmail(process.env.ADMIN_EMAIL),
  providers = parseProviders(process.env.AUTH_PROVIDERS),
  distDir = DEFAULT_DIST_DIR,
  guestRepository,
  rsvpService,
  chatModel,
  chatRateLimit,
  accessRequestSender,
  accessRequestRateLimit,
}: CreateAppOptions = {}) {
  const configuredAdmin = parseAdminEmail(adminEmail ?? "");
  const app = express();
  const indexPath = path.join(distDir, "index.html");
  const authDistDir = path.join(distDir, "auth");
  const authIndexPath = path.join(authDistDir, "index.html");
  const checkChatRateLimit = createGuestRateLimiter(chatRateLimit);
  const sendAccessRequest =
    accessRequestSender === undefined
      ? createFormspreeAccessRequestSender()
      : (accessRequestSender ?? undefined);
  const accessRequestRateLimiter = createAccessRequestRateLimiter(
    accessRequestRateLimit,
  );

  app.disable("x-powered-by");
  app.use(securityMiddleware());
  app.use((_request, response, next) => {
    response.setHeader("Cache-Control", "private, no-store");
    response.setHeader(
      "X-Robots-Tag",
      "noindex, nofollow, noarchive, nosnippet",
    );
    next();
  });

  app.get("/healthz", (_request, response) => {
    response.setHeader("Cache-Control", "no-store");
    response.status(200).type("text/plain").send("ok");
  });

  // Only the sign-in client is public. Wedding bundles and assets remain gated.
  app.use("/auth", express.static(authDistDir, { index: false, redirect: false }));
  app.get("/login", (_request, response) => {
    response.sendFile(authIndexPath);
  });

  app.get("/api/session", (request, response) => {
    const rawPrincipal = request.get("x-ms-client-principal");
    const principal = decodePrincipal(rawPrincipal);
    const email = getPrincipalEmail(principal);
    const session: SessionResponse = {
      status: !rawPrincipal
        ? "anonymous"
        : !principal
          ? "invalid"
          : email && allowedEmails.has(email)
            ? "allowed"
            : "denied",
      email,
      name: getPrincipalName(principal),
      providers,
      accessRequestsEnabled: Boolean(email && !allowedEmails.has(email) && sendAccessRequest),
    };
    response.json(session);
  });

  app.post(
    ["/api/request-access", "/request-access"],
    express.json({ limit: "4kb", strict: true }),
    async (request, response) => {
      const reply = (status: number, body: AccessRequestResponse) => response.status(status).json(body);
      const principal = decodePrincipal(request.get("x-ms-client-principal"));
      if (!principal) {
        reply(401, { status: "unauthenticated", error: "Please sign in again." });
        return;
      }

      const email = getPrincipalEmail(principal);
      if (!email) {
        reply(403, { status: "forbidden", error: "This account does not have a verified email address." });
        return;
      }

      if (allowedEmails.has(email)) {
        reply(200, { status: "already_allowed" });
        return;
      }

      if (!sendAccessRequest) {
        reply(503, { status: "unavailable", error: "Access requests are not available right now." });
        return;
      }

      let message: string;
      try {
        ({ message } = parseAccessRequestBody(request.body));
      } catch (error) {
        if (!(error instanceof AccessRequestValidationError)) throw error;
        reply(400, { status: "invalid_message", error: "Please shorten your message and try again." });
        return;
      }

      const rateLimit = accessRequestRateLimiter.reserve(email);
      if (!rateLimit.allowed) {
        response.setHeader("Retry-After", String(rateLimit.retryAfterSeconds));
        reply(429, {
          status: "rate_limited",
          error: "We already received a recent request from this account.",
          retryAfterSeconds: rateLimit.retryAfterSeconds,
        });
        return;
      }

      try {
        await sendAccessRequest({
          email,
          name: getPrincipalName(principal),
          provider: principal.auth_typ,
          message,
          requestedAt: new Date().toISOString(),
        });
      } catch (error) {
        accessRequestRateLimiter.release(email);
        console.error("Access request delivery failed", error);
        reply(502, { status: "unavailable", error: "We could not send your request right now." });
        return;
      }

      reply(200, { status: "sent", email });
    },
  );

  app.use((request, response, next) => {
    const apiRequest = isApiRequest(request.path) || !["GET", "HEAD"].includes(request.method);
    const rawPrincipal = request.get("x-ms-client-principal");
    if (!rawPrincipal) {
      if (apiRequest) {
        response.setHeader("Cache-Control", "no-store");
        return response
          .status(401)
          .json({ error: "Your session has expired. Please sign in again." });
      }
      return response.status(302).set("Location", "/login").end();
    }

    const principal = decodePrincipal(rawPrincipal);
    if (!principal) {
      response.setHeader("Cache-Control", "no-store");
      if (apiRequest) {
        return response
          .status(401)
          .json({ error: "Your session has expired. Please sign in again." });
      }
      return response.status(401).sendFile(authIndexPath);
    }

    const email = getPrincipalEmail(principal);
    if (!email || !allowedEmails.has(email)) {
      if (!email) {
        const claimTypes = principal.claims
          .map((claim) => (typeof claim?.typ === "string" ? claim.typ : null))
          .filter(Boolean);
        console.warn(
          "Authenticated principal did not include a supported email claim",
          {
            provider: principal.auth_typ,
            claimTypes,
          },
        );
      }
      response.setHeader("Cache-Control", "no-store");
      if (apiRequest) {
        return response
          .status(403)
          .json({ error: "This account does not have access." });
      }
      return response.status(403).sendFile(authIndexPath);
    }

    response.locals.authenticatedEmail = email;
    response.locals.authenticatedName = getPrincipalName(principal);
    response.locals.isAdmin = email === configuredAdmin;
    response.setHeader("Cache-Control", "private, no-store");
    return next();
  });

  app.get("/api/me", (_request, response) => {
    response.json({
      email: response.locals.authenticatedEmail,
      name: response.locals.authenticatedName,
      isAdmin: response.locals.isAdmin,
    });
  });

  app.use("/api/admin", (_request, response, next) => {
    if (!response.locals.isAdmin) {
      response.status(403).json({ error: "Administrator access is required." });
      return;
    }
    next();
  });

  app.get("/api/admin/rsvp/guests", async (_request, response) => {
    if (!guestRepository) {
      response.status(503).json({ error: "Guest information is currently unavailable." });
      return;
    }
    const guests = await guestRepository.find({
      select: { id: true, name: true, email: true },
      order: { name: "ASC", id: "ASC" },
    });
    response.json(guests);
  });

  app.use("/api/admin/rsvp/:guestId", (request, response, next) => {
    const value = request.params.guestId;
    if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) {
      response.status(400).json({ error: "Please select a valid guest." });
      return;
    }
    response.locals.rsvpGuestId = Number(value);
    next();
  });

  app.get("/api/guests", async (_request, response) => {
    if (!guestRepository) {
      response.status(503).json({ error: "Guest information is currently unavailable." });
      return;
    }

    const guests = await guestRepository.find({
      // RSVP notes and individual event responses are only exposed to the family.
      select: { id: true, name: true, email: true, address: true, rsvp: true, family: true },
      order: { id: "ASC" },
    });
    response.json(guests);
  });

  app.get(["/api/rsvp", "/api/admin/rsvp/:guestId"], async (_request, response) => {
    if (!rsvpService) {
      response.status(503).json({ error: "RSVP is currently unavailable. Please try again later." });
      return;
    }
    try {
      response.json(response.locals.rsvpGuestId
        ? await rsvpService.loadGuest(response.locals.rsvpGuestId as number)
        : await rsvpService.load(
          response.locals.authenticatedEmail as string,
          response.locals.authenticatedName as string | null,
        ));
    } catch (error) {
      if (!(error instanceof RsvpError)) throw error;
      response.status(error.status).json({ error: error.message });
    }
  });

  app.post(["/api/rsvp", "/api/admin/rsvp/:guestId"], express.json({ limit: "256kb", strict: true }), async (request, response) => {
    if (!rsvpService) {
      response.status(503).json({ error: "RSVP is currently unavailable. Please try again later." });
      return;
    }
    if (!request.is("application/json")) {
      response.status(415).json({ error: "Please submit your RSVP as JSON." });
      return;
    }
    try {
      if (response.locals.rsvpGuestId) {
        await rsvpService.submitGuest(response.locals.rsvpGuestId as number, request.body);
        console.info("Admin RSVP saved", {
          actorEmail: response.locals.authenticatedEmail,
          targetGuestId: response.locals.rsvpGuestId,
        });
      } else {
        await rsvpService.submit(response.locals.authenticatedEmail as string, request.body);
      }
      response.json({ status: "saved" });
    } catch (error) {
      if (!(error instanceof RsvpError)) throw error;
      response.status(error.status).json({ error: error.message });
    }
  });

  app.post(
    "/api/chat",
    express.json({ limit: "32kb", strict: true }),
    (_request, response, next) => {
      const email = response.locals.authenticatedEmail as string;
      const rateLimit = checkChatRateLimit(email);
      if (!rateLimit.allowed) {
        response.setHeader("Retry-After", String(rateLimit.retryAfterSeconds));
        response
          .status(429)
          .json({ error: "Too many chat requests. Please try again shortly." });
        return;
      }
      next();
    },
    createChatHandler({ model: chatModel }),
  );

  app.use("/api", (_request, response) => {
    response.status(404).json({ error: "API endpoint not found." });
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

  app.use((_request, response) => {
    response.status(404).json({ error: "Endpoint not found." });
  });
  app.use(requestErrorHandler);

  return app;
}
