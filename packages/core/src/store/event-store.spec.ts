import { eventStore } from "./event-store";

describe("EventStore", () => {
  beforeEach(() => {
    eventStore.clear();
    eventStore.setRetention(5 * 60 * 1000);
  });

  afterAll(() => {
    eventStore.stopPruning();
  });

  it("should add and retrieve events", () => {
    const event = {
      timestamp: new Date().toISOString(),
      ip: "127.0.0.1",
      method: "GET",
      path: "/test",
      statusCode: 200
    };

    eventStore.add(event);
    expect(eventStore.count()).toBe(1);

    const all = eventStore.getAll();
    expect(all[0]).toEqual(event);
  });

  it("should return a defensive copy from getAll", () => {
    eventStore.add({
      timestamp: new Date().toISOString(),
      ip: "127.0.0.1",
      method: "GET",
      path: "/test",
      statusCode: 200
    });

    const all1 = eventStore.getAll();
    const all2 = eventStore.getAll();
    expect(all1).not.toBe(all2);
    expect(all1).toEqual(all2);
  });

  it("should clear events", () => {
    eventStore.add({
      timestamp: new Date().toISOString(),
      ip: "127.0.0.1",
      method: "GET",
      path: "/test",
      statusCode: 200
    });
    expect(eventStore.count()).toBe(1);

    eventStore.clear();
    expect(eventStore.count()).toBe(0);
  });

  it("should prune events older than retention window", () => {
    const now = Date.now();
    eventStore.setRetention(1000);

    eventStore.add({
      timestamp: new Date(now).toISOString(),
      ip: "127.0.0.1",
      method: "GET",
      path: "/current",
      statusCode: 200
    });

    eventStore.add({
      timestamp: new Date(now - 2000).toISOString(),
      ip: "127.0.0.1",
      method: "GET",
      path: "/expired",
      statusCode: 200
    });

    expect(eventStore.count()).toBe(1);
    expect(eventStore.getAll()[0].path).toBe("/current");
  });

  it("should allow getting and setting retention", () => {
    eventStore.setRetention(10000);
    expect(eventStore.getRetention()).toBe(10000);
  });

  it("should handle startPruning and stopPruning calls", () => {
    // Re-invoke startPruning (covers the branch where pruneInterval already exists)
    eventStore.startPruning();
    eventStore.startPruning();

    // stopPruning should clear the interval
    eventStore.stopPruning();
    // Calling stopPruning again when interval is null covers the null branch
    eventStore.stopPruning();

    // Re-start for other tests
    eventStore.startPruning();
  });
});
