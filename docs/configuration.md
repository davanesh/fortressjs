# Configuration Reference

FortressJS utilizes a single, flat configuration object. This approach simplifies integration and guarantees that all security modules share the same baseline context.

## Complete Configuration Example

```typescript
import express from "express";
import fortress from "@fortressjs/core";

const app = express();

app.use(
  fortress({
    // Logging & Headers
    enableLogger: true,
    enableHeaders: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline'",

    // Request & Rate Limiting
    requestLimit: {
      maxBodySize: "5mb" // Accepts 'kb', 'mb', or raw bytes
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 500
    },

    // Threat Engine
    threatDetection: {
      windowMs: 60 * 1000, // 1 minute evaluation window
      highActivityThreshold: 50,
      bruteForceThreshold: 5,
      payloadAbuseThreshold: 3
    }
  })
);
```

---

## Configuration Options

### `enableHeaders`
Enables the automatic injection of strict security HTTP headers (e.g., `X-Content-Type-Options`, `X-Frame-Options`).

- **Type**: `boolean`
- **Default**: `true`
- **Security Notes**: Always leave this enabled in production. It mitigates entire classes of client-side vulnerabilities, such as MIME-type sniffing and Clickjacking.

### `contentSecurityPolicy`
Allows overriding the default Content-Security-Policy (CSP) header.

- **Type**: `string`
- **Default**: `"default-src 'self'"`
- **Example**: `"default-src 'self' https://api.stripe.com;"`
- **Security Notes**: CSP is crucial for preventing Cross-Site Scripting (XSS). Ensure you scope your sources tightly.

### `requestLimit`
Configures payload size restrictions.

- **Description**: Prevents Denial of Service (DoS) attacks by rejecting overly large requests before they consume significant server memory.
- **Type**: `boolean | { maxBodySize: string | number }`
- **Default**: `true` (uses default of `"1mb"`)
- **Example**: `{ maxBodySize: "10mb" }`
- **Security Notes**: Keep this value as small as your application realistically allows.

### `rateLimit`
Configures request frequency limits.

- **Description**: Limits the number of requests a single IP address can make within a specified time window.
- **Type**: `boolean | { windowMs: number, maxRequests: number }`
- **Default**: `true` (uses `60000` ms window and `100` max requests)
- **Example**: `{ windowMs: 900000, maxRequests: 300 }`
- **Security Notes**: Crucial for preventing brute-force login attempts and scraping.

### `threatDetection`
Configures the Threat Intelligence Engine thresholds.

- **Description**: Defines the sliding window and thresholds that determine when an IP exhibits malicious behavior.
- **Type**: `boolean | ThreatDetectorOptions`
- **Default**: `true` (uses standard thresholds)
- **Security Notes**: Lower thresholds increase security but may result in false positives for highly active users.

#### `ThreatDetectorOptions` Interface:
```typescript
interface ThreatDetectorOptions {
  windowMs?: number;               // Default: 60000 (1 min)
  highActivityThreshold?: number;  // Default: 20
  bruteForceThreshold?: number;    // Default: 3
  payloadAbuseThreshold?: number;  // Default: 3
}
```

---

## Complete TypeScript Interface Reference

For advanced TypeScript users, here is the underlying configuration interface used by FortressJS:

```typescript
export interface UnifiedFortressOptions {
  /** Enable the security event logger. Default: true */
  enableLogger?: boolean;

  /** Enable security headers middleware. Default: true */
  enableHeaders?: boolean;

  /** Override the default Content-Security-Policy header. */
  contentSecurityPolicy?: string;

  /** Configure payload size limits. Pass false to disable. */
  requestLimit?: boolean | { maxBodySize: string | number };

  /** Configure request rate limits. Pass false to disable. */
  rateLimit?: boolean | { windowMs: number; maxRequests: number };

  /** Configure the Threat Intelligence Engine. Pass false to disable. */
  threatDetection?: boolean | {
    windowMs?: number;
    highActivityThreshold?: number;
    bruteForceThreshold?: number;
    payloadAbuseThreshold?: number;
  };
}
```
