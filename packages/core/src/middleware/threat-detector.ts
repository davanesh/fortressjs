import { Request, Response, NextFunction } from "express";
import { eventStore } from "../store/event-store";
import { threatStore } from "../store/threat-store";
import { SUSPICIOUS_PATHS } from "../constants/suspicious-paths";
import { SUSPICIOUS_AGENTS } from "../constants/suspicious-agents";
import { ThreatDetectorOptions, ThreatSeverity, ThreatType } from "../types/threat";

// Deduplication map to avoid spamming the same threat type for an IP
const lastThreatTimes = new Map<string, number>();

/** Reset internal deduplication state. Useful for testing. */
export const resetThreatDetector = (): void => {
  lastThreatTimes.clear();
};

export const threatDetector = (options: ThreatDetectorOptions = {}) => {
  const windowMs = options.windowMs || 60 * 1000; // default 60s
  const highActivityThreshold = options.highActivityThreshold || 20;
  const bruteForceThreshold = options.bruteForceThreshold || 3;
  const payloadAbuseThreshold = options.payloadAbuseThreshold || 3;

  return (req: Request, res: Response, next: NextFunction) => {
    res.on("finish", () => {
      const ip =
        req.ip ||
        req.socket.remoteAddress ||
        "unknown";

      const nowMs = Date.now();
      const cutoff = nowMs - windowMs;

      // 1. Reconnaissance Detection
      const path = req.path || req.originalUrl.split("?")[0] || "";
      const isReconPath = SUSPICIOUS_PATHS.some(
        (p) => path === p || path.startsWith(p + "/")
      );

      if (isReconPath) {
        triggerThreat(ip, "RECONNAISSANCE", "HIGH", `Reconnaissance scan detected on path: ${path}`);
      }

      // 2. Suspicious User Agent Detection
      const userAgent = req.headers["user-agent"] || "";
      const isSuspiciousAgent = SUSPICIOUS_AGENTS.some((agent) =>
        userAgent.toLowerCase().includes(agent.toLowerCase())
      );

      if (isSuspiciousAgent) {
        triggerThreat(
          ip,
          "SUSPICIOUS_USER_AGENT",
          "MEDIUM",
          `Suspicious User-Agent detected: ${userAgent}`
        );
      }

      // Fetch all recent events from this IP to analyze abuse thresholds
      const recentEvents = eventStore
        .getAll()
        .filter((event) => event.ip === ip && new Date(event.timestamp).getTime() >= cutoff);

      // 3. Payload Abuse Detection
      const payloadViolations = recentEvents.filter((event) => event.statusCode === 413).length;
      if (payloadViolations >= payloadAbuseThreshold) {
        triggerThreat(
          ip,
          "PAYLOAD_ATTACK",
          "HIGH",
          `Repeated payload size violations: ${payloadViolations} in ${windowMs / 1000}s`
        );
      }

      // 4. Brute Force Detection
      const rateLimitViolations = recentEvents.filter((event) => event.statusCode === 429).length;
      if (rateLimitViolations >= bruteForceThreshold) {
        triggerThreat(
          ip,
          "BRUTE_FORCE",
          "HIGH",
          `Repeated rate limit violations: ${rateLimitViolations} in ${windowMs / 1000}s`
        );
      }

      // 5. High Activity Detection
      if (recentEvents.length >= highActivityThreshold) {
        triggerThreat(
          ip,
          "HIGH_ACTIVITY",
          "MEDIUM",
          `High request volume detected: ${recentEvents.length} requests in ${windowMs / 1000}s`
        );
      }
    });

    next();
  };

  // Helper to deduplicate, escalate, and record threat events
  function triggerThreat(
    ip: string,
    type: ThreatType,
    defaultSeverity: ThreatSeverity,
    details: string
  ) {
    const now = Date.now();
    const dedupKey = `${ip}:${type}:${details}`;
    const lastTriggered = lastThreatTimes.get(dedupKey) || 0;

    // Deduplicate same threat within 5 seconds to prevent event flooding
    if (now - lastTriggered < 5000) {
      return;
    }

    lastThreatTimes.set(dedupKey, now);

    // CRITICAL Escalation Check:
    // If this IP already has multiple threat events registered within the sliding window,
    // elevate this threat severity to CRITICAL.
    let severity: ThreatSeverity = defaultSeverity;
    const cutoff = now - windowMs;
    const recentThreatsFromIP = threatStore
      .getAll()
      .filter((t) => t.ip === ip && new Date(t.timestamp).getTime() >= cutoff);

    // If they have 2 or more recent threats, escalate high/medium threats to CRITICAL
    if (recentThreatsFromIP.length >= 2) {
      severity = "CRITICAL";
    }

    const threat = threatStore.add({
      type,
      ip,
      timestamp: new Date().toISOString(),
      details,
      severity
    });

    console.warn(
      `[THREAT] [${threat.severity}] ${threat.type} | IP: ${threat.ip} | ID: ${threat.id} | ${threat.details}`
    );
  }
};