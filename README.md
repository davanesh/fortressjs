# FortressJS

![npm](https://img.shields.io/npm/v/%40fortressjs%2Fcore)
![license](https://img.shields.io/npm/l/%40fortressjs%2Fcore)
![build](https://github.com/davanesh/fortressjs/actions/workflows/ci.yml/badge.svg)

A powerful, event-driven security platform for Express APIs. FortressJS combines security headers, request validation, rate limiting, threat detection, and auditing into a unified developer experience.

---

## Links

* GitHub: https://github.com/davanesh/fortressjs
* npm Core: https://www.npmjs.com/package/@fortressjs/core
* npm CLI: https://www.npmjs.com/package/@fortressjs/cli

---

## Features

* **Security Headers** – Automatically applies security-focused HTTP headers to protect against common web vulnerabilities.
* **Request Validation** – Restricts oversized payloads to help prevent Denial-of-Service attacks.
* **Rate Limiting** – Defends APIs against brute-force attacks and abusive traffic patterns.
* **Threat Detection Engine** – Detects:

  * Reconnaissance scans (`/wp-admin`, `/.env`, etc.)
  * Suspicious User Agents
  * Payload abuse attempts
  * High activity anomalies
  * Multi-vector attacks with automatic `CRITICAL` escalation
* **Event Store & Threat Store** – Subscribe to real-time security events.
* **Security Audit CLI** – Scan Express applications for missing security controls.
* **TypeScript Support** – Fully typed API and configuration options.
* **Unified Configuration API** – Secure an application using a single middleware.

---

## Why FortressJS?

Modern Express applications often require multiple packages to implement:

* Security headers
* Request size validation
* Rate limiting
* Threat monitoring
* Security auditing

FortressJS combines these capabilities into a single platform while maintaining a simple developer experience and minimal setup.

---

## Installation

### Core Package

```bash
npm install @fortressjs/core
```

### CLI Package

```bash
npm install -g @fortressjs/cli
```

Or run directly without installation:

```bash
npx @fortressjs/cli audit ./src/app.ts
```

---

## Quick Start

```typescript
import express from "express";
import fortress from "@fortressjs/core";

const app = express();

app.use(express.json());

app.use(
  fortress({
    enableHeaders: true,
    contentSecurityPolicy: "default-src 'self'",
    requestLimit: {
      maxBodySize: "1mb"
    },
    rateLimit: {
      windowMs: 60000,
      maxRequests: 100
    },
    threatDetection: {
      windowMs: 60000,
      highActivityThreshold: 20,
      bruteForceThreshold: 3,
      payloadAbuseThreshold: 3
    }
  })
);

app.get("/", (_req, res) => {
  res.json({
    status: "Fortress is guarding this API"
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

---

## Threat Detection

FortressJS continuously analyzes request behavior and can identify:

| Threat Type           | Description                                                            |
| --------------------- | ---------------------------------------------------------------------- |
| RECONNAISSANCE        | Scans for sensitive paths such as `.env`, `wp-admin`, and admin panels |
| SUSPICIOUS_USER_AGENT | Detects known scanning and attack tools                                |
| BRUTE_FORCE           | Detects repeated rate-limit violations                                 |
| PAYLOAD_ATTACK        | Detects repeated oversized payload attempts                            |
| HIGH_ACTIVITY         | Identifies unusual request volume                                      |
| CRITICAL              | Escalates multi-vector attacks automatically                           |

---

## Real-Time Threat Monitoring

Subscribe to threat events and integrate with monitoring platforms such as Datadog, Splunk, PagerDuty, or Slack.

```typescript
import { threatStore } from "@fortressjs/core";

threatStore.subscribe((threat) => {
  if (threat.severity === "CRITICAL") {
    console.error(
      `[ALERT] Critical threat detected from ${threat.ip}`
    );

    // Trigger external notifications
  }
});
```

---

## Security Audit CLI

Audit your Express application for missing security controls.

```bash
npx @fortressjs/cli audit ./src/app.ts
```

Example output:

```text
FortressJS Security Audit

[PASS] Request size limits configured
[PASS] Security headers configured
[FAIL] Rate limiting middleware missing

Security Score: 67/100

Recommendations:
- Add fortress.rateLimit()
```

---

## Documentation

Detailed documentation is available in the `/docs` directory:

* Getting Started
* Configuration Reference
* Threat Detection Guide
* Security Audit CLI Guide
* Internal Architecture

---

## Project Status

Current Release:

```text
v0.1.0
```

Included:

* Unified Middleware API
* Security Headers
* Request Size Limiting
* Rate Limiting
* Threat Detection Engine
* Event Store
* Threat Store
* Security Audit CLI
* GitHub Actions CI
* TypeScript Support

---

## Contributing

Contributions, bug reports, feature requests, and pull requests are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Open a pull request

---

## License

MIT License

Copyright (c) 2026 Davanesh Saminathan
