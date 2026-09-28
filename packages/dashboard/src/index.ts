import express, {
  Request,
  Response,
  Router
} from "express";

import path from "path";

import {
  observability,
  ThreatType
} from "@fortressjs/core";

export interface DashboardOptions {
  enabled?: boolean;
}

function getThreatTypeCounts() {
  const threats = observability.getThreats();

  const counts: Record<ThreatType, number> = {
    BRUTE_FORCE: 0,
    PAYLOAD_ATTACK: 0,
    RECONNAISSANCE: 0,
    SUSPICIOUS_USER_AGENT: 0,
    HIGH_ACTIVITY: 0
  };

  for (const threat of threats) {
    counts[threat.type]++;
  }

  return counts;
}

export function dashboard(
  options: DashboardOptions = {}
): Router {
  const router = express.Router();

  if (options.enabled === false) {
    return router;
  }

  const publicDir = path.resolve(
    __dirname,
    "../public"
  );

  /*
   * Overview metrics
   */
 router.get(
  "/api/overview",
  (_req: Request, res: Response) => {
    const metrics = observability.getMetrics();

    res.json({
      ...metrics,
      threatTypes: getThreatTypeCounts(),
      retentionMs: observability.getRetention(),
      timestamp: new Date().toISOString()
    });
  }
);

  /*
   * Threat list
   */
  router.get(
    "/api/threats",
    (_req: Request, res: Response) => {
      const threats = observability
        .getThreats()
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() -
            new Date(a.timestamp).getTime()
        );

      res.json({
        threats
      });
    }
  );

  /*
   * Request/event list
   */
  router.get(
    "/api/events",
    (_req: Request, res: Response) => {
      const events = observability
        .getEvents()
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() -
            new Date(a.timestamp).getTime()
        );

      res.json({
        events
      });
    }
  );

  /*
   * Server-Sent Events stream for live threats.
   */
  router.get(
    "/api/threats/stream",
    (req: Request, res: Response) => {
      res.setHeader(
        "Content-Type",
        "text/event-stream"
      );

      res.setHeader(
        "Cache-Control",
        "no-cache"
      );

      res.setHeader(
        "Connection",
        "keep-alive"
      );

      res.flushHeaders();

      const sendEvent = (
        event: string,
        data: unknown
      ) => {
        res.write(
          `event: ${event}\n`
        );

        res.write(
          `data: ${JSON.stringify(data)}\n\n`
        );
      };

      const currentThreats =
        observability.getThreats();

      sendEvent(
        "initial",
        {
          threats: currentThreats
        }
      );

      const unsubscribe =
        observability.subscribeThreats(
          (threat) => {
            sendEvent(
              "threat",
              threat
            );
          }
        );

      /*
       * Keep the connection alive.
       */
      const heartbeat = setInterval(() => {
        res.write(": heartbeat\n\n");
      }, 30000);

      req.on("close", () => {
        clearInterval(heartbeat);
        unsubscribe();
      });
    }
  );

  /*
   * Serve dashboard frontend.
   */
  router.use(
    express.static(publicDir)
  );

  /*
   * Dashboard entry point.
   */
  router.get(
    "/",
    (_req: Request, res: Response) => {
      res.sendFile(
        path.join(
          publicDir,
          "index.html"
        )
      );
    }
  );

  return router;
}

export default dashboard;