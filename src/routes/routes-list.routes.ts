import { Router } from "express";

const router = Router();

const ROUTES: { method: string; path: string; description?: string }[] = [
  { method: "GET", path: "/authorization", description: "Authorization endpoint (GET)" },
  { method: "POST", path: "/authorization", description: "Authorization endpoint (POST)" },
  { method: "POST", path: "/token", description: "Token endpoint" },
  { method: "GET", path: "/userinfo", description: "UserInfo (GET)" },
  { method: "POST", path: "/userinfo", description: "UserInfo (POST)" },
  { method: "POST", path: "/introspection", description: "Introspection endpoint" },
  { method: "POST", path: "/revocation", description: "Revocation endpoint" },
  { method: "GET", path: "/session/login", description: "Login page" },
  { method: "POST", path: "/session/login", description: "Login submission" },
  { method: "GET", path: "/session/consent", description: "Consent page" },
  { method: "POST", path: "/session/consent", description: "Consent submission" },
  { method: "GET", path: "/.well-known/jwks.json", description: "JWKS" },
  { method: "GET", path: "/logout", description: "RP-initiated logout (front-channel redirect)" },
  { method: "POST", path: "/backchannel_logout", description: "OP-initiated backchannel logout" },
  { method: "GET", path: "/routes", description: "This routes listing page" },
];

router.get("/routes", (req, res) => {
  const proto = req.protocol;
  const host = req.get("host") || "localhost";
  const base = `${proto}://${host}`;

  const rows = ROUTES.map((r) => {
    const full = `${base}${r.path}`;
    if (r.method === "GET") {
      return `
        <li>
          <strong>${r.method}</strong>: <a href="${full}">${r.path}</a>
          <small> - ${r.description ?? ""}</small>
        </li>`;
    }
    return `
      <li>
        <strong>${r.method}</strong>: <code>${r.path}</code>
        <small> - ${r.description ?? ""}</small>
        <div><em>Call with:</em> <code>curl -X ${r.method} ${full}</code></div>
      </li>`;
  }).join("\n");

  const html = `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Available Routes</title>
    <style>body{font-family:Arial,Helvetica,sans-serif;margin:20px}li{margin:10px 0}</style>
  </head>
  <body>
    <h1>Available Routes</h1>
    <p>Base URL: <code>${base}</code></p>
    <ul>
      ${rows}
    </ul>
    <p>Click GET links to open in your browser. Use the shown curl commands for POST endpoints.</p>
  </body>
  </html>
  `;

  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

export default router;
