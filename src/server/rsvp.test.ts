import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import { test } from "node:test";
import { DataSource } from "typeorm";
import { createApp } from "./app.js";
import { parseAdminEmail } from "./auth.js";
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
import type { RsvpAdditionalGuest, RsvpAdminGuest, RsvpDetails, RsvpGuestResponse } from "../shared/rsvp.js";
import type { CurrentUser } from "../shared/auth.js";

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
      const memberships = new Map(state.memberships);
      const result = await work({
        findGuestById: async (id) => pending.find((guest) => guest.id === id) ?? null,
        findGuestsByEmail: async (email) => pending.filter((guest) => guest.email.trim().toLowerCase() === email),
        findFamily: async (id) => state.families.find((family) => family.familyId === id) ?? null,
        findMembers: async (id) => pending.filter((guest) => memberships.get(guest.id) === id),
        findGuestByAdditionId: async (additionId) => pending.find((guest) => guest.rsvpAdditionId === additionId) ?? null,
        async saveAddedGuest(familyId, addition, guestId) {
          if (guestId !== undefined) {
            Object.assign(pending.find((guest) => guest.id === guestId)!, { name: addition.name, email: addition.email });
            return guestId;
          }
          const id = Math.max(...pending.map((guest) => guest.id)) + 1;
          pending.push({ ...makeGuest(id, addition.email, familyId), name: addition.name, rsvpAdditionId: addition.additionId });
          memberships.set(id, familyId);
          return id;
        },
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
      state.memberships = memberships;
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

test("admin configuration accepts one normalized email and defaults to no admin", () => {
  assert.equal(parseAdminEmail(), null);
  assert.equal(parseAdminEmail("  "), null);
  assert.equal(parseAdminEmail(" ADMIN@Example.com "), "admin@example.com");
  for (const invalid of ["*", "example.com", "a@example.com,b@example.com", "a@example.com;b@example.com", "a@example.com b@example.com"]) {
    assert.throws(() => parseAdminEmail(invalid), /ADMIN_EMAIL/);
  }
});

test("admin RSVP uses guest IDs for shared emails and retains family validation and atomic saves", async () => {
  const { service, state } = fixture();
  state.guests[2]!.email = "guest@example.com";
  await assert.rejects(service.load("guest@example.com", null), status(409));
  const details = await service.loadGuest(3);
  assert.equal(details.guestId, 3);
  assert.deepEqual(details.identity, { email: "guest@example.com", name: "Guest 3" });
  assert.deepEqual(details.guests.map((guest) => guest.id), [3]);
  await assert.rejects(service.loadGuest(999), status(404));
  const response = answer(3, { teaCeremonyRsvp: null, rehearsalDinnerRsvp: true });
  await assert.rejects(service.submitGuest(3, { guests: [response, answer(1)] }), status(403));
  await assert.rejects(service.submitGuest(3, { guests: [answer(3)] }), status(400));
  await assert.rejects(service.submitGuest(3, { guests: [answer(1)] }), status(400));
  assert.equal(state.writes, 0);
  await service.submitGuest(3, { guests: [response] });
  assert.equal((await service.loadGuest(3)).guests[0]!.rehearsalDinnerRsvp, true);
  assert.equal(state.guests[0]!.rsvpRespondedAt, null);
  const before = structuredClone(state.guests);
  state.failGuestId = 2;
  await assert.rejects(service.submitGuest(1, { guests: [answer(1), answer(2)] }), /database failure/);
  assert.deepEqual(state.guests, before);
  state.memberships.delete(3);
  await assert.rejects(service.submitGuest(3, { guests: [response] }), status(409));
});

test("admin HTTP routes require the configured allowed SSO account on every read and write", async () => {
  const { service, state } = fixture();
  let listReads = 0;
  const app = createApp({
    allowedEmails: new Set(["guest@example.com", "admin@example.com"]),
    adminEmail: " ADMIN@EXAMPLE.COM ",
    rsvpService: service,
    guestRepository: {
      async find(options) {
        listReads++;
        assert.deepEqual(options?.select, { id: true, name: true, email: true });
        return state.guests.map(({ id, name, email }) => ({ id, name, email })) as Guest[];
      },
    },
  });
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const request = (path: string, email?: string, body?: unknown, extraHeaders = {}) => fetch(`${baseUrl}${path}`, {
    method: body ? "POST" : "GET",
    headers: { ...(email ? auth(email) : {}), "Content-Type": "application/json", ...extraHeaders },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  try {
    const payload = { guests: [answer(3, { teaCeremonyRsvp: null, rehearsalDinnerRsvp: false })] };
    for (const path of ["/api/admin/rsvp/guests", "/api/admin/rsvp/3"]) {
      assert.equal((await request(path)).status, 401);
      assert.equal((await request(path, "guest@example.com")).status, 403);
      assert.equal((await request(path, "other@example.com")).status, 403);
    }
    assert.equal((await request("/api/admin/rsvp/3", undefined, payload)).status, 401);
    assert.equal((await request("/api/admin/rsvp/3", "guest@example.com", payload, { "x-admin-email": "admin@example.com", "x-is-admin": "true" })).status, 403);
    assert.equal(state.writes, 0);
    assert.equal(listReads, 0);
    const me = await (await request("/api/me", "ADMIN@example.com")).json() as CurrentUser;
    assert.equal(me.isAdmin, true);
    const guestMe = await (await request("/api/me", "guest@example.com")).json() as CurrentUser;
    assert.equal(guestMe.isAdmin, false);
    assert.equal(JSON.stringify(guestMe).includes("admin@example.com"), false);
    const list = await request("/api/admin/rsvp/guests", "admin@example.com");
    assert.equal(list.status, 200);
    assert.match(list.headers.get("cache-control") ?? "", /no-store/);
    assert.deepEqual(Object.keys((await list.json() as RsvpAdminGuest[])[0]!).sort(), ["email", "id", "name"]);
    // The administrator does not need their own invitation; the target need not be allowlisted.
    assert.equal((await request("/api/rsvp", "admin@example.com")).status, 404);
    const invitation = await request("/api/admin/rsvp/3", "admin@example.com");
    assert.equal(invitation.status, 200);
    assert.equal((await invitation.json() as RsvpDetails).identity.email, "other@example.com");
    for (const id of ["0", "-1", "1.5", "abc", "9007199254740992"]) {
      assert.equal((await request(`/api/admin/rsvp/${id}`, "admin@example.com")).status, 400);
      assert.equal((await request(`/api/admin/rsvp/${id}`, "admin@example.com", payload)).status, 400);
    }
    assert.equal((await request("/api/admin/rsvp/999", "admin@example.com")).status, 404);
    assert.equal((await request("/api/admin/rsvp/999", "admin@example.com", payload)).status, 404);
    assert.equal((await request("/api/admin/rsvp/3", "admin@example.com", payload)).status, 200);
    assert.equal(state.guests[2]!.rsvp, true);
    assert.equal(state.guests[0]!.rsvpRespondedAt, null);
    assert.equal((await request("/api/me", "admin@example.com").then((response) => response.json()) as CurrentUser).email, "admin@example.com");
    assert.equal((await request("/api/rsvp?guestId=3", "guest@example.com").then((response) => response.json()) as RsvpDetails).guestId, 1);
    assert.equal((await request("/api/rsvp", "guest@example.com", { ...payload, isAdmin: true, guestId: 3 })).status, 400);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

test("admin access is disabled when unset and does not bypass the site allowlist", async () => {
  for (const adminEmail of [null, "outside@example.com"]) {
    const app = createApp({ allowedEmails: new Set(["guest@example.com"]), adminEmail });
    const server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    try {
      for (const email of ["guest@example.com", "outside@example.com"]) {
        for (const method of ["GET", "POST"]) {
          assert.equal((await fetch(`${baseUrl}/api/admin/rsvp/1`, { method, headers: auth(email) })).status, 403);
        }
      }
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  }
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

function addition(changes: Partial<RsvpAdditionalGuest> = {}): RsvpAdditionalGuest {
  return {
    additionId: randomUUID(), name: "New Guest", email: "", attending: true,
    teaCeremonyRsvp: false, rehearsalDinnerRsvp: null, songRequests: "A song",
    dietaryNotes: "Vegetarian", ...changes,
  };
}

test("additional guests join the authenticated family, reload, and can be edited without duplication", async () => {
  const { service, state } = fixture();
  const first = addition({ name: "  First Guest  ", email: " NEW@EXAMPLE.COM " });
  const second = addition({ name: "Second Guest", attending: false });
  const payload = { guests: [answer(1)], additionalGuests: [first, second] };
  const result = await service.submit("guest@example.com", payload);
  assert.deepEqual(result.addedGuests.map((guest) => guest.guestId), [4, 5]);
  assert.deepEqual(state.memberships.get(4), "family-a");
  assert.equal(state.guests[3]!.family, "family-a");
  assert.equal(state.guests[3]!.name, "First Guest");
  assert.equal(state.guests[3]!.email, "new@example.com");
  assert.equal(state.guests[4]!.email, "");
  assert.equal(state.guests[3]!.dietaryNotes, "Vegetarian");
  assert.equal(state.guests[4]!.rsvp, false);
  assert.deepEqual(state.guests[0]!.rsvpRespondedAt, state.guests[3]!.rsvpRespondedAt);
  assert.equal(state.guests[1]!.rsvpRespondedAt, null);
  assert.deepEqual((await service.load("guest@example.com", null)).guests.map((guest) => guest.id), [1, 2, 4, 5]);
  assert.equal((await service.load("new@example.com", null)).guestId, 4);
  assert.deepEqual(await service.submit("guest@example.com", payload), result);
  assert.equal(state.guests.length, 5);
  await service.submit("guest@example.com", { guests: [answer(1), answer(4, { dietaryNotes: "Updated" })] });
  assert.equal(state.guests[3]!.dietaryNotes, "Updated");
  assert.equal(state.guests.length, 5);
});

test("additional guests cannot bypass identity, family, or event validation", async () => {
  const { service, state } = fixture();
  for (const body of [
    { guests: [answer(2)], additionalGuests: [addition()] },
    { guests: [answer(1)], additionalGuests: [addition({ teaCeremonyRsvp: null })] },
    { guests: [answer(1)], additionalGuests: [addition({ rehearsalDinnerRsvp: true })] },
  ]) await assert.rejects(service.submit("guest@example.com", body), status(400));
  assert.equal(state.guests.length, 3);
  assert.equal(state.writes, 0);
  const added = addition();
  await service.submit("guest@example.com", { guests: [answer(1)], additionalGuests: [added] });
  await assert.rejects(service.submitGuest(3, {
    guests: [answer(3, { teaCeremonyRsvp: null, rehearsalDinnerRsvp: true })],
    additionalGuests: [{ ...added, teaCeremonyRsvp: null, rehearsalDinnerRsvp: true }],
  }), status(403));
});

test("additional guests and memberships roll back together if a response or email validation fails", async () => {
  const { service, state } = fixture();
  const before = structuredClone(state.guests);
  const memberships = new Map(state.memberships);
  state.failGuestId = 5;
  await assert.rejects(service.submit("guest@example.com", {
    guests: [answer(1)], additionalGuests: [addition(), addition()],
  }), /database failure/);
  assert.deepEqual(state.guests, before);
  assert.deepEqual(state.memberships, memberships);
  state.failGuestId = 0;
  for (const email of ["guest@example.com", "other@example.com", " NEW@EXAMPLE.COM "]) {
    await assert.rejects(service.submit("guest@example.com", {
      guests: [answer(1)], additionalGuests: [addition({ email: "new@example.com" }), addition({ email })],
    }), status(409));
    assert.deepEqual(state.guests, before);
    assert.deepEqual(state.memberships, memberships);
  }
});

test("additional guest parsing rejects invalid fields, names, emails and repeated addition IDs", () => {
  const guest = addition();
  for (const additionalGuests of [
    null, {}, [null], [guest, guest], [{ ...guest, name: "  " }],
    [{ ...guest, name: "a".repeat(201) }], [{ ...guest, email: "invalid" }],
    [{ ...guest, email: "a".repeat(321) }], [{ ...guest, additionId: "bad-id" }],
    [{ ...guest, guestId: 3 }], [{ ...guest, familyId: "family-b" }],
    [{ ...guest, attending: "yes" }], [{ ...guest, dietaryNotes: "a".repeat(2001) }],
  ]) assert.throws(() => parseRsvpSubmission({ guests: [answer(1)], additionalGuests }), status(400));
});

test("families can add more than one plus-one without a fixed guest-count limit", async () => {
  const { service, state } = fixture();
  const additionalGuests = Array.from({ length: 101 }, (_, index) => addition({ name: `Additional ${index}` }));
  await service.submitGuest(1, { guests: [answer(1)], additionalGuests });
  assert.equal(state.guests.length, 104);
  assert.equal((await service.loadGuest(1)).guests.length, 103);
});
