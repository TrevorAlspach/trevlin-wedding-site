# Azure Container Apps authentication setup

The server trusts `X-MS-CLIENT-PRINCIPAL` only because Azure Easy Auth strips
external copies of that header and injects its own. Never run the server with a
non-empty `ALLOWED_EMAILS` value on public ingress unless Easy Auth is enabled.

## Safe rollout order

1. Register and enable Google Easy Auth while the old Nginx image is still
   deployed. Initially choose **Require authentication** so Azure rejects or
   redirects anonymous requests.
2. Add the `guest-emails` and `openai-api-key` secrets and their environment variables.
3. Deploy the new Node-based image.
4. Confirm an allowlisted Google account succeeds and an unlisted account gets
   `403`.
5. Change Easy Auth to **Allow anonymous requests**. The new server will then show
   its provider chooser while continuing to protect every site file.
6. Add Microsoft and update `AUTH_PROVIDERS` when ready.

With an empty allowlist the application is fail-closed and denies every identity.

## 1. Configure the guest allowlist

In the Azure portal, open the Container App and add a secret named
`guest-emails`. Its value is a comma-separated list of invited email addresses:

```text
guest1@example.com,guest2@example.com,guest3@example.com
```

Then add these container environment variables:

| Name | Value |
| --- | --- |
| `ALLOWED_EMAILS` | Secret reference to `guest-emails` |
| `AUTH_PROVIDERS` | `google` initially; use `google,aad` after Microsoft is configured |
| `OPENAI_API_KEY` | Secret reference to `openai-api-key` |
| `OPENAI_MODEL` | `gpt-5.6-luna` by default; use `gpt-5.6-terra` if quality testing warrants it |

Email comparison is case-insensitive. Invalid entries make the server refuse to
start, and an empty list denies every authenticated account. Updating the secret
requires restarting the active revision so the process reloads it.

Do not put the real guest list in a GitHub variable or committed `.env` file.

## 2. Configure TaroBot

Create a GitHub Actions secret named `OPENAI_API_KEY`. The deployment workflow
copies it into the Container App secret named `openai-api-key` and exposes the
server-only `OPENAI_API_KEY` environment variable through a secret reference.
Optionally create a GitHub Actions variable named `OPENAI_MODEL`; when omitted,
the workflow uses `gpt-5.6-luna`.

Never use a `VITE_` prefix for either value. Vite embeds such variables in the
browser bundle. Rotate the OpenAI key in GitHub Actions and redeploy if the key
changes.

## 3. Enable Google authentication

Choose the hostname guests will actually use. Register both the custom hostname
and the default Azure hostname only if both should support login.

1. In Google Auth Platform, create an external web OAuth client.
2. Add the site origin, for example `https://www.example.com`.
3. Add this authorized redirect URI exactly:

   ```text
   https://www.example.com/.auth/login/google/callback
   ```

4. Request the `openid`, `email`, and `profile` scopes so Azure receives an
   explicit verified email claim.
5. In the Container App, open **Authentication**, add **Google**, and enter the
   client ID and client secret.
6. During the initial rollout, select **Require authentication**. Change this to
   **Allow anonymous requests** only after the Node gate has been deployed. The
   Node server, not React, then permits only `/login` and `/healthz` without a
   principal.

The login endpoint used by the public page is:

```text
/.auth/login/google?post_login_redirect_uri=/
```

## 4. Add Microsoft authentication

This can be done after Google is working.

1. Add a Microsoft identity provider under the Container App's Authentication
   settings.
2. Create or select an Entra app registration that accepts organizational and
   personal Microsoft accounts if both kinds of guests should be supported.
3. Add the callback URI:

   ```text
   https://www.example.com/.auth/login/aad/callback
   ```

4. Change `AUTH_PROVIDERS` to `google,aad` and restart the revision.

The Microsoft button uses:

```text
/.auth/login/aad?post_login_redirect_uri=/
```

## 5. Container App settings

- Keep ingress HTTPS-only and target port `80`.
- Use `/healthz` for HTTP startup, liveness, or readiness probes.
- After the Node gate is deployed, keep the authentication action set to **Allow
  anonymous requests**. Changing it to a provider redirect prevents the
  two-provider chooser from being shown.
- Do not add bypass paths for site assets. Authorization runs before Express
  serves every file from `dist`.

Azure Easy Auth strips externally supplied identity headers and injects its own
`X-MS-CLIENT-PRINCIPAL` header for authenticated sessions. The server decodes that
header and accepts only explicit email, UPN, or `preferred_username` claims. A
display-name claim is intentionally never used for authorization.

## 6. Verify before inviting guests

Use a private/incognito browser window for each case:

1. Open `/` while signed out: it must redirect to `/login`.
2. Request a built asset URL while signed out: it must also redirect to `/login`.
3. Sign in with an allowlisted Google account: the site must load.
4. Sign out at `/.auth/logout?post_logout_redirect_uri=/login`.
5. Sign in with an account not on the list: it must return **403 Access denied**.
6. Repeat with Microsoft after adding that provider.
7. Test the default `azurecontainerapps.io` hostname. It must enforce the same
   allowlist; if it is not intended for guests, do not register OAuth callbacks for
   it.
8. Open TaroBot and complete a real multi-turn conversation. Confirm it answers
   from the FAQ facts and admits when an answer is unavailable.

If an authenticated provider is denied because no supported email claim was
received, the application log records the provider and claim type names, but not
their values. Use that information to correct the provider's requested scopes.
