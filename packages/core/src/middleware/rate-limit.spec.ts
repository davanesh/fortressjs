import express, { Request, Response } from "express";
import request from "supertest";
import { rateLimit } from "./rate-limit";

describe("RateLimit Middleware", () => {
  it("should allow requests under the limit and block after exceeding", async () => {
    const app = express();
    app.use(rateLimit({ windowMs: 5000, maxRequests: 2 }));
    app.get("/", (_req: Request, res: Response) => res.send("OK"));

    // First request (count=1)
    let res = await request(app).get("/");
    expect(res.status).toBe(200);

    // Second request (count=2, 2 > 2 is false, passes)
    res = await request(app).get("/");
    expect(res.status).toBe(200);

    // Third request (count=3, 3 > 2 is true -> 429)
    res = await request(app).get("/");
    expect(res.status).toBe(429);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Too Many Requests");
  });

  it("should reset the counter after the window expires", async () => {
    const app = express();
    // Use a very short 100ms window
    app.use(rateLimit({ windowMs: 100, maxRequests: 1 }));
    app.get("/", (_req: Request, res: Response) => res.send("OK"));

    // First request passes
    let res = await request(app).get("/");
    expect(res.status).toBe(200);

    // Second request should be blocked
    res = await request(app).get("/");
    expect(res.status).toBe(429);

    // Wait for the window to expire
    await new Promise((resolve) => setTimeout(resolve, 150));

    // After window expires, counter should reset and request should pass
    res = await request(app).get("/");
    expect(res.status).toBe(200);
  });
});
