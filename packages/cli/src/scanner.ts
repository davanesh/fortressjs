export interface ScanResult {
  hasCSP: boolean;
  hasRateLimiting: boolean;
  hasRequestSizeLimiting: boolean;
  hasLogger: boolean;
  hasThreatDetection: boolean;
  hasHTTPS: boolean;
}

export interface AuditScanner {
  name: string;
  scan(fileContent: string): ScanResult;
}

// Concrete implementation of Regex-based scanner for MVP
export class RegexScanner implements AuditScanner {
  name = "RegexScanner";

  scan(fileContent: string): ScanResult {
    const hasCSP = /fortress\.headers|helmet|Content-Security-Policy/i.test(fileContent);
    const hasRateLimiting = /fortress\.rateLimit|express-rate-limit/i.test(fileContent);
    const hasRequestSizeLimiting = /fortress\.requestLimit|limit\s*:\s*['"]\d+m?k?b['"]/i.test(fileContent);
    const hasLogger = /fortress\.logger|morgan|winston/i.test(fileContent);
    const hasThreatDetection = /fortress\.threatDetector/i.test(fileContent);
    const hasHTTPS = /trust proxy|Strict-Transport-Security|https/i.test(fileContent);

    return {
      hasCSP,
      hasRateLimiting,
      hasRequestSizeLimiting,
      hasLogger,
      hasThreatDetection,
      hasHTTPS
    };
  }
}

// Future AST-based scanner abstraction skeleton
export class ASTScanner implements AuditScanner {
  name = "ASTScanner (Future)";

  scan(fileContent: string): ScanResult {
    // In v2, this scanner will parse the TypeScript/JavaScript code into an AST
    // (using e.g., @babel/parser, typescript or acorn) and perform structural analysis
    // to identify secure middleware configurations accurately without false positives.
    throw new Error("AST Scanning is not implemented yet. Using RegexScanner as fallback.");
  }
}
