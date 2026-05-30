import express, { Request, Response } from "express";
import request from "supertest";
import fortress from "../index";
import { eventStore } from "../store/event-store";

describe("Unified Middleware (fortress)", () => {
  beforeEach(() => {
    eventStore.clear();
  });

  afterAll(() => {
    eventStore.stopPruning();
  });

  it("should chain multiple middlewares using a flat configuration", async () => {
    const app = express();
    // Enable logger, headers, rateLimit and requestLimit flatly
    app.use(
      fortress({
        enableHeaders: true,
        contentSecurityPolicy: "default-src 'self'",
        maxBodySize: "1kb",
        maxRequests: 3,
        windowMs: 5000
      })
    );
    app.post("/", (_req: Request, res: Response) => res.send("OK"));

    // 1. Check security headers are set
    const res1 = await request(app).post("/").send({ short: "data" });
    expect(res1.status).toBe(200);
    expect(res1.headers["content-security-policy"]).toBe("default-src 'self'");

    // 2. Check that logging occurred and was stored in eventStore
    expect(eventStore.count()).toBe(1);

    // 3. Check request size limiting
    const res2 = await request(app)
      .post("/")
      .set("Content-Length", "2048")
      .send({ long: "exceeds maximum allowed payload size" });
    expect(res2.status).toBe(413);

    // 4. Check rate limiting (make 3 more requests, total 5, limit is 3)
    await request(app).post("/").send({ short: "data" });
    const res3 = await request(app).post("/").send({ short: "data" });
    expect(res3.status).toBe(429);
  });
});
