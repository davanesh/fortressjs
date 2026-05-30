export interface SecurityEvent {
  timestamp: string;
  ip: string;
  method: string;
  path: string;
  statusCode: number;
}

class EventStore {
  private events: SecurityEvent[] = [];
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

  add(event: SecurityEvent): void {
    this.prune();
    this.events.push(event);
  }

  getAll(): SecurityEvent[] {
    this.prune();
    return [...this.events];
  }

  clear(): void {
    this.events = [];
  }

  count(): number {
    this.prune();
    return this.events.length;
  }

  prune(): void {
    const cutoff = Date.now() - this.retentionMs;
    this.events = this.events.filter(
      (event) => new Date(event.timestamp).getTime() >= cutoff
    );
  }

  startPruning(): void {
    if (this.pruneInterval) {
      clearInterval(this.pruneInterval);
    }
    // Prune every 1 minute
    this.pruneInterval = setInterval(() => {
      this.prune();
    }, 60 * 1000);
    // Allow the process to exit even if the timer is still active
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
}

export const eventStore = new EventStore();