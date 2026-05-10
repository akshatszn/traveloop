import { Router } from "express";
import { authService } from "../services/auth.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const authRoutes = Router();

authRoutes.post(
  "/register",
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const session = await authService.register(req.body);
    res.status(201).json(session);
  })
);

authRoutes.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const session = await authService.login(req.body);
    res.json(session);
  })
);

authRoutes.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await authService.me(req.user!.id);
    res.json({ user });
  })
);
