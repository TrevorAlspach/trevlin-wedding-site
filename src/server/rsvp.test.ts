import assert from "node:assert/strict";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import { test } from "node:test";
import { DataSource } from "typeorm";
import { createApp } from "./app.js";
import { databaseOptions } from "./db/config.js";
import type { Family } from "./db/family.js";
import type { Guest } from "./db/guest.js";
import { createRsvpReader, createRsvpStore } from "./db/rsvp-repository.js";
import {
  createRsvpService,
  parseRsvpSubmission,
  RsvpError,
  type RsvpStore,
} from "./rsvp.js";
import type { RsvpDetails, RsvpGuestResponse } from "../shared/rsvp.js";

function makeGuest(id: number, email: string, family = "family-a"): Guest {
  return {
    id, email, family, name: `Guest ${id}`, address: "Private address", rsvp: false,
    teaCeremonyRsvp: null, rehearsalDinnerRsvp: null, rsvpRespondedAt: null,
    songRequests: null, dietaryNotes: null,
  };
}

function answer(guestId: number, changes: Partial<RsvpGuestResponse> = {}): RsvpGuestResponse {
  return {
    guestId, attending: true, teaCeremonyRsvp: true, rehearsalDinnerRsvp: null,
    songRequests: "", dietaryNotes: "", ...changes,
  };
}

function fixture() {
  const state = {
    guests: [makeGuest(1, "guest@example.com"), makeGuest(2, "relative@example.com"), makeGuest(3, "other@example.com", "family-b")],
    families: [
      { familyId: "family-a", teaCeremonyInvited: true, rehearsalDinnerInvited: false },
      { familyId: "family-b", teaCeremonyInvited: false, rehearsalDinnerInvited: true },
    ] as Family[],
    memberships: new Map([[1, "family-a"], [2, "family-a"], [3, "family-b"]]),
    failGuestId: 0,
    writes: 0,
  };
  const store: RsvpStore = {
    async transaction(work) {
      const pending = structuredClone(state.guests);
      const result = await work({
        findGuestsByEmail: async (email) => pending.filter((guest) => guest.email.trim().toLowerCase() === email),
        findFamily: async (id) => state.families.find((family) => family.familyId === id) ?? null,
        findMembers: async (id) => pending.filter((guest) => state.memberships.get(guest.id) === id),
        async saveResponse(familyId, response, respondedAt) {
          state.writes++;
          if (response.guestId === state.failGuestId) throw new Error("Simulated database failure");
          const guest = pending.find((item) => item.id === response.guestId && item.family === familyId);
          assert.ok(guest);
          Object.assign(guest, {
            rsvp: response.attending, teaCeremonyRsvp: response.teaCeremonyRsvp,
            rehearsalDinnerRsvp: response.rehearsalDinnerRsvp, rsvpRespondedAt: respondedAt,
            songRequests: response.songRequests, dietaryNotes: response.dietaryNotes,
          });
        },
      });
      state.guests = pending;
      return result;
    },
  };
  return { state, service: createRsvpService(store) };
}

function status(expected: number) {
  return (error: unknown) => error instanceof RsvpError && error.status === expected;
}

test("RSVP lookup returns only the authenticated household with invitation flags and saved answers", async () => {
  const { service, state } = fixture();
  state.guests[1]!.rsvpRespondedAt = new Date();
  state.guests[1]!.teaCeremonyRsvp = false;
  const result = await service.load(" GUEST@EXAMPLE.COM ", "Google Name");
  assert.deepEqual(result.guests.map((guest) => guest.id), [1, 2]);
  assert.equal(result.identity.name, "Google Name");
  assert.equal(result.guestId, 1);
  assert.deepEqual(result.invitations, { teaCeremony: true, rehearsalDinner: false });
  assert.equal(result.guests[0]!.attending, null);
  assert.equal(result.guests[1]!.attending, false);
  assert.equal(result.guests[1]!.teaCeremonyRsvp, false);
  assert.equal("address" in result.guests[0]!, false);
  assert.equal("email" in result.guests[1]!, false);
});

