import express, { Request, Response } from "express";
import request from "supertest";
import { threatDetector, resetThreatDetector } from "./threat-detector";
import { logger } from "./logger";
import { eventStore } from "../store/event-store";
import { threatStore } from "../store/threat-store";

describe("ThreatDetector Middleware", () => {
  beforeEach(() => {
    eventStore.clear();
    threatStore.clear();
    resetThreatDetector();
  });

  afterAll(() => {
    eventStore.stopPruning();
    threatStore.stopPruning();
  });

  it("should detect reconnaissance path scans immediately", async () => {
    const app = express();
    app.use(threatDetector());
    app.get("/wp-admin", (_req: Request, res: Response) => res.send("OK"));

    await request(app).get("/wp-admin");

    const threats = threatStore.getAll();
    expect(threats.length).toBe(1);
    expect(threats[0].type).toBe("RECONNAISSANCE");
    expect(threats[0].severity).toBe("HIGH");
    expect(threats[0].id).toBeDefined();
  });

  it("should detect subpath reconnaissance scans", async () => {
    const app = express();
    app.use(threatDetector());
    app.get("/wp-admin/setup.php", (_req: Request, res: Response) => res.send("OK"));

    await request(app).get("/wp-admin/setup.php");

    const threats = threatStore.getAll();
    expect(threats.length).toBe(1);
    expect(threats[0].type).toBe("RECONNAISSANCE");
  });

  it("should detect suspicious user agents immediately", async () => {
    const app = express();
    app.use(threatDetector());
    app.get("/", (_req: Request, res: Response) => res.send("OK"));

    await request(app).get("/").set("User-Agent", "sqlmap/v1.4");

    const threats = threatStore.getAll();
    expect(threats.length).toBe(1);
    expect(threats[0].type).toBe("SUSPICIOUS_USER_AGENT");
    expect(threats[0].severity).toBe("MEDIUM");
  });

  it("should not flag normal user agents", async () => {
    const app = express();
    app.use(threatDetector());
    app.get("/", (_req: Request, res: Response) => res.send("OK"));

    await request(app).get("/").set("User-Agent", "Mozilla/5.0 Chrome/120");

    const threats = threatStore.getAll();
    expect(threats.length).toBe(0);
  });

  it("should not flag normal paths", async () => {
    const app = express();
    app.use(threatDetector());
    app.get("/api/users", (_req: Request, res: Response) => res.send("OK"));

    await request(app).get("/api/users");

    const threats = threatStore.getAll();
    expect(threats.length).toBe(0);
  });

  it("should detect brute force attempts from repeated 429 status codes", async () => {
    const app = express();
    app.use(logger());
    app.use(threatDetector({ bruteForceThreshold: 2 }));
    app.get("/", (_req: Request, res: Response) => res.status(429).send("Too Many Requests"));

    await request(app).get("/");
    await request(app).get("/");

    const threats = threatStore.getAll();
    expect(threats.length).toBe(1);
    expect(threats[0].type).toBe("BRUTE_FORCE");
    expect(threats[0].severity).toBe("HIGH");
  });

  it("should detect payload attacks from repeated 413 status codes", async () => {
    const app = express();
    app.use(logger());
    app.use(threatDetector({ payloadAbuseThreshold: 2 }));
    app.post("/", (_req: Request, res: Response) => res.status(413).send("Too Large"));

    await request(app).post("/");
    await request(app).post("/");

    const threats = threatStore.getAll();
    expect(threats.length).toBe(1);
    expect(threats[0].type).toBe("PAYLOAD_ATTACK");
    expect(threats[0].severity).toBe("HIGH");
  });

  it("should detect high activity request volumes", async () => {
    const app = express();
    app.use(logger());
    app.use(threatDetector({ highActivityThreshold: 5 }));
    app.get("/", (_req: Request, res: Response) => res.send("OK"));

    for (let i = 0; i < 5; i++) {
      await request(app).get("/");
    }

    const threats = threatStore.getAll();
    expect(threats.some((t) => t.type === "HIGH_ACTIVITY")).toBe(true);
  });

  it("should escalate threat severity to CRITICAL on repeated violations", async () => {
    const app = express();
    app.use(threatDetector());
    app.get("/wp-admin", (_req: Request, res: Response) => res.send("OK"));
    app.get("/.env", (_req: Request, res: Response) => res.send("OK"));
    app.get("/backup", (_req: Request, res: Response) => res.send("OK"));

    // Make 3 distinct reconnaissance requests to different paths.
    // Each path generates its own dedup key so they won't be deduplicated.
    await request(app).get("/wp-admin");
    await request(app).get("/.env");
    await request(app).get("/backup");

    const threats = threatStore.getAll();
    expect(threats.length).toBe(3);

    // The third threat should be escalated to CRITICAL because the IP already has 2+ threats
    expect(threats[2].severity).toBe("CRITICAL");
  });

  it("should deduplicate same threat type from same IP within 5 seconds", async () => {
    const app = express();
    app.use(threatDetector());
    app.get("/wp-admin", (_req: Request, res: Response) => res.send("OK"));

    // Same path, same IP, within 5s -> should deduplicate
    await request(app).get("/wp-admin");
    await request(app).get("/wp-admin");

    const threats = threatStore.getAll();
    expect(threats.length).toBe(1);
  });
});
