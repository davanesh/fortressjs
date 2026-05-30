import {
  headers,
  requestLimit,
  rateLimit,
  logger
} from "./middleware";

const fortress = {
  headers,
  requestLimit,
  rateLimit,
  logger
};

export default fortress;

export {
  headers,
  requestLimit,
  rateLimit,
  logger
};