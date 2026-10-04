import path from "node:path";
import { once } from "node:events";
import { pathToFileURL } from "node:url";
import { createApp } from "./app.js";
import { parseAllowedEmails, parseProviders } from "./auth.js";
import database from "./db/data-source.js";
import { guestRepository } from "./db/guest-repository.js";
import { createRsvpStore } from "./db/rsvp-repository.js";
import { createRsvpService } from "./rsvp.js";

export async function startServer() {
  const allowedEmails = parseAllowedEmails(process.env.ALLOWED_EMAILS);
  const providers = parseProviders(process.env.AUTH_PROVIDERS);
  const port = Number.parseInt(process.env.PORT || "80", 10);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }

  if (allowedEmails.size === 0) {
    console.warn("ALLOWED_EMAILS is empty; all authenticated users will be denied");
  }

  await database.initialize();
  console.log("Azure SQL connection established");

  const rsvpService = createRsvpService(createRsvpStore(database));
  const server = createApp({ allowedEmails, providers, guestRepository, rsvpService }).listen(port, "0.0.0.0");
  try {
    await once(server, "listening");
  } catch (error) {
    await database.destroy();
    throw error;
  }
  console.log(`Wedding site authorization server listening on port ${port}`);
  console.log(`Loaded ${allowedEmails.size} allowed guest email address(es)`);

  let shuttingDown = false;
  let shutdownTimeout: ReturnType<typeof setTimeout> | undefined;
  const shutdown = () => {
    if (shuttingDown) return;
    shuttingDown = true;
    shutdownTimeout = setTimeout(() => process.exit(1), 25_000);
    shutdownTimeout.unref();
    server.close((error) => {
      if (error) {
        console.error("HTTP shutdown failed", error);
        process.exitCode = 1;
      }
    });
  };
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
  server.once("close", () => {
    process.removeListener("SIGTERM", shutdown);
    process.removeListener("SIGINT", shutdown);
    void database.destroy()
      .catch((error: unknown) => {
        console.error("Database shutdown failed", error);
        process.exitCode = 1;
      })
      .finally(() => clearTimeout(shutdownTimeout));
  });
  return server;
}

const entryPoint = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (entryPoint === import.meta.url) {
  startServer().catch((error: unknown) => {
    console.error("Server startup failed", error);
    process.exitCode = 1;
  });
}
