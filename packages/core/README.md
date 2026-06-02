# @fortressjs/core

Security middleware and threat detection platform for Express APIs.

FortressJS helps protect Express applications with security headers, rate limiting, request validation, threat detection, and security auditing.

## Features

* Security Headers
* Request Size Limiting
* Rate Limiting
* Threat Detection Engine
* Event Store
* Threat Store
* Unified Configuration API

## Installation

```bash
npm install @fortressjs/core
```

## Quick Start

```typescript
import express from "express";
import fortress from "@fortressjs/core";

const app = express();

app.use(express.json());

app.use(
  fortress({
    enableHeaders: true,
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

app.get("/", (_, res) => {
  res.json({
    message: "Protected by FortressJS"
  });
});

app.listen(3000);
```

## Threat Monitoring

```typescript
import { threatStore } from "@fortressjs/core";

threatStore.subscribe((threat) => {
  console.log(threat);
});
```

## Documentation

Full documentation and examples:

https://github.com/davanesh/fortressjs

## License

MIT
