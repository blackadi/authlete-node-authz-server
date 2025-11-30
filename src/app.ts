import express from "express";
import cors from "cors";
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
import discoveryRouters from './routes/discovery.routes'
import logoutRoutes from "./routes/logout.routes";
import routesList from "./routes/routes-list.routes";

import { errorHandler } from "./middleware/errorHandler";

export const app = express();

app.use(cors({
  origin: 'http://localhost:3001' //Must match your frontend's exact origin
}));
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
const routerURL = "/api";
app.use(routerURL, routesList);
app.use(routerURL, authorizationRoutes);
app.use(routerURL, tokenRoutes);
app.use(routerURL, userinfoRoutes);
app.use(routerURL, introspectionRoutes);
app.use(routerURL, revocationRoutes);
app.use(routerURL, sessionRoutes);
app.use(routerURL, jwksRoutes);
app.use(routerURL, discoveryRouters)
app.use(routerURL, logoutRoutes);

// Error Handler
app.use(errorHandler);

export default app;