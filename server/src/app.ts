import express from "express";
import path from "path";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { sessionMiddleware } from "./middleware/session";
import requestId from "express-request-id";
import morgan from "morgan";
import logger from "./utils/logger";

import authorizationRoutes from "./routes/authorization.routes";
import tokenRoutes from "./routes/token.routes";
import userinfoRoutes from "./routes/userinfo.routes";
import introspectionRoutes from "./routes/introspection.routes";
import revocationRoutes from "./routes/revocation.routes";
import sessionRoutes from "./routes/session.routes";
import jwksRoutes from "./routes/jwks.routes";
import discoveryRoutes from "./routes/discovery.routes";
import logoutRoutes from "./routes/logout.routes";
import routesList from "./routes/routes-list.routes";
import DefaultRoutes from "./routes/default.routes";

import { server } from "./config/app.config";
import { errorHandler } from "./middleware/errorHandler";

export const app = express();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "..", "public")));

app.use(cors());
// request id middleware (adds `req.id`)
app.use(requestId());

// attach a per-request logger (req.logger)
app.use((req, _res, next) => {
  // create a child logger with request id
  req.logger = logger.child ? logger.child({ reqId: req.id }) : logger;
  next();
});

// HTTP access logging with morgan, streaming into Winston
app.use(
  morgan(server.morganFormat, {
    stream: { write: (msg: string) => logger(msg.trim()) },
  })
);
// Capture the raw request body for application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    extended: true,
    verify: (req: any, _res, buf: Buffer, encoding: string) => {
      const ct = (req.headers && req.headers["content-type"]) || "";
      if (
        typeof ct === "string" &&
        ct.indexOf("application/x-www-form-urlencoded") !== -1
      ) {
        req.rawBody = buf.toString((encoding as BufferEncoding) || "utf8");
      }
    },
  })
);
app.use(bodyParser.json());
app.set("trust proxy", 1); // Trust Render's proxy
app.use(cookieParser());
app.use(
  sessionMiddleware({
    secret: server.sessionSecret,
    resave: false,
    saveUninitialized: false,
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
app.use(routerURL, discoveryRoutes);
app.use(routerURL, logoutRoutes);
app.use("/", DefaultRoutes); // For rendering the index page at root /*

// Error Handler
app.use(errorHandler);

export default app;
