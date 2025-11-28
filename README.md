# Authlete Node Authorization Server (Example)

A small example OAuth 2.0 / OpenID Connect authorization server built with Express and Authlete SDK. This project demonstrates the authorization, token, userinfo, introspection and revocation endpoints and includes simple session-based login and consent pages for interactive flows.

This repository is intended as a learning/demo server — it is not production hardened. Use it to explore the HTTP endpoints and how an OAuth2 flow can be implemented using Authlete APIs.

## Features
- Authorization endpoint (GET/POST)
- Token endpoint (POST)
- UserInfo endpoint (GET/POST)
- Introspection and Revocation endpoints (POST)
- Session-based login and consent UI (minimal views in `src/views`)
- Simple routes listing UI at `/routes`

## Prerequisites
- Node.js 18+ (or latest stable)
- npm
- An Authlete account and service configured (optional if you want to call Authlete APIs)

## Quick start

1. Install dependencies

```bash
npm install
```

2. Create a `.env` file in the project root or set environment variables. Minimal example `.env`:

```text
SESSION_SECRET=your_session_secret
AUTHLETE_BASE_URL=https://api.authlete.com
AUTHLETE_API_KEY=your_api_key
AUTHLETE_API_SECRET=your_api_secret
SERVICE_ID=1234567
NODE_ENV=development
```

3. Start in development mode

```bash
npm run dev
```

By default the app listens on the port configured in `src/server.ts` (commonly `3000`). Open `http://localhost:3000/routes` to see the available routes and example curl commands.

## Views
- `src/views/login.html` — simple sign-in form used by the interactive authorization flow.
- `src/views/consent.html` — consent page showing scopes and approve/deny actions.
- `src/views/routes.html` — route listing UI.

## Current routes
The server exposes the following endpoints (mounted at the server root):

- `GET  /authorization` — Authorization endpoint (interactive GET)
- `POST /token` — Token endpoint (accepts form-encoded or JSON payloads)
- `POST /userinfo` — UserInfo endpoint (POST)
- `POST /introspection` — Introspection endpoint
- `POST /revocation` — Revocation endpoint
- `GET  /login` — Login page (view)
- `POST /login` — Login submission
- `GET  /consent` — Consent page (view)
- `POST /consent` — Consent submission
- `GET  /.well-known/jwks` — JWKS
- `GET  /logout` — RP-initiated logout (front-channel redirect)
- `POST /backchannel_logout` — OP-initiated backchannel logout
- `GET  /routes` — Routes listing UI (HTML)
- `GET  /routes.json` — JSON list of routes used by `/routes`


## Example OAuth 2.0 flows (curl)

These examples assume the server is running on `http://localhost:3000` and that you are driving the flow from a client application. Replace client IDs, secrets, and codes with real values from your environment.

1) Authorization Code (interactive)

- Step A: The client directs the user-agent to the authorization endpoint. Example (open in browser):

```
http://localhost:3000/authorization?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000/callback&scope=openid%20profile%20email&state=xyz
```

- Step B: The server will show login (`/session/login`) and consent (`/session/consent`) pages. After the user approves, the server will redirect back to the client's `redirect_uri` with `code` and `state`.

- Step C: Exchange code for token (server-to-server call):

Form-encoded example:

```bash
curl -X POST http://localhost:3000/token \
	-H "Content-Type: application/x-www-form-urlencoded" \
	-H "Authorization: Basic BASE64(client_id:client_secret)" \
	-d "grant_type=authorization_code" \
	-d "code=AUTHORIZATION_CODE" \
	-d "redirect_uri=http://localhost:3000/callback"
```

JSON example (application/json):

```bash
curl -X POST http://localhost:3000/token \
	-H "Content-Type: application/json" \
	-d '{
		"grant_type":"authorization_code",
		"code":"0iRBC1hfoRDkKPQZagUX-N4PuypeQWhrGIeArW-VUlk",
		"redirect_uri":"http://localhost:3000",
		"code_verifier":"186c6529dc72785ed16bb7336a99ae23b22dce64a5def65ebf57c1ab",
		"clientId":"3322138582"
	}'
```

2) Resource Owner Password Credentials (for testing only)

```bash
curl -X POST http://localhost:3000/token \
	-H "Content-Type: application/x-www-form-urlencoded" \
	-d "grant_type=password" \
	-d "username=alice" \
	-d "password=alice_password" \
	-d "scope=openid profile"
```

3) Introspection

```bash
curl -X POST http://localhost:3000/introspection \
	-H "Content-Type: application/x-www-form-urlencoded" \
	-H "Authorization: Basic BASE64(client_id:client_secret)" \
	-d "token=ACCESS_OR_REFRESH_TOKEN"
```

4) Revocation

```bash
curl -X POST http://localhost:3000/revocation \
	-H "Content-Type: application/x-www-form-urlencoded" \
	-H "Authorization: Basic BASE64(client_id:client_secret)" \
	-d "token=ACCESS_OR_REFRESH_TOKEN"
```

5) UserInfo

```bash
curl -X POST http://localhost:3000/userinfo \
	-H "Content-Type: application/json" \
    -d '{"token":"YOUR_ACCESS_TOKEN"}'
```

## Development tips
- Open `http://localhost:3000/routes` to see clickable GET endpoints and curl snippets for POST endpoints.
- The server logs incoming requests and request bodies which helps with debugging.

