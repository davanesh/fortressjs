export type ThreatType =
  | "BRUTE_FORCE"
  | "PAYLOAD_ATTACK"
  | "RECONNAISSANCE"
  | "SUSPICIOUS_USER_AGENT"
  | "HIGH_ACTIVITY";

export type ThreatSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface ThreatEvent {
  id: string;
  type: ThreatType;
  ip: string;
  timestamp: string;
  details: string;
  severity: ThreatSeverity;
}

export interface ThreatDetectorOptions {
  windowMs?: number;
  highActivityThreshold?: number;
  bruteForceThreshold?: number;
  payloadAbuseThreshold?: number;
}