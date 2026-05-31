# Getting Started with FortressJS

Welcome to FortressJS. This guide will take you from installation to a fully protected Express API in under 5 minutes. FortressJS provides an event-driven security layer designed to be invisible to legitimate users while fiercely blocking malicious actors.

## 1. Introduction

FortressJS is a drop-in security middleware for Express applications. Instead of managing separate packages for headers, rate limiting, payload validation, and threat detection, FortressJS provides a single, unified API that wires these features together intelligently.

## 2. Installation

Install the core package using your preferred package manager.

```bash
npm install @fortressjs/core
```

*(Note: If you use Yarn or PNPM, use `yarn add @fortressjs/core` or `pnpm add @fortressjs/core` respectively).*

## 3. Create Express App

Start by creating a standard Express application. If you already have an existing app, you can skip to the next step.

```typescript
// src/app.ts
import express from "express";

const app = express();

// Standard middleware (e.g., body parsing)
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

export default app;
```

## 4. Enable Fortress

Import the `fortress` unified middleware and apply it to your application. **Crucially, ensure you place the FortressJS middleware *after* any body parsers if you intend to use `requestLimit`, but *before* your actual route handlers.**

```typescript
// src/app.ts
import express from "express";
import fortress from "@fortressjs/core";

const app = express();

app.use(express.json());

// Enable the FortressJS Unified Middleware
app.use(
  fortress({
    enableLogger: true,
    enableHeaders: true,
    requestLimit: {
      maxBodySize: "1mb"
    },
    rateLimit: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100
    },
    threatDetection: {
      windowMs: 60 * 1000,
      highActivityThreshold: 30,
      bruteForceThreshold: 5,
      payloadAbuseThreshold: 3
    }
  })
);

app.get("/", (req, res) => {
  res.json({ message: "Protected by FortressJS" });
});

export default app;
```

## 5. Run Server

Start your server.

```typescript
// src/server.ts
import app from "./app";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
```

Run it using `ts-node` or compile and run:

```bash
npx ts-node src/server.ts
```

## 6. Verify Security Headers

Make a request to your API to verify that the security headers are being applied correctly.

```bash
curl -I http://localhost:3000/
```

**Expected Output:**

You should see standard security headers injected by FortressJS:
```http
HTTP/1.1 200 OK
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
...
```

## 7. Verify Threat Detection

To see the Threat Intelligence Engine in action, let's simulate a reconnaissance scan by accessing a common vulnerability path.

Make a request to a suspicious path:
```bash
curl http://localhost:3000/wp-admin
```

Check your server console. You should see a high-severity threat alert:
```text
[THREAT] [HIGH] RECONNAISSANCE | IP: ::1 | ID: c8a7e4b2-... | Reconnaissance scan detected on path: /wp-admin
```

## 8. Next Steps

Your API is now protected! To dive deeper:

- Read the [Configuration Guide](./configuration.md) to fine-tune rate limits and thresholds.
- Understand how threats are categorized in the [Threat Detection Guide](./threat-detection.md).
- Scan your codebase with the [Security Audit CLI](./audit-cli.md).
