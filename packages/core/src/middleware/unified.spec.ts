import express, { Request, Response } from "express";
import request from "supertest";
import fortress from "../index";
import { eventStore } from "../store/event-store";
import { threatStore } from "../store/threat-store";
import { resetThreatDetector } from "./threat-detector";

describe("Unified Middleware (fortress)", () => {
  beforeEach(() => {
    eventStore.clear();
    threatStore.clear();
    resetThreatDetector();
  });

  afterAll(() => {
    eventStore.stopPruning();
    threatStore.stopPruning();
  });

  it("should chain logger, headers, requestLimit, and rateLimit using flat config", async () => {
    const app = express();
    app.use(
      fortress({
        enableHeaders: true,
        contentSecurityPolicy: "default-src 'self'",
        maxBodySize: "1kb",
        maxRequests: 2,
        windowMs: 5000
      })
    );
    app.post("/", (_req: Request, res: Response) => res.send("OK"));

    // 1. First request succeeds, check security headers are set
    const res1 = await request(app).post("/").send({ short: "data" });
    expect(res1.status).toBe(200);
    expect(res1.headers["content-security-policy"]).toBe("default-src 'self'");
    expect(res1.headers["x-frame-options"]).toBe("DENY");

    // 2. Check that logging occurred and was stored in eventStore
    expect(eventStore.count()).toBe(1);

    // 3. Check request size limiting (413 — never reaches rate limiter)
    const res2 = await request(app)
      .post("/")
      .set("Content-Length", "2048")
      .send({ long: "exceeds maximum allowed payload size" });
    expect(res2.status).toBe(413);

    // 4. Second successful request (rate limiter count=2, limit is 2, 2 > 2 is false, passes)
    const res3 = await request(app).post("/").send({ short: "data" });
    expect(res3.status).toBe(200);

    // 5. Third successful request attempt (rate limiter count=3, 3 > 2 is true -> 429)
    const res4 = await request(app).post("/").send({ short: "data" });
    expect(res4.status).toBe(429);
  });

  it("should enable logger and headers by default with no options", async () => {
    const app = express();
    app.use(fortress({}));
    app.get("/", (_req: Request, res: Response) => res.send("OK"));

    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.headers["x-frame-options"]).toBe("DENY");
    expect(eventStore.count()).toBe(1);
  });

  it("should disable logger when explicitly set to false", async () => {
    const app = express();
    app.use(fortress({ enableLogger: false, enableHeaders: false }));
    app.get("/", (_req: Request, res: Response) => res.send("OK"));

    await request(app).get("/");
    expect(eventStore.count()).toBe(0);
  });

  it("should enable threat detection via nested boolean", async () => {
    const app = express();
    app.use(fortress({ threatDetection: true }));
    app.get("/wp-admin", (_req: Request, res: Response) => res.send("OK"));

    await request(app).get("/wp-admin");
    expect(threatStore.getAll().length).toBe(1);
  });

  it("should enable rate limiting via nested boolean with defaults", async () => {
    const app = express();
    app.use(fortress({ rateLimit: true }));
    app.get("/", (_req: Request, res: Response) => res.send("OK"));

    const res = await request(app).get("/");
    expect(res.status).toBe(200);
  });

  it("should enable request limiting via nested object", async () => {
    const app = express();
    app.use(fortress({ requestLimit: { maxBodySize: "100" } }));
    app.post("/", (_req: Request, res: Response) => res.send("OK"));

    const res = await request(app)
      .post("/")
      .set("Content-Length", "500")
      .send("x".repeat(500));
    expect(res.status).toBe(413);
  });

  it("should disable headers when explicitly set to false", async () => {
    const app = express();
    app.use(fortress({ headers: false }));
    app.get("/", (_req: Request, res: Response) => res.send("OK"));

    const res = await request(app).get("/");
    expect(res.headers["x-frame-options"]).toBeUndefined();
  });
});
