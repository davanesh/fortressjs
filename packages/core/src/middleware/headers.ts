import { Request, Response, NextFunction } from "express";
import { HeaderOptions } from "../types/security";

const DEFAULT_OPTIONS: Required<HeaderOptions> = {
  contentSecurityPolicy: "default-src 'self'",
  frameOptions: "DENY",
  referrerPolicy: "strict-origin-when-cross-origin",
  strictTransportSecurity: "max-age=31536000; includeSubDomains"
};

export const headers = (
  options: HeaderOptions = {}
) => {
  const config = {
    ...DEFAULT_OPTIONS,
    ...options
  };

  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    res.setHeader(
      "X-Frame-Options",
      config.frameOptions
    );

    res.setHeader(
      "X-Content-Type-Options",
      "nosniff"
    );

    res.setHeader(
      "Referrer-Policy",
      config.referrerPolicy
    );

    res.setHeader(
      "Content-Security-Policy",
      config.contentSecurityPolicy
    );

    res.setHeader(
      "Strict-Transport-Security",
      config.strictTransportSecurity
    );

    next();
  };
};