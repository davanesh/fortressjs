# Security Audit CLI

FortressJS includes a powerful Command Line Interface (CLI) tool designed to scan your application's source code and ensure that security best practices are being enforced.

By running the CLI against your main application entry point, you can instantly see if you are missing crucial middleware protections.

---

## Installation

The CLI is bundled as a separate package to keep your core production dependencies small. You don't even need to install it locally; you can run it via `npx`.

```bash
# Run directly without installation
npx @fortressjs/cli audit ./src/app.ts

# Or install globally
npm install -g @fortressjs/cli
fortress audit ./src/app.ts
```

---

## Usage

Run the `audit` command followed by the path to your Express application's main file.

```bash
npx @fortressjs/cli audit ./src/app.ts
```

### Sample Output

```text
FortressJS Security Audit
Scanning: ./src/app.ts

[PASS] Body size limits are configured.
[FAIL] Missing rate limiting middleware.
[FAIL] Missing security headers middleware.

Security Score: 33/100

Recommendations:
- Add express-rate-limit or fortress.rateLimit() to prevent brute force attacks.
- Add helmet or fortress.headers() to protect against XSS and clickjacking.

Audit completed.
```

---

## Understanding the Audit Report

### Security Score
The CLI calculates a score from `0` to `100` based on the presence of critical security middlewares. A perfect score of `100` means your application is adhering to baseline API defense standards.

### Findings
The tool identifies specific middleware layers:
- **Body size limits**: Ensures you aren't accepting infinite payload sizes (prevents DoS).
- **Rate limiting**: Ensures endpoints can't be spammed.
- **Security headers**: Ensures CSP, HSTS, and X-Frame-Options are set.

### Recommendations
For every `[FAIL]` finding, the CLI provides actionable advice, recommending either the FortressJS unified API or standard open-source equivalents (like `helmet`).

---

## Limitations and Roadmap

### Current Limitations (MVP)
In the current MVP release (v1.0), the Audit CLI utilizes a **Regex Scanner**. 
- It relies on pattern matching against your source text.
- It may produce false negatives if your middleware is imported via complex aliases or dynamically injected via loops.

### Future Roadmap: AST Scanning
The CLI is architecturally designed around a generic `AuditScanner` interface. In a future update, we will swap the `RegexScanner` for a structural **AST Scanner** (Abstract Syntax Tree). 

By analyzing the actual compiled structure of your TypeScript/JavaScript code, the AST Scanner will accurately map execution flow, guaranteeing 100% precision in detecting whether security middleware is properly applied to your Express application, regardless of coding style.
