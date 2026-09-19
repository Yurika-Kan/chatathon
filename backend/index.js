const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

exports.api = onRequest(app);
