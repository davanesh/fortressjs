import express, { Request, Response } from "express";
import request from "supertest";
import { rateLimit } from "./rate-limit";

describe("RateLimit Middleware", () => {
  it("should allow requests under the limit and block after exceeding", async () => {
    const app = express();
    app.use(rateLimit({ windowMs: 5000, maxRequests: 2 }));
    app.get("/", (_req: Request, res: Response) => res.send("OK"));

    // First request
    let res = await request(app).get("/");
    expect(res.status).toBe(200);

    // Second request
    res = await request(app).get("/");
    expect(res.status).toBe(200);

    // Third request (blocked)
    res = await request(app).get("/");
    expect(res.status).toBe(429);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Too Many Requests");
  });
});
