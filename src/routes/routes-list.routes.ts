import { Router } from "express";

const router = Router();

const ROUTES: { method: string; path: string; description?: string }[] = [
  { method: "GET", path: "/authorization", description: "Authorization endpoint (GET)" },
//   { method: "POST", path: "/authorization", description: "Authorization endpoint (POST)" },
  { method: "POST", path: "/token", description: "Token endpoint" },
  { method: "POST", path: "/userinfo", description: "UserInfo (POST)" },
  { method: "POST", path: "/introspection", description: "Introspection endpoint" },
  { method: "POST", path: "/revocation", description: "Revocation endpoint" },
  { method: "GET", path: "/session/login", description: "Login page" },
  { method: "POST", path: "/session/login", description: "Login submission" },
  { method: "GET", path: "/session/consent", description: "Consent page" },
  { method: "POST", path: "/session/consent", description: "Consent submission" },
  { method: "GET", path: "/.well-known/jwks", description: "JWKS" },
  { method: "GET", path: "/logout", description: "RP-initiated logout (front-channel redirect)" },
  { method: "POST", path: "/backchannel_logout", description: "OP-initiated backchannel logout" },
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
  res.json({ base, routes: ROUTES });
});

export default router;
