## Wedding site

The production container uses Azure Container Apps Easy Auth for authentication and
checks each authenticated email address against `ALLOWED_EMAILS` before serving the
wedding application or its static assets. The separate sign-in client and its
assets are public so guests can sign in and request access.

See [azure-auth-setup.md](azure-auth-setup.md) for the Azure and OAuth provider setup.

## Run with Docker

From the project root:

```powershell
docker build -t trevlin-wedding-site .
docker run --rm -p 8080:80 `
  -e ALLOWED_EMAILS="guest@example.com" `
  -e AUTH_PROVIDERS="google,aad" `
  -e ACCESS_REQUEST_FORM_ID="your-formspree-form-id" `
  -e OPENAI_API_KEY `
  -e OPENAI_MODEL="gpt-5.6-luna" `
  -e AZURE_SQL_SERVER `
  -e AZURE_SQL_DATABASE `
  -e AZURE_CLIENT_ID `
  --name trevlin-wedding-site trevlin-wedding-site
```

Azure Easy Auth supplies the trusted `X-MS-CLIENT-PRINCIPAL` header in production.
Anonymous local requests redirect to `/login`; use `npm run test:server` to exercise
the authenticated request paths with simulated Easy Auth headers.

Unlisted authenticated guests can request access when `ACCESS_REQUEST_FORM_ID` is
set to a dedicated Formspree form ID. The server takes the requested email only
from Azure Easy Auth, includes the token's display name when available, relays the request to Formspree, and limits each email to
one successful request every 12 hours. Leave the variable empty to hide the
request form and keep the original contact-the-couple message.

Sign-in, access-denied, and access-request result pages are rendered by
`src/client/auth`. They read provider and session information from
`GET /api/session` and submit `{ "message": "..." }` to
`POST /api/request-access`. Responses use HTTP status codes and JSON, including
validation errors, delivery failures, and rate limits. The original
`POST /request-access` URL also accepts this JSON contract. Chat continues to
stream JSON events over SSE.

For a non-container local build, copy `.env.example` to `.env`, add your local
`OPENAI_API_KEY`, and keep that file untracked. `npm start` loads it when present.
The browser always calls the same-origin `/api/chat` endpoint; no API key or
`VITE_`-prefixed chat configuration is exposed to the frontend.

## Azure SQL configuration

Before deploying the workflow with the database settings, create these secrets
directly on the Container App under **Security → Secrets → Add**, using the
**Container Apps Secret** type:

| Container App secret | Value | Runtime environment variable |
| --- | --- | --- |
| `azure-sql-server` | `<server-name>.database.windows.net` | `AZURE_SQL_SERVER` |
| `azure-sql-database` | Application database name | `AZURE_SQL_DATABASE` |
| `azure-client-id` | User-assigned managed identity's client ID | `AZURE_CLIENT_ID` |

The deployment workflow maps these existing secrets to environment variables with
`secretref:`. It does not create or overwrite these three secrets, and their values
do not need to be stored in GitHub. All three secrets must exist before deployment.

Server-side database code can read `process.env.AZURE_SQL_SERVER`,
`process.env.AZURE_SQL_DATABASE`, and `process.env.AZURE_CLIENT_ID`; Azure injects
the values at runtime. Use the managed identity's client ID, not its object ID or
the Easy Auth app registration's client ID. Keep these settings server-side,
without a `VITE_` prefix.

After changing a secret value, restart the active revision or deploy a new revision
to pick up the change. See [Azure Container Apps secrets documentation](https://learn.microsoft.com/en-us/azure/container-apps/manage-secrets).

The TypeORM data source in `src/server/db/data-source.ts` uses `mssql`/Tedious.
When `AZURE_CLIENT_ID` is set, it explicitly uses managed identity authentication
with that client ID. The driver requests tokens as it opens connections; no SQL
username, password, or manually cached access token is used. Azure/production
startup requires the client ID. The identity must be attached to the **Container
App**, granted permissions in the application database, and have network access
to the SQL server.

The Express server connects before accepting requests and closes its shared pool
during shutdown. Missing configuration or a failed connection prevents startup.
Schema synchronization and automatic migrations are disabled.

### Guests

`src/server/db/guest.ts` defines `dbo.guests`:

| TypeScript property | SQL column | SQL type | Default / requirement |
| --- | --- | --- | --- |
| `id` | `id` | `int IDENTITY` | Generated primary key |
| `name` | `name` | `nvarchar(200)` | Required |
| `email` | `email` | `nvarchar(320)` | Required; shared email addresses are allowed |
| `address` | `address` | `nvarchar(1000)` | Nullable |
| `rsvp` | `rsvp` | `bit` | `false` |
| `family` | `family` | `varchar(1000)` | Nullable foreign key to `families.family_id` |
| `teaCeremonyRsvp` | `tea_ceremony_rsvp` | `bit` | Nullable; guest's event response |
| `rehearsalDinnerRsvp` | `rehearsal_dinner_rsvp` | `bit` | Nullable; guest's event response |
| `rsvpRespondedAt` | `rsvp_responded_at` | `datetime2` | Nullable; UTC time of the latest submission |
| `songRequests` | `song_requests` | `nvarchar(1000)` | Nullable |
| `dietaryNotes` | `dietary_notes` | `nvarchar(2000)` | Nullable |

The RSVP page uses `rsvpRespondedAt` to distinguish unanswered invitations from
explicit wedding declines. Legacy `rsvp = true` values remain accepted; legacy
`false` values without a response timestamp appear unanswered. Site access is
still controlled by `ALLOWED_EMAILS`.

`GET /api/guests` returns all guests as a JSON array ordered by `id`, or `[]` when
the table is empty. Each object includes `id`, `name`, `email`, `address`, `rsvp`,
and `family`. Family invitation flags, event responses, song requests, and dietary
notes are not included in this endpoint. All authenticated users in `ALLOWED_EMAILS` can access this
endpoint, including the address field. Anonymous requests receive `401`; accounts outside the allowlist receive
`403`. Responses are not cached, and database failures return a generic `500`
JSON error.

From the signed-in client:

```ts
const response = await fetch("/api/guests");
if (!response.ok) throw new Error("Could not load guests");
const guests = await response.json();
```

`src/server/db/guest-repository.ts` exports a typed TypeORM repository backed by
the shared connection pool. Use it in server routes or services after startup has
initialized the data source. TypeORM supplies CRUD, filtering, and pagination;
add a service when a feature needs business rules spanning those operations.

```ts
import { guestRepository } from "./db/guest-repository.js";

