import { eventStore } from "./event-store";

describe("EventStore", () => {
  beforeEach(() => {
    eventStore.clear();
    eventStore.setRetention(5 * 60 * 1000); // Reset retention
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
    eventStore.setRetention(1000); // 1 second retention

    eventStore.add({
      timestamp: new Date(now).toISOString(),
      ip: "127.0.0.1",
      method: "GET",
      path: "/current",
      statusCode: 200
    });

    eventStore.add({
      timestamp: new Date(now - 2000).toISOString(), // 2 seconds ago (expired)
      ip: "127.0.0.1",
      method: "GET",
      path: "/expired",
      statusCode: 200
    });

    // Pruning happens automatically on count/getAll/add
    expect(eventStore.count()).toBe(1);
    expect(eventStore.getAll()[0].path).toBe("/current");
  });
});
