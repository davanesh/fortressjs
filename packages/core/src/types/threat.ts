export type ThreatType =
  | "BRUTE_FORCE"
  | "PAYLOAD_ATTACK"
  | "RECONNAISSANCE";

export interface ThreatEvent {
  type: ThreatType;
  ip: string;
  timestamp: string;
  details: string;
}