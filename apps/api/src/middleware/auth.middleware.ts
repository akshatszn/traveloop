import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { prisma } from "../lib/prisma.js";
import { unauthorized } from "../utils/errors.js";

type JwtPayload = {
  sub: string;
  email: string;
};

export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const header = req.header("authorization");
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

    if (!token) {
      throw unauthorized();
    }

    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, avatarUrl: true }
    });

    if (!user) {
      throw unauthorized("Your session is no longer valid");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error instanceof Error && error.name === "JsonWebTokenError" ? unauthorized("Invalid token") : error);
  }
};
