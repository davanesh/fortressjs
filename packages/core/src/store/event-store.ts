export interface SecurityEvent {
  timestamp: string;
  ip: string;
  method: string;
  path: string;
  statusCode: number;
}

export const eventStore: SecurityEvent[] = [];