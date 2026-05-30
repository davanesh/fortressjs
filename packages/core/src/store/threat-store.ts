import { ThreatEvent } from "../types/threat";
import crypto from "crypto";

export type ThreatListener = (threat: ThreatEvent) => void;

class ThreatStore {
  private threats: ThreatEvent[] = [];
  private listeners: ThreatListener[] = [];
  private retentionMs: number = 5 * 60 * 1000; // default 5 minutes
  private pruneInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startPruning();
  }

  setRetention(ms: number): void {
    this.retentionMs = ms;
    this.prune();
  }

  getRetention(): number {
    return this.retentionMs;
  }

  add(threat: Omit<ThreatEvent, "id"> & { id?: string }): ThreatEvent {
    this.prune();

    const fullThreat: ThreatEvent = {
      ...threat,
      id: threat.id || crypto.randomUUID()
    };

    this.threats.push(fullThreat);
    this.notify(fullThreat);
    return fullThreat;
  }

  getAll(): ThreatEvent[] {
    this.prune();
    return [...this.threats];
  }

  clear(): void {
    this.threats = [];
  }

  count(): number {
    this.prune();
    return this.threats.length;
  }

  subscribe(listener: ThreatListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  prune(): void {
    const cutoff = Date.now() - this.retentionMs;
    this.threats = this.threats.filter(
      (threat) => new Date(threat.timestamp).getTime() >= cutoff
    );
  }

  startPruning(): void {
    if (this.pruneInterval) {
      clearInterval(this.pruneInterval);
    }
    this.pruneInterval = setInterval(() => {
      this.prune();
    }, 60 * 1000);
    
    if (this.pruneInterval.unref) {
      this.pruneInterval.unref();
    }
  }

  stopPruning(): void {
    if (this.pruneInterval) {
      clearInterval(this.pruneInterval);
      this.pruneInterval = null;
    }
  }

  private notify(threat: ThreatEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(threat);
      } catch (err) {
        console.error("Error in threat store listener:", err);
      }
    }
  }
}

export const threatStore = new ThreatStore();
