import { ZodType } from "zod";
import { Request, Response, NextFunction } from "express";

interface ParsedRequest {
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
  params?: Record<string, unknown>;
}

export const validate =
  (schema: ZodType<unknown>) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as ParsedRequest;

      // Apply parsed values back to request (includes defaults)
      if (parsed.body) req.body = parsed.body;
      if (parsed.query) Object.assign(req.query, parsed.query);
      if (parsed.params) Object.assign(req.params, parsed.params);

      next();
    } catch (error) {
      next(error);
    }
  };
