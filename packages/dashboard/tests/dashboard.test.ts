import express from "express";
import request from "supertest";

import dashboard from "../src";

describe("FortressJS Dashboard", () => {

  test("mounts successfully", async () => {
    const app = express();

    app.use(
      "/fortress",
      dashboard()
    );

    const response =
      await request(app)
        .get("/fortress/");

    expect(response.status).toBe(200);

    expect(
      response.text
    ).toContain("FortressJS");
  });


  test("returns dashboard overview", async () => {
    const app = express();

    app.use(
      "/fortress",
      dashboard()
    );

    const response =
      await request(app)
        .get("/fortress/api/overview");

    expect(response.status).toBe(200);

    expect(
      response.body
    ).toHaveProperty("requests");

    expect(
      response.body
    ).toHaveProperty("threats");

    expect(
      response.body
    ).toHaveProperty("criticalThreats");

    expect(
      response.body
    ).toHaveProperty("highThreats");

    expect(
      response.body
    ).toHaveProperty("mediumThreats");

    expect(
      response.body
    ).toHaveProperty("lowThreats");

    expect(
      response.body
    ).toHaveProperty("uniqueIPs");

    expect(
      response.body
    ).toHaveProperty("threatTypes");

    expect(
      response.body
    ).toHaveProperty("retentionMs");

    expect(
      response.body
    ).toHaveProperty("timestamp");
  });


  test("returns threats", async () => {
    const app = express();

    app.use(
      "/fortress",
      dashboard()
    );

    const response =
      await request(app)
        .get("/fortress/api/threats");

    expect(response.status).toBe(200);

    expect(
      response.body
    ).toHaveProperty("threats");

    expect(
      Array.isArray(
        response.body.threats
      )
    ).toBe(true);
  });


  test("returns events", async () => {
    const app = express();

    app.use(
      "/fortress",
      dashboard()
    );

    const response =
      await request(app)
        .get("/fortress/api/events");

    expect(response.status).toBe(200);

    expect(
      response.body
    ).toHaveProperty("events");

    expect(
      Array.isArray(
        response.body.events
      )
    ).toBe(true);
  });

  test("does not expose dashboard when disabled", async () => {
    const app = express();

    app.use(
      "/fortress",
      dashboard({
        enabled: false
      })
    );

    const response =
      await request(app)
        .get("/fortress/");

    expect(response.status).toBe(404);
  });
});