import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError, validationError } from "../utils/errors.js";

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `No route matches ${req.method} ${req.originalUrl}`
    }
  });
};

export const errorHandler = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    });
    return;
  }

  if (error instanceof ZodError) {
    const appError = validationError(error.flatten());
    res.status(appError.statusCode).json({ error: appError });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const isUniqueConflict = error.code === "P2002";
    res.status(isUniqueConflict ? 409 : 400).json({
      error: {
        code: isUniqueConflict ? "CONFLICT" : "DATABASE_ERROR",
        message: isUniqueConflict ? "A record with those values already exists" : "Database request failed",
        details: error.meta
      }
    });
    return;
  }

  const message = error instanceof Error ? error.message : "Unexpected server error";
  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message
    }
  });
};