const guest = await guestRepository.save(
  guestRepository.create({ name: "Alex", email: "alex@example.com" }),
);
const found = await guestRepository.findOneBy({ id: guest.id }); // Guest | null
const page = await guestRepository.find({ order: { id: "ASC" }, skip: 0, take: 50 });
await guestRepository.update(guest.id, { rsvp: true });
await guestRepository.delete(guest.id);
```

Validate and authorize request input before passing fields to the repository.
Use guest IDs for individual updates because multiple guests can share an email.
`create()` only constructs an object; `save()` persists it. `update()` and
`delete()` return an `affected` row count rather than throwing when no row matches.

For a transaction, obtain the repository from the transaction's entity manager so
all operations participate in that transaction:

```ts
import database from "./db/data-source.js";
import { GuestSchema } from "./db/guest.js";

await database.transaction(async (manager) => {
  const guests = manager.getRepository(GuestSchema);
  const guest = await guests.findOneByOrFail({ id: guestId });
  guest.rsvp = true;
  await guests.save(guest);
});
```

### Families and membership

`src/server/db/family.ts` defines `dbo.families`:

| TypeScript property | SQL column | SQL type | Default / requirement |
| --- | --- | --- | --- |
| `familyId` | `family_id` | `varchar(1000)` | Required primary key; supplied by the caller |
| `teaCeremonyInvited` | `tea_ceremony_invited` | `bit` | `false` |
| `rehearsalDinnerInvited` | `rehearsal_dinner_invited` | `bit` | `false` |

The requested columns are `varchar(1000)`, but actual family IDs must fit Azure
SQL's [900-byte primary/foreign key limit](https://learn.microsoft.com/en-us/sql/relational-databases/tables/primary-and-foreign-key-constraints?view=sql-server-ver17).
Use short, stable identifiers for families.

`src/server/db/family-guest.ts` defines `dbo.family_guests`, with `family_id`
(`varchar(1000)`, foreign key to `families.family_id`) and `guest_id` (`int`,
primary key and foreign key to `guests.id`). Each guest can have one membership;
multiple guests can belong to the same family. An index on `family_id` supports
looking up all members for the RSVP form. Deleting a guest deletes its
membership; deleting a referenced family is blocked.

When assigning or moving a guest, update `guests.family` and the corresponding
`family_guests` row in the same transaction. The two foreign keys check that
families exist; they do not synchronize these two representations of membership.
A guest may have `family = NULL` while awaiting assignment and should then have
no membership row. Use `manager.getRepository(FamilySchema)` and
`manager.getRepository(FamilyGuestSchema)` inside a transaction to manage these
entities. The RSVP API rejects inconsistent membership records.

The `CreateFamilies` migration preserves existing invitations by creating one
family named `guest-<id>` per existing guest and inserting its membership row
before removing the two invitation columns from `guests`. These placeholder
families can later be consolidated into actual households. Reverting copies the
current family invitation flags back to each guest, then removes family and
membership data. Unassigned guests receive `false` for both flags on revert.

### RSVP form and API

The RSVP form submits directly to the server and Azure SQL. It no longer uses
Formspree; the separate sign-in access-request feature still uses its configured
Formspree form.

`GET /api/rsvp` resolves the guest using the verified SSO email, ignoring email
case and surrounding whitespace. That email must match exactly one guest row.
Missing guests return `404`; duplicate matches, unassigned families, or
inconsistent membership records return `409` with a message to contact the hosts.
The guest's `family` identifies the family invitation, and `family_guests` supplies
the dropdown members. The response includes SSO name/email, the signed-in guest's
ID, family invitation flags, and member names and saved responses. Other members'
emails and addresses are not returned.

The signed-in guest always has a response section. The dropdown adds optional
sections for other family members. Each person answers yes/no for the wedding
and for each invited event. Hidden, uninvited events carry `null` responses;
answers for different events are independent. Saved responses load on returning
to the page, and unselected members are not changed by a submission.

**Add another guest** adds a removable section with a required name, optional
email, and the same attendance and notes fields. There is no fixed guest-count
limit (the API retains its 256 KB request-size limit). New guests inherit the
family's event invitations. Saving creates both the guest record and family
membership in the same transaction; editing saved responses reuses those records.
Optional emails must not already belong to another guest; leave an email blank
when it is shared. Adding a guest does not change the site's sign-in allowlist.

`POST /api/rsvp` accepts JSON with this shape:

```json
{
  "guests": [{
    "guestId": 1,
    "attending": true,
    "teaCeremonyRsvp": false,
    "rehearsalDinnerRsvp": null,
    "songRequests": "",
    "dietaryNotes": "No peanuts"
  }]
}
```

An optional `additionalGuests` array accepts the same attendance and notes fields,
with `additionId` (a client-generated UUID v4), `name` (up to 200 characters), and
`email` (up to 320 characters; empty when omitted) instead of `guestId`.
Successful saves return `{ "status": "saved", "addedGuests": [...] }`, where each
entry maps an `additionId` to its saved `guestId`. Keep addition IDs stable across
retries to avoid duplicate records. Family assignment always comes from the
authenticated guest (or the authorized admin's selected guest).

The example assumes a tea ceremony invitation but no rehearsal dinner invitation.
Submissions must include the signed-in guest, contain no duplicate IDs, and only
include members of that family. The server rechecks current invitation flags and
membership, requires answers for invited events, and rejects responses for
uninvited events. It updates all selected guests in one serializable transaction;
failures roll back the entire submission. Notes are limited to 1,000 characters
for songs and 2,000 for dietary restrictions. Both endpoints require an allowed
authenticated account and return responses with `Cache-Control: private, no-store`.

Apply `AddGuestRsvpResponses` and `AddRsvpGuestAdditions` before deploying this
version (`npm run build:server && npm run db:migrate`). The latter adds a nullable
addition ID with a unique filtered index for safe retries; existing guests are
unchanged. Reverting that migration removes retry IDs but preserves added guests.

`AddGuestRsvpResponses` adds the response fields.
It adds nullable response fields without changing existing family invitation
flags or guessing historical responses. Reverting it deletes the added event
responses, notes, and submission timestamps; the existing wedding `rsvp` remains.

### Admin RSVP impersonation

Set `ADMIN_EMAIL` to your exact Google/Microsoft sign-in email. Only that account
can use admin RSVP access; matching ignores case and surrounding whitespace.
Your email must also be in `ALLOWED_EMAILS`. An empty or unset `ADMIN_EMAIL`
disables admin access, and a malformed address or list of addresses prevents
startup. This setting stays on the server and is never sent to the browser.

Before deploying this change, create a Container App secret under
**Security → Secrets → Add**, using the **Container Apps Secret** type:

| Container App secret | Value | Runtime environment variable |
| --- | --- | --- |
| `admin-email` | Your own SSO email, such as `you@example.com` | `ADMIN_EMAIL` |

The deploy workflow maps `ADMIN_EMAIL=secretref:admin-email`. Create this secret
directly in Azure; the workflow does not create or overwrite it, and no GitHub
secret is needed. Deploy a new revision after creating it. When changing its
value later, restart the active revision or deploy a new one to apply the change.
See [Azure's secret reference documentation](https://learn.microsoft.com/en-us/azure/container-apps/manage-secrets).
For local development, set `ADMIN_EMAIL` in your untracked `.env` file.

On the RSVP page, the admin sees **Impersonate a guest**, searchable by name or
email. Selecting a guest opens that person's real invitation and saved answers,
with a visible impersonation notice. **Send RSVP** saves responses for the selected
guest and any chosen family members. **Stop impersonating** returns to your own
invitation. Switching guests discards unsaved edits, resets the form, and is
disabled while saving. Impersonation stays on this RSVP page and resets when
you leave or reload it; your signed-in account does not change.

`GET /api/me` includes `isAdmin`. Admin-only endpoints are
`GET /api/admin/rsvp/guests` (guest IDs, names, and emails) and
`GET`/`POST /api/admin/rsvp/:guestId`. Each request independently checks the
authenticated email against `ADMIN_EMAIL` after the site allowlist check.
Guest IDs let admins select guests who share an email, including guests outside
`ALLOWED_EMAILS`; the admin does not need an invitation of their own. The usual
family membership, invitation, validation, and atomic-save rules still apply.
Missing or inconsistent invitations still need to be corrected in the database.
Successful admin saves log the administrator email and target guest ID without
logging RSVP notes. No database migration is needed for admin access.

### Local setup and migrations

Use Node 22.13+ on the Node 22 line (the Docker image uses Node 22). Copy
`.env.example` to `.env` and set the SQL server and database. Leave `AZURE_CLIENT_ID`
empty locally, keep `NODE_ENV` unset or `development`, and run `az login` for the
database's Entra tenant. The local credential chain can use that login. Your
developer account needs a SQL database user and network access. Host Azure CLI
credentials are not automatically available inside a local Docker container.

Build the server before running database commands:

```sh
npm run build:server
npm run db:migrations:show
npm run db:migrate
```

`db:migrate` applies pending migrations (including the family schema and
invitation backfill) and records them in
`dbo.typeorm_migrations`. Run it using a developer/deployment identity with DDL
permissions and access to the migration history table. The app's runtime identity
only needs the relevant data permissions; the deploy workflow does not run
migrations. Use one migration runner at a time.

For future schema changes, edit the entity, rebuild, then generate and review a
migration against a development database before applying it:

```sh
npm run build:server
npm run db:migration:generate -- src/server/db/migrations/DescribeChange
npm run build:server
npm run db:migrate
```

`npm run db:migrate:revert` reverses the most recent migration. Reverting the
initial migration **drops the guests table and its data**.

## Source layout

- `src/client`: React application, browser utilities, styles, and assets.
- `src/server`: Express server and server tests.
- `src/shared`: Data, types, and utilities used by both client and server.

The client `@/` alias resolves to `src/client`. Production builds emit the client
to `dist` and the server and its shared modules to `server-dist`. The sign-in
client is built separately into `dist/auth`, served under `/auth`, so it does not
include private wedding code or data. Run `npm run build` before `npm start` to
build both clients and the server.

## Commands

```powershell
npm run build
npm run lint
npm run test:server
npm run start
```
