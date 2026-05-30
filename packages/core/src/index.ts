import {
  headers,
  requestLimit,
  rateLimit,
  logger,
  threatDetector
} from "./middleware";

const fortress = {
  headers,
  requestLimit,
  rateLimit,
  logger,
  threatDetector
};

export default fortress;

export {
  headers,
  requestLimit,
  rateLimit,
  logger,
  threatDetector
};