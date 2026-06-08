● Yep — that's just swapping the login method in the same Cloudflare Access setup. Instead of (or in addition to) the emailed code, you let guests click "Sign in 
  with Google" (and/or Microsoft, Apple, Facebook). Cloudflare calls these identity providers (IdPs), and it supports Google, Microsoft Entra, Apple, Facebook,
  GitHub, LinkedIn, plus generic SAML/OIDC.

  Parts 1 (DNS → orange cloud + SSL Full) and the Access application are identical to before. The only change is you add an IdP and point the policy at it. For
  wedding guests, Google covers the vast majority. Here's the delta:

  Add Google as a login method

  This is the one part with real setup — you register an OAuth app with Google once, then paste two values into Cloudflare.

  In Google Cloud Console:
  1. Create/select a project → APIs & Services → OAuth consent screen → User type External → fill app name (Trevlin Wedding) + your support email → add scopes
  openid, email, profile → publish.
  2. Credentials → Create credentials → OAuth client ID → Web application.
  3. Authorized redirect URI (this is the bit people miss):
  https://<your-team-name>.cloudflareaccess.com/cdn-cgi/access/callback
  3. (<your-team-name> is what you picked in Zero Trust.)
  4. Copy the Client ID and Client Secret.

  In Cloudflare Zero Trust:
  5. Settings → Authentication → Login methods → Add new → Google → paste Client ID + Secret → Save → click Test (it'll do a real Google login round-trip).

  Point the policy at it

  6. In your Wedding Site Access app, the policy stays Allow + your guest email allowlist — the IdP just verifies who they are. So: guest clicks "Sign in with
  Google" → Google hands Cloudflare their verified email → Access checks it against your list → in. No code to type, and the email can't be faked.

  Recommendation: enable Google + keep One-time PIN as fallback

  Not every guest has Google (older relatives, etc.). If you enable both login methods, Cloudflare shows a chooser: "Sign in with Google" or "Send me a code." The
  allowlist applies either way, so a guest on the list gets in regardless of method. Best of both — slick for most, no one locked out.

  Trade-off to know: SSO is smoother and gives you verified identities, but the Google OAuth app registration is ~10 minutes of one-time fiddling (consent screen
  especially). OTP needs none of that. Enabling both gets you the SSO experience without the lock-out risk, so that's what I'd do.

  ---
  This doesn't change my side of the work — I still verify the DNS/TLS/gate behavior once you flip things. Want to start with Part 1 (orange-cloud www + SSL mode
  Full), and set up the Google IdP after the proxy's confirmed healthy?