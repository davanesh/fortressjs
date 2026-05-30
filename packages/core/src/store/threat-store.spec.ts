import { threatStore } from "./threat-store";

describe("ThreatStore", () => {
  beforeEach(() => {
    threatStore.clear();
    threatStore.setRetention(5 * 60 * 1000); // Reset retention
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
    expect(callback).toHaveBeenCalledTimes(1); // No new calls after unsubscribe
  });

  it("should prune old threats based on retention window", () => {
    const now = Date.now();
    threatStore.setRetention(500); // 500ms retention

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
      timestamp: new Date(now - 1000).toISOString(), // expired
      details: "Old scan",
      severity: "MEDIUM"
    });

    expect(threatStore.count()).toBe(1);
    expect(threatStore.getAll()[0].ip).toBe("192.168.1.3");
  });
});
