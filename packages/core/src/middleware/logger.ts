import { Request, Response, NextFunction } from "express";
import { eventStore } from "../store";

export const logger = () => {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const start = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - start;

      const event = {
        timestamp: new Date().toISOString(),
        ip:
          req.ip ||
          req.socket.remoteAddress ||
          "unknown",
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode
      };

      eventStore.add(event);

      console.log(
        `[${event.timestamp}] ` +
        `${event.method} ` +
        `${event.path} ` +
        `${event.statusCode} ` +
        `${event.ip} ` +
        `${duration}ms`
      );
    });

    next();
  };
};