import { Request, Response, NextFunction } from "express";
import { RateLimitOptions } from "../types/rate-limit";

type RequestRecord = {
  count: number;
  startTime: number;
};

const requests = new Map<string, RequestRecord>();

export const rateLimit = (
  options: RateLimitOptions
) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const ip =
      req.ip ||
      req.socket.remoteAddress ||
      "unknown";

    const now = Date.now();

    const record = requests.get(ip);

    if (!record) {
      requests.set(ip, {
        count: 1,
        startTime: now
      });

      return next();
    }

    if (
      now - record.startTime >
      options.windowMs
    ) {
      requests.set(ip, {
        count: 1,
        startTime: now
      });

      return next();
    }

    record.count++;

    if (
      record.count >
      options.maxRequests
    ) {
      return res.status(429).json({
        success: false,
        error: "Too Many Requests"
      });
    }

    next();
  };
};