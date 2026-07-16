## Wedding site

The production container uses Azure Container Apps Easy Auth for authentication and
checks each authenticated email address against `ALLOWED_EMAILS` before serving the
Vite application or any static asset.

See [azure-auth-setup.md](azure-auth-setup.md) for the Azure and OAuth provider setup.

## Run with Docker

From the project root:

```powershell
docker build -t trevlin-wedding-site .
docker run --rm -p 8080:80 `
  -e ALLOWED_EMAILS="guest@example.com" `
  -e AUTH_PROVIDERS="google,aad" `
  -e OPENAI_API_KEY `
  -e OPENAI_MODEL="gpt-5.6-luna" `
  --name trevlin-wedding-site trevlin-wedding-site
```

Azure Easy Auth supplies the trusted `X-MS-CLIENT-PRINCIPAL` header in production.
Anonymous local requests redirect to `/login`; use `npm run test:server` to exercise
the authenticated request paths with simulated Easy Auth headers.

For a non-container local build, copy `.env.example` to `.env`, add your local
`OPENAI_API_KEY`, and keep that file untracked. `npm start` loads it when present.
The browser always calls the same-origin `/api/chat` endpoint; no API key or
`VITE_`-prefixed chat configuration is exposed to the frontend.

## Commands

```powershell
npm run build
npm run lint
npm run test:server
npm run start
```
