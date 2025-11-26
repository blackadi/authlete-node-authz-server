import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { sessionMiddleware } from "./middleware/session";

import authorizationRoutes from "./routes/authorization.routes";
import tokenRoutes from "./routes/token.routes";
import userinfoRoutes from "./routes/userinfo.routes";
import introspectionRoutes from "./routes/introspection.routes";
import revocationRoutes from "./routes/revocation.routes";
import sessionRoutes from "./routes/session.routes";
import jwksRoutes from "./routes/jwks.routes";
import logoutRoutes from "./routes/logout.routes";
import routesList from "./routes/routes-list.routes";

import { errorHandler } from "./middleware/errorHandler";

export const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  sessionMiddleware({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: true
  })
);

// Routes
app.use("/", routesList);
app.use("/", authorizationRoutes);
app.use("/", tokenRoutes);
app.use("/", userinfoRoutes);
app.use("/", introspectionRoutes);
app.use("/", revocationRoutes);
app.use("/", sessionRoutes);
app.use("/", jwksRoutes);
app.use("/", logoutRoutes);

// Error Handler
app.use(errorHandler);

export default app;