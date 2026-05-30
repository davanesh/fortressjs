import fortress, {
  headers,
  rateLimit,
  requestLimit,
  logger,
  threatDetector,
  eventStore,
  threatStore
} from "./index";

describe("Main Default Export Properties", () => {
  it("should export middlewares and stores on the fortress default function", () => {
    expect(typeof fortress).toBe("function");
    expect(typeof fortress.headers).toBe("function");
    expect(typeof fortress.rateLimit).toBe("function");
    expect(typeof fortress.requestLimit).toBe("function");
    expect(typeof fortress.logger).toBe("function");
    expect(typeof fortress.threatDetector).toBe("function");
    expect(typeof fortress.eventStore).toBe("object");
    expect(typeof fortress.threatStore).toBe("object");
  });

  it("should expose named exports identical to the default properties", () => {
    expect(fortress.headers).toBe(headers);
    expect(fortress.rateLimit).toBe(rateLimit);
    expect(fortress.requestLimit).toBe(requestLimit);
    expect(fortress.logger).toBe(logger);
    expect(fortress.threatDetector).toBe(threatDetector);
    expect(fortress.eventStore).toBe(eventStore);
    expect(fortress.threatStore).toBe(threatStore);
  });
});
