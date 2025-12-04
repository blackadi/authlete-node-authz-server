import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export const errorHandler = (
  err: Error | any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error for debugging (use request-scoped logger when available)
  const log = (req as any).logger || logger;
  log.error("Unhandled error", {
    message: err?.message || "Unknown error",
    stack: err?.stack,
    path: req.path,
    method: req.method,
  });

  // Extract status code (default to 500)
  const status = err?.status || err?.statusCode || 500;
  const message = err?.message || "Internal Server Error";
  const isDevelopment = process.env.NODE_ENV === "development";

  // Check if client wants HTML (Accept header) or API response
  if (req.accepts("html")) {
    // Render error view for HTML requests
    res.status(status).render("error", {
      title: `Error ${status}`,
      message,
      details: isDevelopment ? err?.stack : null,
    });
  } else {
    // Respond with JSON for API requests
    res.status(status).json({
      error: "Internal Server Error",
      message,
      ...(isDevelopment && { stack: err?.stack }),
    });
  }
};
