import { Request, Response, NextFunction } from "express";

type ThreatRecord = {
  rateLimitViolations: number;
  payloadViolations: number;
};

const threatMap = new Map<
  string,
  ThreatRecord
>();

export const threatDetector = () => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    res.on("finish", () => {
      const ip =
        req.ip ||
        req.socket.remoteAddress ||
        "unknown";

      if (!threatMap.has(ip)) {
        threatMap.set(ip, {
          rateLimitViolations: 0,
          payloadViolations: 0
        });
      }

      const record =
        threatMap.get(ip)!;

      if (res.statusCode === 429) {
        record.rateLimitViolations++;
      }

      if (res.statusCode === 413) {
        record.payloadViolations++;
      }

      if (
        record.rateLimitViolations >= 3
      ) {
        console.warn(
          `[THREAT] BRUTE_FORCE | ${ip}`
        );
      }

      if (
        record.payloadViolations >= 3
      ) {
        console.warn(
          `[THREAT] PAYLOAD_ATTACK | ${ip}`
        );
      }
    });

    next();
  };
};