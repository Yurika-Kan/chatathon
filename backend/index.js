const { onRequest } = require("firebase-functions/v2/https");

exports.helloWorld = onRequest((req, res) => {
  res.json({ message: "Hello from Chatathon 2026 backend!" });
});
