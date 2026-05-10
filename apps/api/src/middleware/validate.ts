import type { NextFunction, Request, Response } from "express";
import type { AnyZodObject } from "zod";
import { validationError } from "../utils/errors.js";

export const validate =
  (schema: AnyZodObject) => (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (!parsed.success) {
      next(validationError(parsed.error.flatten()));
      return;
    }

    req.body = parsed.data.body ?? req.body;
    req.query = parsed.data.query ?? req.query;
    req.params = parsed.data.params ?? req.params;
    next();
  };
