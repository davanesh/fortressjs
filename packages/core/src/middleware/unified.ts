import { Request, Response, NextFunction } from "express";
import { logger } from "./logger";
import { headers } from "./headers";
import { requestLimit } from "./request-limit";
import { rateLimit } from "./rate-limit";
import { threatDetector } from "./threat-detector";
import { HeaderOptions } from "../types/security";
import { RateLimitOptions } from "../types/rate-limit";
import { RequestLimitOptions } from "../types/request-limit";
import { ThreatDetectorOptions } from "../types/threat";

export interface UnifiedFortressOptions {
  // Toggle flags
  enableHeaders?: boolean;
  enableLogger?: boolean;
  enableThreatDetection?: boolean;
  enableRateLimit?: boolean;
  enableRequestLimit?: boolean;

  // Flat Header options
  contentSecurityPolicy?: string;
  frameOptions?: string;
  referrerPolicy?: string;
  strictTransportSecurity?: string;

  // Flat Request size limiter options
  maxBodySize?: string;

  // Flat Rate limiter options
  windowMs?: number;
  maxRequests?: number;

  // Flat Threat detection options
  highActivityThreshold?: number;
  bruteForceThreshold?: number;
  payloadAbuseThreshold?: number;

  // Fallback nested configurations for ultimate compatibility
  headers?: boolean | HeaderOptions;
  rateLimit?: boolean | RateLimitOptions;
  requestLimit?: boolean | RequestLimitOptions;
  threatDetection?: boolean | ThreatDetectorOptions;
}

export const fortress = (options: UnifiedFortressOptions = {}) => {
  const middlewares: any[] = [];

  // 1. Logger Middleware (Enabled by default unless explicitly false)
  if (options.enableLogger !== false) {
    middlewares.push(logger());
  }

  // 2. Security Headers (Enabled by default, or if explicitly set/configured)
  const shouldEnableHeaders =
    options.enableHeaders !== false &&
    options.headers !== false;

  if (shouldEnableHeaders) {
    const headerConfig: HeaderOptions = {
      contentSecurityPolicy: options.contentSecurityPolicy,
      frameOptions: options.frameOptions,
      referrerPolicy: options.referrerPolicy,
      strictTransportSecurity: options.strictTransportSecurity,
      ...(typeof options.headers === "object" ? options.headers : {})
    };
    // Strip undefined properties
    const cleanHeaderConfig = Object.fromEntries(
      Object.entries(headerConfig).filter(([_, v]) => v !== undefined)
    );
    middlewares.push(headers(cleanHeaderConfig));
  }

  // 3. Request Size Limiter
  const shouldEnableRequestLimit =
    options.enableRequestLimit === true ||
    options.requestLimit === true ||
    options.maxBodySize !== undefined ||
    (typeof options.requestLimit === "object");

  if (shouldEnableRequestLimit) {
    const limitConfig: RequestLimitOptions = {
      maxBodySize: options.maxBodySize || "1mb",
      ...(typeof options.requestLimit === "object" ? options.requestLimit : {})
    };
    middlewares.push(requestLimit(limitConfig));
  }

  // 4. Threat Detection
  const shouldEnableThreatDetection =
    options.enableThreatDetection === true ||
    options.threatDetection === true ||
    options.highActivityThreshold !== undefined ||
    options.bruteForceThreshold !== undefined ||
    options.payloadAbuseThreshold !== undefined ||
    (typeof options.threatDetection === "object");

  if (shouldEnableThreatDetection) {
    const threatConfig: ThreatDetectorOptions = {
      windowMs: options.windowMs,
      highActivityThreshold: options.highActivityThreshold,
      bruteForceThreshold: options.bruteForceThreshold,
      payloadAbuseThreshold: options.payloadAbuseThreshold,
      ...(typeof options.threatDetection === "object" ? options.threatDetection : {})
    };
    // Strip undefined properties
    const cleanThreatConfig = Object.fromEntries(
      Object.entries(threatConfig).filter(([_, v]) => v !== undefined)
    );
    middlewares.push(threatDetector(cleanThreatConfig));
  }

  // 5. Rate Limiting
  const shouldEnableRateLimit =
    options.enableRateLimit === true ||
    options.rateLimit === true ||
    options.maxRequests !== undefined ||
    (typeof options.rateLimit === "object");

  if (shouldEnableRateLimit) {
    const rateConfig: RateLimitOptions = {
      windowMs: options.windowMs || 60 * 1000,
      maxRequests: options.maxRequests || 100,
      ...(typeof options.rateLimit === "object" ? options.rateLimit : {})
    };
    middlewares.push(rateLimit(rateConfig));
  }

  // Chain and run all matching middlewares sequentially
  return (req: Request, res: Response, next: NextFunction) => {
    let index = 0;

    function nextMiddleware(err?: any) {
      if (err) return next(err);
      if (index >= middlewares.length) return next();

      const mw = middlewares[index++];
      mw(req, res, nextMiddleware);
    }

    nextMiddleware();
  };
};