test("RSVP lookup rejects missing, ambiguous, unassigned, and inconsistent household records", async () => {
  const { service, state } = fixture();
  await assert.rejects(service.load("missing@example.com", null), status(404));
  state.guests.push(makeGuest(4, "GUEST@example.com"));
  await assert.rejects(service.load("guest@example.com", null), status(409));
  state.guests.pop();
  state.guests[0]!.family = null;
  await assert.rejects(service.load("guest@example.com", null), status(409));
  state.guests[0]!.family = "family-a";
  state.memberships.delete(1);
  await assert.rejects(service.load("guest@example.com", null), status(409));
  state.memberships.set(1, "family-a");
  state.memberships.set(3, "family-a");
  await assert.rejects(service.load("guest@example.com", null), status(409));
});

test("RSVP submission saves individual yes/no event answers and notes, leaving unselected members untouched", async () => {
  const { service, state } = fixture();
  const untouched = structuredClone(state.guests[1]);
  await service.submit("guest@example.com", { guests: [answer(1, { attending: false, teaCeremonyRsvp: false, dietaryNotes: "  No peanuts  " })] });
  assert.equal(state.guests[0]!.rsvp, false);
  assert.equal(state.guests[0]!.teaCeremonyRsvp, false);
  assert.equal(state.guests[0]!.rehearsalDinnerRsvp, null);
  assert.equal(state.guests[0]!.dietaryNotes, "No peanuts");
  assert.ok(state.guests[0]!.rsvpRespondedAt instanceof Date);
  assert.deepEqual(state.guests[1], untouched);
  const reloaded = await service.load("guest@example.com", null);
  assert.equal(reloaded.guests[0]!.attending, false);
  await service.submit("guest@example.com", { guests: [answer(1), answer(2, { teaCeremonyRsvp: false, songRequests: "Our song" })] });
  assert.equal(state.guests[0]!.rsvp, true);
  assert.equal(state.guests[1]!.teaCeremonyRsvp, false);
  assert.equal(state.guests[1]!.songRequests, "Our song");
  assert.deepEqual(state.guests[0]!.rsvpRespondedAt, state.guests[1]!.rsvpRespondedAt);
});

test("RSVP rejects foreign guests, missing self, unanswered events, and uninvited event responses before writes", async () => {
  const { service, state } = fixture();
  await assert.rejects(service.submit("guest@example.com", { guests: [answer(1), answer(3)] }), status(403));
  await assert.rejects(service.submit("guest@example.com", { guests: [answer(2)] }), status(400));
  await assert.rejects(service.submit("guest@example.com", { guests: [answer(1, { teaCeremonyRsvp: null })] }), status(400));
  await assert.rejects(service.submit("guest@example.com", { guests: [answer(1, { rehearsalDinnerRsvp: true })] }), status(400));
  assert.equal(state.writes, 0);
  state.families[0]!.teaCeremonyInvited = false;
  // An invitation change since the page was opened is checked again on submit.
  await assert.rejects(service.submit("guest@example.com", { guests: [answer(1)] }), status(400));
  assert.equal(state.writes, 0);
});

test("RSVP supports both invitation flags and explicit independent attendance choices", async () => {
  const { service, state } = fixture();
  state.families[0]!.rehearsalDinnerInvited = true;
  await service.submit("guest@example.com", {
    guests: [answer(1, { attending: false, teaCeremonyRsvp: true, rehearsalDinnerRsvp: false })],
  });
  const result = await service.load("guest@example.com", null);
  assert.equal(result.guests[0]!.attending, false);
  assert.equal(result.guests[0]!.teaCeremonyRsvp, true);
  assert.equal(result.guests[0]!.rehearsalDinnerRsvp, false);
});

test("RSVP saves atomically if a later guest update fails", async () => {
  const { service, state } = fixture();
  const before = structuredClone(state.guests);
  state.failGuestId = 2;
  await assert.rejects(service.submit("guest@example.com", { guests: [answer(1), answer(2)] }), /database failure/);
  assert.deepEqual(state.guests, before);
});

test("RSVP parser rejects spoofed identity, duplicate guests, coercion, and excessive notes", () => {
  for (const body of [
    null, {}, { guests: [] }, { email: "other@example.com", guests: [answer(1)] },
    { familyId: "family-b", guests: [answer(1)] }, { guests: [answer(1), answer(1)] },
    { guests: [{ ...answer(1), attending: "yes" }] },
    { guests: [{ ...answer(1), guestId: "1" }] },
    { guests: [{ ...answer(1), teaCeremonyInvited: true }] },
    { guests: [answer(1, { songRequests: "a".repeat(1001) })] },
    { guests: [answer(1, { dietaryNotes: "a".repeat(2001) })] },
  ]) assert.throws(() => parseRsvpSubmission(body), status(400));
});

