import { Router } from "express";

const router = Router();

const ROUTES: { method: string; path: string; description?: string }[] = [
  { method: "GET", path: "/api/authorization", description: "Authorization endpoint (GET)" },
//   { method: "POST", path: "/api/authorization", description: "Authorization endpoint (POST)" },
  { method: "POST", path: "/api/token", description: "Token endpoint" },
  { method: "POST", path: "/api/userinfo", description: "UserInfo (POST)" },
  { method: "POST", path: "/api/introspection", description: "Introspection endpoint" },
  { method: "POST", path: "/api/revocation", description: "Revocation endpoint" },
  { method: "GET", path: "/api/session/login", description: "Login page" },
  { method: "POST", path: "/api/session/login", description: "Login submission" },
  { method: "GET", path: "/api/session/consent", description: "Consent page" },
  { method: "POST", path: "/api/session/consent", description: "Consent submission" },
  { method: "GET", path: "/api/.well-known/jwks.json", description: "JWKS" },
  { method: "GET", path: "/api/.well-known/openid-configuration", description: "OpenID Configuration" },
  { method: "GET", path: "/api/logout", description: "RP-initiated logout (front-channel redirect)" },
  { method: "POST", path: "/api/backchannel_logout", description: "OP-initiated backchannel logout" },
];

// Serve static HTML view from src/views
router.get("/routes", (req, res) => {
  res.sendFile("routes.html", { root: "src/views" });
});

// Provide a JSON endpoint the client-side view can fetch
router.get("/routes.json", (req, res) => {
  const proto = req.protocol;
  const host = req.get("host") || "localhost";
  const base = `${proto}://${host}`;
  console.log(base);
  res.json({ base, routes: ROUTES });
});

export default router;
