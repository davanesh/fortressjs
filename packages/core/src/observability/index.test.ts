/// <reference types="jest" />

import {
  observability
} from "./index";
import {
  eventStore
} from "../store/event-store";

import {
  threatStore
} from "../store/threat-store";

describe("Observability API", () => {

  beforeEach(() => {
    eventStore.clear();
    threatStore.clear();

    eventStore.setRetention(
      5 * 60 * 1000
    );

    threatStore.setRetention(
      5 * 60 * 1000
    );
  });

  afterAll(() => {
    eventStore.stopPruning();
    threatStore.stopPruning();
  });

  test("returns security events", () => {
    eventStore.add({
      timestamp: new Date().toISOString(),
      ip: "127.0.0.1",
      method: "GET",
      path: "/",
      statusCode: 200
    });

    const events =
      observability.getEvents();

    expect(events).toHaveLength(1);

    expect(events[0]).toMatchObject({
      ip: "127.0.0.1",
      method: "GET",
      path: "/",
      statusCode: 200
    });
  });

  test("returns threat events", () => {
    threatStore.add({
      type: "RECONNAISSANCE",
      ip: "127.0.0.1",
      timestamp: new Date().toISOString(),
      details: "Suspicious path detected",
      severity: "HIGH"
    });

    const threats =
      observability.getThreats();

    expect(threats).toHaveLength(1);

    expect(threats[0]).toMatchObject({
      type: "RECONNAISSANCE",
      ip: "127.0.0.1",
      severity: "HIGH"
    });

    expect(threats[0].id).toBeDefined();
  });

  test("returns correct metrics", () => {
    const timestamp =
      new Date().toISOString();

    eventStore.add({
      timestamp,
      ip: "10.0.0.1",
      method: "GET",
      path: "/",
      statusCode: 200
    });

    eventStore.add({
      timestamp,
      ip: "10.0.0.2",
      method: "POST",
      path: "/login",
      statusCode: 401
    });

    eventStore.add({
      timestamp,
      ip: "10.0.0.1",
      method: "GET",
      path: "/users",
      statusCode: 200
    });

    threatStore.add({
      type: "RECONNAISSANCE",
      ip: "10.0.0.1",
      timestamp,
      details: "Suspicious path",
      severity: "HIGH"
    });

    threatStore.add({
      type: "BRUTE_FORCE",
      ip: "10.0.0.2",
      timestamp,
      details: "Repeated login attempts",
      severity: "CRITICAL"
    });

    threatStore.add({
      type: "SUSPICIOUS_USER_AGENT",
      ip: "10.0.0.3",
      timestamp,
      details: "Suspicious user agent",
      severity: "MEDIUM"
    });

    threatStore.add({
      type: "HIGH_ACTIVITY",
      ip: "10.0.0.4",
      timestamp,
      details: "High request activity",
      severity: "LOW"
    });

    const metrics =
      observability.getMetrics();

    expect(metrics.requests).toBe(3);
    expect(metrics.threats).toBe(4);

    expect(
      metrics.criticalThreats
    ).toBe(1);

    expect(
      metrics.highThreats
    ).toBe(1);

    expect(
      metrics.mediumThreats
    ).toBe(1);

    expect(
      metrics.lowThreats
    ).toBe(1);

    expect(
      metrics.uniqueIPs
    ).toBe(2);
  });

  test("counts unique IP addresses correctly", () => {
    const timestamp =
      new Date().toISOString();

    eventStore.add({
      timestamp,
      ip: "192.168.1.10",
      method: "GET",
      path: "/",
      statusCode: 200
    });

    eventStore.add({
      timestamp,
      ip: "192.168.1.10",
      method: "GET",
      path: "/users",
      statusCode: 200
    });

    eventStore.add({
      timestamp,
      ip: "192.168.1.11",
      method: "POST",
      path: "/login",
      statusCode: 401
    });

    const metrics =
      observability.getMetrics();

    expect(
      metrics.uniqueIPs
    ).toBe(2);
  });

  test("returns configured retention", () => {
    const retention =
      10 * 60 * 1000;

    eventStore.setRetention(
      retention
    );

    expect(
      observability.getRetention()
    ).toBe(retention);
  });

  test("subscribes to new threats", () => {
    const listener =
      jest.fn();

    const unsubscribe =
      observability.subscribeThreats(
        listener
      );

    const threat =
      threatStore.add({
        type: "PAYLOAD_ATTACK",
        ip: "127.0.0.1",
        timestamp: new Date().toISOString(),
        details: "Payload abuse detected",
        severity: "HIGH"
      });

    expect(
      listener
    ).toHaveBeenCalledTimes(1);

    expect(
      listener
    ).toHaveBeenCalledWith(
      threat
    );

    unsubscribe();
  });

  test("unsubscribe stops future threat notifications", () => {
    const listener =
      jest.fn();

    const unsubscribe =
      observability.subscribeThreats(
        listener
      );

    unsubscribe();

    threatStore.add({
      type: "BRUTE_FORCE",
      ip: "127.0.0.1",
      timestamp: new Date().toISOString(),
      details: "Repeated failed requests",
      severity: "HIGH"
    });

    expect(
      listener
    ).not.toHaveBeenCalled();
  });

});