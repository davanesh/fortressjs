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
});