import { threatStore } from "./threat-store";

describe("ThreatStore", () => {
  beforeEach(() => {
    threatStore.clear();
    threatStore.setRetention(5 * 60 * 1000);
  });

  afterAll(() => {
    threatStore.stopPruning();
  });

  it("should add threats and inject UUIDs", () => {
    const threat = {
      type: "RECONNAISSANCE" as const,
      ip: "192.168.1.1",
      timestamp: new Date().toISOString(),
      details: "Scan on /wp-admin",
      severity: "HIGH" as const
    };

    const added = threatStore.add(threat);
    expect(added.id).toBeDefined();
    expect(added.ip).toBe(threat.ip);
    expect(threatStore.count()).toBe(1);
  });

  it("should preserve a provided id if one is supplied", () => {
    const added = threatStore.add({
      id: "custom-id-123",
      type: "BRUTE_FORCE",
      ip: "10.0.0.1",
      timestamp: new Date().toISOString(),
      details: "test",
      severity: "HIGH"
    });
    expect(added.id).toBe("custom-id-123");
  });

  it("should support event-driven subscriptions", () => {
    const callback = jest.fn();
    const unsubscribe = threatStore.subscribe(callback);

    const threat = {
      type: "BRUTE_FORCE" as const,
      ip: "192.168.1.2",
      timestamp: new Date().toISOString(),
      details: "Repeated logins failed",
      severity: "CRITICAL" as const
    };

    const added = threatStore.add(threat);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(added);

    unsubscribe();
    threatStore.add(threat);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should handle listener errors gracefully", () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const badListener = () => { throw new Error("boom"); };
    const unsubscribe = threatStore.subscribe(badListener);

    threatStore.add({
      type: "PAYLOAD_ATTACK",
      ip: "10.0.0.1",
      timestamp: new Date().toISOString(),
      details: "test",
      severity: "HIGH"
    });

    expect(errorSpy).toHaveBeenCalledTimes(1);
    errorSpy.mockRestore();
    unsubscribe();
  });

  it("should prune old threats based on retention window", () => {
    const now = Date.now();
    threatStore.setRetention(500);

    threatStore.add({
      type: "PAYLOAD_ATTACK",
      ip: "192.168.1.3",
      timestamp: new Date(now).toISOString(),
      details: "Current attack",
      severity: "HIGH"
    });

    threatStore.add({
      type: "RECONNAISSANCE",
      ip: "192.168.1.4",
      timestamp: new Date(now - 1000).toISOString(),
      details: "Old scan",
      severity: "MEDIUM"
    });

    expect(threatStore.count()).toBe(1);
    expect(threatStore.getAll()[0].ip).toBe("192.168.1.3");
  });

  it("should allow getting and setting retention", () => {
    threatStore.setRetention(10000);
    expect(threatStore.getRetention()).toBe(10000);
  });

  it("should handle startPruning and stopPruning calls", () => {
    threatStore.startPruning();
    threatStore.startPruning();

    threatStore.stopPruning();
    threatStore.stopPruning();

    threatStore.startPruning();
  });
});
