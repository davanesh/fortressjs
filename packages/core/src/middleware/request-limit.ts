import { Request, Response, NextFunction } from "express";
import { RequestLimitOptions } from "../types/request-limit";

const parseSize = (size: string): number => {
  const value = parseInt(size);

  if (size.endsWith("kb")) {
    return value * 1024;
  }

  if (size.endsWith("mb")) {
    return value * 1024 * 1024;
  }

  return value;
};

export const requestLimit = (
  options: RequestLimitOptions
) => {
  const maxBytes = parseSize(
    options.maxBodySize
  );

  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const contentLength = Number(
      req.headers["content-length"] || 0
    );

    if (contentLength > maxBytes) {
      return res.status(413).json({
        success: false,
        error: "Payload Too Large"
      });
    }

    next();
  };
};