test("database RSVP adapter uses a transaction and mapped SQL joins without opening a connection", async () => {
  const database = new DataSource(databaseOptions({ AZURE_SQL_SERVER: "offline.invalid", AZURE_SQL_DATABASE: "offline" }));
  // Build entity metadata without initialize(), which would open a DB connection.
  await (database as unknown as { buildMetadatas(): Promise<void> }).buildMetadatas();
  const statements: { query: string; parameters: unknown }[] = [];
  const queryRunner = database.createQueryRunner();
  queryRunner.query = (async (query: string, parameters: unknown = [], useStructuredResult = false) => {
    statements.push({ query, parameters });
    return useStructuredResult ? { raw: [], records: [] } : [];
  }) as typeof queryRunner.query;
  const reader = createRsvpReader(queryRunner.manager);
  await reader.findGuestsByEmail("guest@example.com");
  await reader.findMembers("family-a");
  assert.match(statements[0]!.query, /LOWER\(LTRIM\(RTRIM\(/);
  assert.deepEqual(statements[0]!.parameters, ["guest@example.com"]);
  assert.match(statements[1]!.query, /INNER JOIN "dbo"\."family_guests"/);
  assert.match(statements[1]!.query, /"membership"\."guest_id" = "guest"\."id"/);
  assert.match(statements[1]!.query, /"membership"\."family_id" = @0/);
  assert.deepEqual(statements[1]!.parameters, ["family-a"]);
  let transactionUsed = false;
  database.transaction = (async (isolation: string, work: (manager: typeof database.manager) => Promise<void>) => {
    assert.equal(isolation, "SERIALIZABLE");
    transactionUsed = true;
    return work(database.manager);
  }) as typeof database.transaction;
  await createRsvpStore(database).transaction(async () => {});
  assert.equal(transactionUsed, true);
});

function auth(email = "guest@example.com") {
  return {
    "x-ms-client-principal": Buffer.from(JSON.stringify({
      auth_typ: "google", claims: [{ typ: "email", val: email }, { typ: "name", val: "Google Guest" }],
    })).toString("base64"),
  };
}

test("RSVP HTTP endpoints enforce SSO and family authorization and persist a reloadable response", async () => {
  const { service, state } = fixture();
  const app = createApp({ allowedEmails: new Set(["guest@example.com"]), rsvpService: service });
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
    for (const method of ["GET", "POST"]) {
      assert.equal((await fetch(`${baseUrl}/api/rsvp`, { method })).status, 401);
      assert.equal((await fetch(`${baseUrl}/api/rsvp`, { method, headers: auth("other@example.com") })).status, 403);
    }
    const response = await fetch(`${baseUrl}/api/rsvp`, { headers: auth() });
    assert.equal(response.status, 200);
    assert.match(response.headers.get("cache-control") ?? "", /no-store/);
    const details = await response.json() as RsvpDetails;
    assert.deepEqual(details.identity, { name: "Google Guest", email: "guest@example.com" });
    assert.deepEqual(details.guests.map((guest) => guest.id), [1, 2]);
    const submit = (guests: RsvpGuestResponse[]) => fetch(`${baseUrl}/api/rsvp`, {
      method: "POST", headers: { ...auth(), "Content-Type": "application/json" }, body: JSON.stringify({ guests }),
    });
    assert.equal((await submit([answer(1), answer(3)])).status, 403);
    assert.equal(state.writes, 0);
    assert.equal((await submit([answer(1), answer(2, { teaCeremonyRsvp: false })])).status, 200);
    const reloaded = await (await fetch(`${baseUrl}/api/rsvp`, { headers: auth() })).json() as RsvpDetails;
    assert.equal(reloaded.guests[0]!.attending, true);
    assert.equal(reloaded.guests[1]!.teaCeremonyRsvp, false);
    assert.equal((await fetch(`${baseUrl}/api/rsvp`, {
      method: "POST", headers: { ...auth(), "Content-Type": "application/json" }, body: "{invalid",
    })).status, 400);
    assert.equal((await fetch(`${baseUrl}/api/rsvp`, {
      method: "POST", headers: { ...auth(), "Content-Type": "text/plain" }, body: "ignored",
    })).status, 415);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
