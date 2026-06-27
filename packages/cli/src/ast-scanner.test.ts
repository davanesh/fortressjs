import { ASTScanner } from "./ast-scanner";

describe("ASTScanner", () => {
  it("should parse valid code", () => {
    const scanner =
      new ASTScanner();

    const result =
      scanner.scan(`
        import express from "express";

        const app = express();

        app.get("/", () => {});
      `);

    expect(result).toBeDefined();
  });
  it("should detect fortress imports", () => {
  const scanner =
    new ASTScanner();

  const result =
    scanner.scan(`
      import fortress
      from "@fortressjs/core";
    `);
    expect(
      result.hasCSP
    ).toBe(true);
  });
  it("should detect fortress rate limiting inside app.use", () => {
    const scanner = new ASTScanner();

    const result = scanner.scan(`
      import fortress from "@fortressjs/core";

      app.use(
        fortress.rateLimit({
          windowMs: 60000,
          maxRequests: 100
        })
      );
    `);
    expect(
      result.hasRateLimiting
    ).toBe(true);
  });
  it("should detect fortress headers", () => {
  const scanner = new ASTScanner();

  const result = scanner.scan(`
    fortress.headers();
  `);

  expect(result.hasCSP).toBe(true);
});

it("should detect fortress rate limiting", () => {
  const scanner = new ASTScanner();

  const result = scanner.scan(`
    fortress.rateLimit();
  `);

  expect(result.hasRateLimiting).toBe(true);
});

it("should detect fortress request limits", () => {
  const scanner = new ASTScanner();

  const result = scanner.scan(`
    fortress.requestLimit();
  `);

  expect(result.hasRequestSizeLimiting).toBe(true);
});

it("should detect fortress logger", () => {
  const scanner = new ASTScanner();

  const result = scanner.scan(`
    fortress.logger();
  `);

  expect(result.hasLogger).toBe(true);
});

it("should detect fortress threat detector", () => {
  const scanner = new ASTScanner();

  const result = scanner.scan(`
    fortress.threatDetector();
  `);

  expect(result.hasThreatDetection).toBe(true);
});
});