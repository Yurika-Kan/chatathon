const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");
const { runEndpoint } = require("./monid");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/monid/competitors", async (req, res) => {
  const { domain, country = "us" } = req.body;
  if (!domain) return res.status(400).json({ error: "domain is required" });

  try {
    const today = new Date().toISOString().split("T")[0];
    const result = await runEndpoint(
      "ahrefs",
      "/site-explorer/organic-competitors",
      {
        query: {
          target: domain,
          date: today,
          country,
          limit: 5,
          order_by: "keywords_common:desc",
        },
      }
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

exports.api = onRequest(app);
