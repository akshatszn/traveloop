import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { activityRoutes } from "./routes/activity.routes.js";
import { aiRoutes } from "./routes/ai.routes.js";
import { authRoutes } from "./routes/auth.routes.js";
import { dashboardRoutes } from "./routes/dashboard.routes.js";
import { publicRoutes } from "./routes/public.routes.js";
import { tripRoutes } from "./routes/trip.routes.js";
import { requireAuth } from "./middleware/auth.middleware.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

export const app = express();

app.disable("x-powered-by");
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(
  cors({
    origin: env.WEB_ORIGIN,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 80,
  standardHeaders: "draft-7",
  legacyHeaders: false
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "traveloop-api" });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/dashboard", requireAuth, dashboardRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/activities", requireAuth, activityRoutes);
app.use("/api/public", publicRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
