import express from "express";
import fortress from "../../packages/core/src";

const app = express();

app.use(fortress.headers());

app.get("/", (_, res) => {
  res.json({
    message: "FortressJS Running"
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});