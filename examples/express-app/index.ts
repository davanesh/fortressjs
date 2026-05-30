import express from "express";
import fortress from "../../packages/core/dist/index.js";

const app = express();

app.use(fortress.logger());

app.use(fortress.headers());

app.use(
  fortress.requestLimit({
    maxBodySize: "1mb"
  })
);

app.use(
  fortress.threatDetector()
);

app.use(
  fortress.rateLimit({
    windowMs: 60000,
    maxRequests: 1
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