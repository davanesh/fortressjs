# FortressJS

A powerful, event-driven security platform for Node.js APIs. Designed to be developer-friendly, performant, and secure by default.

## Features

- **Security Headers**: Automatically sets best-practice HTTP headers to prevent common vulnerabilities (XSS, clickjacking).
- **Request Validation**: Validates payload sizes strictly (e.g. `1mb`, `500kb`) to prevent Denial of Service (DoS) attacks.
- **Rate Limiting**: Defends against brute-force attacks and limits excessive API usage.
- **Threat Detection v2**: Event-driven engine to identify:
  - Reconnaissance Scans (e.g. `/wp-admin`, `/.env`)
  - Suspicious User Agents
  - High Activity & Payload Abuse
  - Escalates persistent attackers to `CRITICAL` severity automatically.
- **Security Audit CLI**: Scan your Express application's codebase to ensure proper middleware usage.

## Installation

```bash
npm install @fortressjs/core
```

## Quick Start

The unified configuration API gives you full protection with just one middleware call:

```typescript
import express from "express";
import fortress from "@fortressjs/core";

const app = express();

// Important: Apply body parsers before fortress if using request limit, 
// or apply fortress first to limit the raw stream!
app.use(express.json());

app.use(fortress({
  enableHeaders: true,
  contentSecurityPolicy: "default-src 'self'",
  requestLimit: { maxBodySize: "1mb" },
  rateLimit: { windowMs: 60000, maxRequests: 100 },
  threatDetection: {
    windowMs: 60000,
    highActivityThreshold: 20,
    bruteForceThreshold: 3,
    payloadAbuseThreshold: 3
  }
}));

app.get("/", (req, res) => {
  res.send({ status: "Fortress is guarding this API!" });
});

app.listen(3000, () => console.log("Server running on port 3000"));
```

## Advanced Usage

### Accessing Stores directly

Fortress provides an `eventStore` and a `threatStore` that you can subscribe to. This allows you to integrate Fortress with your monitoring stack (e.g. Datadog, Splunk) or trigger webhooks when a critical threat is detected.

```typescript
import { threatStore } from "@fortressjs/core";

// Listen to real-time threat events
threatStore.subscribe((threat) => {
  if (threat.severity === "CRITICAL") {
    console.error(`[ALERT] Critical threat detected from ${threat.ip}: ${threat.details}`);
    // e.g. trigger PagerDuty or Slack alert
  }
});
```

## Security Audit CLI

Audit your codebase to ensure security best practices are followed.

```bash
npx @fortressjs/cli audit ./src/app.ts
```

*Note: The CLI is currently in MVP and relies on regex-based scanning. A future update will introduce structural AST scanning for more accurate analysis.*

## Contributing

We welcome contributions! Please see our standard contribution guidelines.

## License

MIT