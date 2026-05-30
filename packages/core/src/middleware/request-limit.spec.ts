import express, { Request, Response } from "express";
import request from "supertest";
import { requestLimit } from "./request-limit";

describe("RequestLimit Middleware", () => {
  it("should allow requests under the limit", async () => {
    const app = express();
    app.use(requestLimit({ maxBodySize: "1kb" }));
    app.post("/", (_req: Request, res: Response) => res.send("OK"));

    const response = await request(app)
      .post("/")
      .set("Content-Length", "500")
      .send({ data: "short" });

    expect(response.status).toBe(200);
    expect(response.text).toBe("OK");
  });

  it("should reject requests over the limit with 413", async () => {
    const app = express();
    app.use(requestLimit({ maxBodySize: "1kb" }));
    app.post("/", (_req: Request, res: Response) => res.send("OK"));

    const response = await request(app)
      .post("/")
      .set("Content-Length", "2048")
      .send({ data: "too long" });

    expect(response.status).toBe(413);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Payload Too Large");
  });

  it("should support mb size unit", async () => {
    const app = express();
    app.use(requestLimit({ maxBodySize: "1mb" }));
    app.post("/", (_req: Request, res: Response) => res.send("OK"));

    // Under 1MB
    const res1 = await request(app)
      .post("/")
      .set("Content-Length", "500")
      .send({ data: "small" });
    expect(res1.status).toBe(200);

    // Over 1MB
    const res2 = await request(app)
      .post("/")
      .set("Content-Length", String(2 * 1024 * 1024))
      .send({ data: "big" });
    expect(res2.status).toBe(413);
  });

  it("should support plain byte size (no unit)", async () => {
    const app = express();
    app.use(requestLimit({ maxBodySize: "100" }));
    app.post("/", (_req: Request, res: Response) => res.send("OK"));

    const res = await request(app)
      .post("/")
      .set("Content-Length", "200")
      .send({ data: "over" });
    expect(res.status).toBe(413);
  });

  it("should allow requests with no content-length header", async () => {
    const app = express();
    app.use(requestLimit({ maxBodySize: "1kb" }));
    app.get("/", (_req: Request, res: Response) => res.send("OK"));

    const res = await request(app).get("/");
    expect(res.status).toBe(200);
  });
});
