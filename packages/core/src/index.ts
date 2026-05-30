import {
  headers,
  requestLimit,
  rateLimit,
  logger,
  threatDetector,
  resetThreatDetector,
  fortress as unifiedFortress,
  UnifiedFortressOptions
} from "./middleware";

import { eventStore as rawEventStore, threatStore as rawThreatStore } from "./store";

// Cast to any to bypass declaration emit issues with private class fields
const eventStore = rawEventStore as any;
const threatStore = rawThreatStore as any;

const fortress = Object.assign(unifiedFortress, {
  headers,
  requestLimit,
  rateLimit,
  logger,
  threatDetector,
  eventStore,
  threatStore
});

export default fortress;

export {
  headers,
  requestLimit,
  rateLimit,
  logger,
  threatDetector,
  resetThreatDetector,
  eventStore,
  threatStore,
  UnifiedFortressOptions
};
export * from "./types";