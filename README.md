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
| `teaCeremonyInvited` | `tea_ceremony_invited` | `bit` | `false` |
| `rehearsalDinnerInvited` | `rehearsal_dinner_invited` | `bit` | `false` |

The boolean RSVP does not distinguish an unanswered invitation from a decline.
This is database boilerplate: existing RSVP screens and `ALLOWED_EMAILS`
authorization are not yet connected to the guests table.

`GET /api/guests` returns all guests as a JSON array ordered by `id`, or `[]` when
the table is empty. Each object includes `id`, `name`, `email`, `address`, `rsvp`,
`teaCeremonyInvited`, and `rehearsalDinnerInvited`. All authenticated users in
`ALLOWED_EMAILS` can access this endpoint, including the address and invitation
fields. Anonymous requests receive `401`; accounts outside the allowlist receive
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

`db:migrate` creates the guests table and records the migration in
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
