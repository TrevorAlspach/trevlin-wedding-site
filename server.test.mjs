import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { after, before, test } from "node:test";
import { createApp, decodePrincipal, getPrincipalEmail, parseAllowedEmails } from "./server.mjs";

let baseUrl;
let distDir;
let server;

function principal(claims, authType = "google") {
  return Buffer.from(JSON.stringify({ auth_typ: authType, claims })).toString("base64");
}

function authHeaders(email, claimType = "email") {
  return { "x-ms-client-principal": principal([{ typ: claimType, val: email }]) };
}

before(async () => {
  distDir = await mkdtemp(path.join(os.tmpdir(), "wedding-auth-test-"));
  await writeFile(path.join(distDir, "index.html"), "<html>private wedding site</html>");
  await writeFile(path.join(distDir, "private.txt"), "private asset");

  const app = createApp({
    allowedEmails: new Set(["guest@example.com"]),
    providers: ["google", "aad"],
    distDir,
  });

  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  await rm(distDir, { recursive: true, force: true });
});

test("parses and normalizes the allowlist", () => {
  assert.deepEqual([...parseAllowedEmails("Guest@Example.com, second@example.com\n")], [
    "guest@example.com",
    "second@example.com",
  ]);
  assert.throws(() => parseAllowedEmails("not-an-email"), /invalid entry/);
});

test("decodes explicit email claims but rejects display-name claims", () => {
  const emailPrincipal = decodePrincipal(authHeaders("Guest@Example.com")["x-ms-client-principal"]);
  assert.equal(getPrincipalEmail(emailPrincipal), "guest@example.com");

  const displayNamePrincipal = decodePrincipal(
    principal([{ typ: "name", val: "guest@example.com" }]),
  );
  assert.equal(getPrincipalEmail(displayNamePrincipal), null);
});

test("keeps login and health endpoints public", async () => {
  const login = await fetch(`${baseUrl}/login`);
  assert.equal(login.status, 200);
  assert.match(await login.text(), /Continue with Google/);
  assert.match(login.headers.get("cache-control"), /no-store/);

  const health = await fetch(`${baseUrl}/healthz`);
  assert.equal(health.status, 200);
  assert.equal(await health.text(), "ok");
});

test("redirects anonymous page and asset requests to login", async () => {
  for (const requestPath of ["/", "/private.txt", "/registry"]) {
    const response = await fetch(`${baseUrl}${requestPath}`, { redirect: "manual" });
    assert.equal(response.status, 302);
    assert.equal(response.headers.get("location"), "/login");
  }
});

test("serves the SPA and assets only to an allowed email", async () => {
  const headers = authHeaders("GUEST@example.com");
  const pageResponse = await fetch(`${baseUrl}/registry`, { headers });
  assert.equal(pageResponse.status, 200);
  assert.match(await pageResponse.text(), /private wedding site/);
  assert.match(pageResponse.headers.get("cache-control"), /private/);
  assert.match(pageResponse.headers.get("cache-control"), /no-store/);

  const assetResponse = await fetch(`${baseUrl}/private.txt`, { headers });
  assert.equal(assetResponse.status, 200);
  assert.equal(await assetResponse.text(), "private asset");
});

test("accepts Microsoft's preferred_username claim", async () => {
  const response = await fetch(`${baseUrl}/`, {
    headers: authHeaders("guest@example.com", "preferred_username"),
  });
  assert.equal(response.status, 200);
});

test("denies an authenticated email that is not on the list", async () => {
  const response = await fetch(`${baseUrl}/`, {
    headers: authHeaders("stranger@example.com"),
  });
  assert.equal(response.status, 403);
  assert.match(await response.text(), /Access denied/);
});

test("fails closed for malformed or display-name-only principals", async () => {
  const malformed = await fetch(`${baseUrl}/`, {
    headers: { "x-ms-client-principal": "not-base64-json" },
  });
  assert.equal(malformed.status, 401);

  const displayNameOnly = await fetch(`${baseUrl}/`, {
    headers: {
      "x-ms-client-principal": principal([{ typ: "name", val: "guest@example.com" }]),
    },
  });
  assert.equal(displayNameOnly.status, 403);
});
