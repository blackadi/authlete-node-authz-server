# Authlete Node Authorization Server (Example)

A small example OAuth 2.0 / OpenID Connect authorization server built with Express and Authlete SDK. This project demonstrates the authorization, token, userinfo, introspection and revocation endpoints and includes simple session-based login and consent pages for interactive flows.

This repository is intended as a learning/demo server — it is not production hardened. Use it to explore the HTTP endpoints and how an OAuth2 flow can be implemented using Authlete APIs.

## Features

- Authorization endpoint (GET/POST)
- Token endpoint (POST, accepts JSON and form-encoded payloads)
- UserInfo endpoint (POST)
- Introspection and Revocation endpoints (POST)
- OpenID Connect Discovery (`.well-known/openid-configuration`)
- JWKS endpoint (JSON Web Key Set)
- Session-based login and consent UI (server-side rendered with EJS)
- Interactive routes listing UI with curl examples
- RP-initiated and backchannel logout
- Structured logging with request tracking (Winston + Morgan + request-id)

## Prerequisites

- Node.js 18+ (or latest stable)
- npm
- An Authlete account and service configured (optional if you want to call Authlete APIs)

## Quick Start

### Demo Link

- **[NodeJS Authorization Server](https://authlete-node-authz-server.onrender.com/)**

  ![A screenshot of live demo](images/Screenshot_10.png)

### Local run

1. Install dependencies

```bash
npm --prefix server install && npm --prefix client install
```

2. Create a `.env` file in the project root or set environment variables. Minimal example `.env`:

```text
# Authlete Configuration
AUTHLETE_BEARER_TOKEN=your_authlete_bearer_token_here
AUTHLETE_BASE_URL=https://{region}.authlete.com  # example: https://us.authlete.com
AUTHLETE_SERVICE_ID=your_authlete_service_id_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Session Configuration
SESSION_SECRET=your_session_secret_here

# If ACCESS_TOKEN_TYPE=jwt:
JWT_PUBLIC_KEY_PEM="-----BEGIN PUBLIC KEY-----\nMFkw......\n-----END PUBLIC KEY-----\n"
JWT_PRIVATE_KEY_PEM="-----BEGIN PRIVATE KEY-----\nMEE......\n-----END PRIVATE KEY-----\n"
JWT_SELF_SIGNED_CERT_PEM="-----BEGIN CERTIFICATE-----\nMII......\n-----END CERTIFICATE-----\n"
JWT_ISSUER= #https://example.test/

# JWKS URI
JWKS_URI= #jwks URI


# Logging (optional)
LOG_LEVEL=debug           # debug, info, warn, error
MORGAN_FORMAT=combined    # combined, short, dev, etc.
```

3. Start the server in development mode

```bash
npm --prefix server run dev
```

The server listens on port `3000` by default (configurable via `PORT` env var). Open `http://localhost:3000/api/routes` to see the available routes and example curl commands.

## File Structure

```
src/
├── app.ts                      # Express app setup (middleware, routes, error handling)
├── server.ts                   # Entry point
├── config/
│   ├── app.config.ts          # App configuration
│   └── authlete.config.ts      # Authlete SDK setup
├── controllers/                # Request handlers for each endpoint
│   ├── authorization-response.controller.ts
│   ├── authorization-response.handler.ts # Shared Authlete response handler
│   ├── authorization.controller.ts
│   ├── token-exchange-response.handler.ts # Shared Authlete response handler
│   ├── token-fail-response.handler.ts # Shared Authlete response handler
│   ├── token-fail.controller.ts
│   ├── token-issue-response.handler.ts # Shared Authlete response handler
│   ├── token-issue.controller.ts
│   ├── token.controller.ts
│   ├── token.management.controller.ts
│   ├── session.controller.ts   # Login/consent handlers
│   ├── userinfo.controller.ts
│   ├── revocation.controller.ts
│   ├── introspection-standard.controller.ts
│   ├── introspection.controller.ts
│   ├── discovery.controller.ts
│   ├── userinfo-issue-response.handler.ts # Shared Authlete response handler
│   ├── jwks.controller.ts
│   ├── logout.controller.ts
│   ├── userinfo-issue.controller.ts
│   └── authorization-response.handler.ts  # Shared Authlete response handler
├── middleware/
│   ├── session.ts              	# express-session configuration
│   └── errorHandler.ts         	# Global error handler (renders HTML/JSON)
├── routes/                     	# Route definitions
├── services/                   	# Authlete API calls and business logic
├── utils/
createLocalJWT.ts
│   ├── logger.ts              		# Winston logger configuration
│   ├── crypto.ts              		# PKCE helpers
│   └── jwksClient.ts          		# JWKS generator utilities
│   └── jwtAssertionValidator.ts	# JWKS generator utilities
│   └── createLocalJWT.ts			# JWT generator utilities
├── types/
│   ├── express.d.ts           		# Express Request augmentation (req.id, req.logger)
│   └── express-session.d.ts   		# Session data typing
└── views/                     		# EJS templates
	├── index.ejs
	├── login.ejs
    ├── consent.ejs
    ├── logout.ejs
    ├── error.ejs
    ├── routes.ejs
    └── partials/head.ejs
```

## Views & Templates

The server uses **EJS** for server-side rendering:

- `index.ejs` — Default page
- `login.ejs` — Sign-in form for the interactive authorization flow
- `consent.ejs` — Consent page showing requested scopes with approve/deny actions
- `error.ejs` — Error page (shown for HTTP errors)
- `logout.ejs` — Logout confirmation page
- `routes.ejs` — Interactive routes listing with curl examples
- `partials/head.ejs` — Shared styles and head content

## Logging

The server uses **Winston** for structured application logging and **Morgan** for HTTP access logs.

**Log files:**

- `logs/app-YYYY-MM-DD.log` — Application logs (info and above)
- `logs/error-YYYY-MM-DD.log` — Error logs (daily rotation, 30-day retention)

**Console output:**

- Development: colorized, human-readable format
- Production: JSON format with timestamps

Each request is assigned a unique ID via `express-request-id` middleware, which is included in all logs for easy tracing. Use `LOG_LEVEL` env var to control verbosity (default: `debug` in development, `info` in production).

## Current Routes

The server exposes the following endpoints:

| Method | Path                                    | Description                          |
| ------ | --------------------------------------- | ------------------------------------ |
| GET    | `/api/authorization`                    | Authorization endpoint (interactive) |
| POST   | `/api/token`                            | Token endpoint                       |
| POST   | `/api/userinfo`                         | UserInfo endpoint                    |
| POST   | `/api/introspection`                    | Token introspection                  |
| POST   | `/api/introspection/standard`           | Token introspection (RFC 7662)       |
| POST   | `/api/revocation`                       | Token revocation                     |
| GET    | `/api/session/login`                    | Login page                           |
| POST   | `/api/session/login`                    | Login submission                     |
| GET    | `/api/session/consent`                  | Consent page                         |
| POST   | `/api/session/consent`                  | Consent submission                   |
| GET    | `/api/.well-known/jwks.json`            | JSON Web Key Set                     |
| GET    | `/api/.well-known/openid-configuration` | OpenID Configuration                 |
| GET    | `/api/token/list`                       | Token Operations Endpoint            |
| POST   | `/api/token/create`                     | Token Operations Endpoint            |
| PATCH  | `/api/token/update`                     | Token Operations Endpoint            |
| DELETE | `/api/token/delete`                     | Token Operations Endpoint            |
| POST   | `/api/token/revoke`                     | Token Operations Endpoint            |
| POST   | `/api/token/reissue`                    | Token Operations Endpoint            |
| GET    | `/api/logout`                           | RP-initiated logout                  |
| POST   | `/api/backchannel_logout`               | Backchannel logout                   |
| GET    | `/api/routes`                           | Routes listing UI                    |
| GET    | `/api/routes.json`                      | Routes as JSON                       |

## Example OAuth 2.0 flows (curl)

These examples assume the server is running on `http://localhost:3000` and that you are driving the flow from a client application. Replace client IDs, secrets, and codes with real values from your environment.

1. Authorization Code (interactive)

- Step A: The client directs the user-agent to the authorization endpoint. Example (open in browser):

```
http://localhost:3000/authorization?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000/callback&scope=openid%20profile%20email&state=xyz
```

- Step B: The server will show login (`/session/login`) and consent (`/session/consent`) pages. After the user approves, the server will redirect back to the client's `redirect_uri` with `code` and `state`.

- Step C: Exchange code for token (server-to-server call):

Form-encoded example:

```bash
curl -X POST http://localhost:3000/api/token \
	-H "Content-Type: application/x-www-form-urlencoded" \
	-H "Authorization: Basic BASE64(client_id:client_secret)" \
	-d "grant_type=authorization_code" \
	-d "code=AUTHORIZATION_CODE" \
	-d "redirect_uri=http://localhost:3000/callback"
```

JSON example (application/json):

```bash
curl -X POST http://localhost:3000/api/token \
	-H "Content-Type: application/json" \
	-d '{
		"grant_type":"authorization_code",
		"code":"0iRBC1hfoRDkKPQZagUX-N4PuypeQWhrGIeArW-VUlk",
		"redirect_uri":"http://localhost:3000",
		"code_verifier":"186c6529dc72785ed16bb7336a99ae23b22dce64a5def65ebf57c1ab",
		"clientId":"3322138582"
	}'
```

2. Resource Owner Password Credentials (for testing only)

```bash
curl -X POST http://localhost:3000/api/token \
	-H "Content-Type: application/x-www-form-urlencoded" \
	-d "grant_type=password" \
	-d "username=admin" \
	-d "password=password" \
	-d "scope=openid profile" \
	-d "client_id=***" \
	-d "client_secret=****"
```

```bash
curl -X POST http://localhost:3000/api/token \
-H 'Authorization: Basic BASE64(client_id:client_secret)' \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'grant_type=password&response_type=token&username=admin&password=password&scope=email'
```

3. Introspection

```bash
curl -X POST http://localhost:3000/api/introspection \
	-H "Content-Type: application/x-www-form-urlencoded" \
	-H "Authorization: Basic BASE64(client_id:client_secret)" \
	-d "token=ACCESS_OR_REFRESH_TOKEN"
```

```bash
curl -X POST http://localhost:3000/api/introspection \
	-H "Content-Type: application/x-www-form-urlencoded" \
	-H "Authorization: Basic BASE64(client_id:client_secret)" \
	-d "token=ACCESS_OR_REFRESH_TOKEN"
```

4. Revocation

```bash
curl -X POST http://localhost:3000/api/revocation \
	-H "Content-Type: application/x-www-form-urlencoded" \
	-H "Authorization: Basic BASE64(client_id:client_secret)" \
	-d "token=ACCESS_OR_REFRESH_TOKEN"
```

5. UserInfo

```bash
curl -X POST http://localhost:3000/api/userinfo \
	-H "Content-Type: application/json" \
    -d '{"token":"YOUR_ACCESS_TOKEN"}'
```

## Session Handling

The project uses `express-session` to store login/authorization context across interactive steps:

- User login state (`req.session.user`)
- OAuth authorization details (`req.session.authorization` with ticket, clientId, scopes, etc.)
- Custom session options via environment or factory configuration

**For development:** In-memory session store (default).
**For production:** Replace with a persistent store like Redis or MongoDB to support multi-process deployments.

See `src/middleware/session.ts` for configuration details.

## Error Handling

The global error handler (`src/middleware/errorHandler.ts`):

- Renders user-friendly HTML error pages (with stack traces in development)
- Returns JSON for API requests (Accept header detection)
- Logs all errors with request context via structured logger

## Development Tips

- Open `http://localhost:3000/api/routes` to see interactive routes listing and copy-paste curl examples
- Check `logs/` directory for application and error logs (automatically rotated daily)
- Use `LOG_LEVEL=debug` env var to see verbose debug output
- Monitor `req.logger` output in services/controllers for request-specific tracing (includes request ID)

## License & Disclaimer

This example is provided for educational purposes. It is not production-ready and omits many security best practices (CSRF protection, input validation, secure cookie settings for production, etc.).

## Roadmap

1. Dockerfile for containerized deployment
2. Automated tests (unit and integration)
3. Persistent session store integration (Redis)
4. Enhanced CSRF/CORS protection
5. Admin dashboard for service management

## Testing with OAuth Tools

- Go to **[OAuth Tools](https://oauth.tools/)**
- Use **Curity Playground**, which provides a UI to test OAuth 2.0 flows with the demo server.
- Either enter the demo server metadata manually or fetch it automatically from the Curity Playground settings (as shown in the screenshots).
- Start testing the flows.

  ![A screenshot of UI](images/Screenshot_6.png)
  ![A screenshot of UI](images/Screenshot_7.png)
  ![A screenshot of UI](images/Screenshot_8.png)

## Testing with Demo REACT client

This project contains a React SPA that plays a role as OAuth 2.0 client (Authorization Code Flow with PKCE using Public Client Type).

inside the CLIENT Directory

```bash
cd /client
cp .env.example .env

npm install
npm run build
npm run preview
```

Root Directory

```bash
npm --prefix client install
npm --prefix client run build
npm --prefix client run preview
```

The SPA will run on http://localhost:3001

![A screenshot of the homepage](images/Screenshot_1.png)
![A screenshot of the login](images/Screenshot_2.png)
![A screenshot of the consent](images/Screenshot_3.png)
![A screenshot of the callback](images/Screenshot_4.png)
![A screenshot of the decoded token](images/Screenshot_5.png)
