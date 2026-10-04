import path from "node:path";
import { pathToFileURL } from "node:url";
import { createApp } from "./app.js";
import { parseAllowedEmails, parseProviders } from "./auth.js";

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
