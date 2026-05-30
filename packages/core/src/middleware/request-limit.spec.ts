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
});
