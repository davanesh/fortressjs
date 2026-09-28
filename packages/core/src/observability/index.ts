import { eventStore } from "../store/event-store";
import {
  threatStore,
  ThreatListener
} from "../store/threat-store";

import {
  SecurityEvent
} from "../store/event-store";

import {
  ThreatEvent,
  ThreatSeverity,
  ThreatType
} from "../types/threat";

export interface ObservabilityMetrics {
  requests: number;
  threats: number;
  criticalThreats: number;
  highThreats: number;
  mediumThreats: number;
  lowThreats: number;
  uniqueIPs: number;
}

export interface ObservabilityAPI {
  getEvents(): SecurityEvent[];
  getThreats(): ThreatEvent[];
  getMetrics(): ObservabilityMetrics;
  getRetention(): number;
  subscribeThreats(listener: ThreatListener): () => void;
}

function countSeverity(
  threats: ThreatEvent[],
  severity: ThreatSeverity
): number {
  return threats.filter(
    (threat) => threat.severity === severity
  ).length;
}

function getMetrics(): ObservabilityMetrics {
  const events = eventStore.getAll();
  const threats = threatStore.getAll();

  const uniqueIPs = new Set(
    events.map((event) => event.ip)
  ).size;

  return {
    requests: events.length,
    threats: threats.length,

    criticalThreats: countSeverity(threats, "CRITICAL"),
    highThreats: countSeverity(threats, "HIGH"),
    mediumThreats: countSeverity(threats, "MEDIUM"),
    lowThreats: countSeverity(threats, "LOW"),

    uniqueIPs
  };
}

export const observability: ObservabilityAPI = {
  getEvents: () => eventStore.getAll(),

  getThreats: () => threatStore.getAll(),

  getMetrics,

  getRetention: () => eventStore.getRetention(),

  subscribeThreats: (listener) =>
    threatStore.subscribe(listener)
};