import { Request, Response, NextFunction } from "express";
import { RateLimitOptions } from "../types/rate-limit";

type RequestRecord = {
  count: number;
  startTime: number;
};

export const rateLimit = (
  options: RateLimitOptions
) => {
  // Isolated per middleware instance
  const requests = new Map<
    string,
    RequestRecord
  >();

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

    // First request from IP
    if (!record) {
      requests.set(ip, {
        count: 1,
        startTime: now
      });

      return next();
    }

    // Window expired -> reset counter
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

    // Increment count inside active window
    record.count++;

    // Block if limit exceeded
    if (
      record.count >
      options.maxRequests
    ) {
      return res.status(429).json({
        success: false,
        error: "Too Many Requests"
      });
    }

    return next();
  };
};