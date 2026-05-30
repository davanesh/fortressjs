import express, { Request, Response } from "express";
import request from "supertest";
import { headers } from "./headers";

describe("Headers Middleware", () => {
  it("should set default security headers", async () => {
    const app = express();
    app.use(headers());
    app.get("/", (_req: Request, res: Response) => res.send("OK"));

    const response = await request(app).get("/");
    expect(response.headers["x-frame-options"]).toBe("DENY");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(response.headers["content-security-policy"]).toBe("default-src 'self'");
    expect(response.headers["strict-transport-security"]).toBe("max-age=31536000; includeSubDomains");
  });

  it("should allow custom options", async () => {
    const app = express();
    app.use(
      headers({
        frameOptions: "SAMEORIGIN",
        contentSecurityPolicy: "default-src 'none'"
      })
    );
    app.get("/", (_req: Request, res: Response) => res.send("OK"));

    const response = await request(app).get("/");
    expect(response.headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(response.headers["content-security-policy"]).toBe("default-src 'none'");
    expect(response.headers["referrer-policy"]).toBe("strict-origin-when-cross-origin"); // Defaults kept
  });
});
