import express from "express";
import fortress from "../../packages/core/dist/index.js";

const app = express();

import { threatStore } from "../../packages/core/dist/index.js";

// Optional: Subscribe to real-time threat events
threatStore.subscribe((threat) => {
  if (threat.severity === "CRITICAL" || threat.severity === "HIGH") {
    console.log(`\n🚨 [ALERT] ${threat.severity} Threat Detected!`);
    console.log(`Type: ${threat.type}`);
    console.log(`IP: ${threat.ip}`);
    console.log(`Details: ${threat.details}\n`);
  }
});

// Use unified Fortress middleware
app.use(
  fortress({
    enableLogger: true,
    enableHeaders: true,
    requestLimit: {
      maxBodySize: "1mb"
    },
    rateLimit: {
      windowMs: 60000,
      maxRequests: 100
    },
    threatDetection: {
      windowMs: 60000,
      highActivityThreshold: 20,
      bruteForceThreshold: 3,
      payloadAbuseThreshold: 3
    }
  })
);

app.get("/", (_, res) => {
  res.json({
    message: "FortressJS Running"
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});