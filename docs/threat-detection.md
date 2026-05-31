# Threat Detection Engine

The defining feature of FortressJS is its real-time Threat Intelligence Engine. Unlike simple firewalls that only look at static signatures, FortressJS analyzes the *behavior* of requests over a sliding time window.

When malicious behavior is detected, FortressJS creates a `ThreatEvent` and evaluates if the attacker should be escalated.

---

## Threat Categories

FortressJS categorizes anomalous traffic into five distinct threat types.

### 1. RECONNAISSANCE

- **What it is**: Attackers often run automated scripts to scan for known vulnerable files, endpoints, or hidden admin panels.
- **Detection Logic**: Scans the requested URL path against a known dictionary of suspicious targets.
- **Severity**: `HIGH`
- **Example Requests**: 
  - `GET /wp-admin/setup.php`
  - `GET /.env`
  - `GET /phpmyadmin`

### 2. SUSPICIOUS_USER_AGENT

- **What it is**: Many automated attack tools announce themselves via their `User-Agent` HTTP header.
- **Detection Logic**: Inspects the User-Agent string against a database of known security, scanning, and attack tools.
- **Severity**: `MEDIUM`
- **Example Tools Detected**:
  - `sqlmap` (SQL Injection tool)
  - `nmap` (Network scanner)
  - `nikto` (Web server scanner)
  - `python-requests` (Often used in raw scrape scripts without spoofing)

### 3. BRUTE_FORCE

- **What it is**: An attempt to guess passwords or access tokens by rapidly submitting requests.
- **Detection Logic**: Monitors the event store for repeated HTTP `429 Too Many Requests` responses from the rate limiter. If an IP repeatedly hits the rate limit wall within the window, it's classified as a brute force attack.
- **Severity**: `HIGH`

### 4. PAYLOAD_ATTACK

- **What it is**: An attempt to crash the server or exhaust memory by sending massive request bodies (e.g., Buffer Overflow DoS).
- **Detection Logic**: Monitors the event store for repeated HTTP `413 Payload Too Large` responses.
- **Severity**: `HIGH`

### 5. HIGH_ACTIVITY

- **What it is**: General traffic anomaly detection. A single IP making an unusually large number of requests across various endpoints.
- **Detection Logic**: Counts total successful and unsuccessful requests within the sliding window. If the volume exceeds the `highActivityThreshold`, it is flagged.
- **Severity**: `MEDIUM`

---

## Threat Escalation Model

### CRITICAL Severity

FortressJS employs a smart escalation model. A single threat might be an isolated incident or a false positive. However, persistent, multi-vector attacks indicate a serious breach attempt.

**The Rule:** If a single IP address triggers *multiple distinct threats* within the sliding window, FortressJS automatically upgrades the severity of the subsequent threat to `CRITICAL`.

**Example Scenario:**
1. Attacker sends a massive payload trying to cause a DoS.
   * *Result*: Threat created: `PAYLOAD_ATTACK` (Severity: `HIGH`).
2. Two seconds later, the same attacker attempts to hit `/wp-admin`.
   * *Result*: Threat created: `RECONNAISSANCE` (Severity: `CRITICAL`).

### Hooking into Threats

You can listen for these events programmatically to drive your own alerting systems:

```typescript
import { threatStore } from "@fortressjs/core";

threatStore.subscribe((threat) => {
  if (threat.severity === "CRITICAL") {
    // Send a Slack webhook or trigger a PagerDuty incident
    sendSlackAlert(`CRITICAL Threat from ${threat.ip}: ${threat.details}`);
  }
});
```
