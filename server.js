const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Only domains you explicitly allow
const ALLOWED_HOSTS = [
  "example.com"
];

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.svg"));
});

app.get("/proxy", async (req, res) => {
  try {
    if (!req.query.url) {
      return res.status(400).send("Missing URL");
    }

    const target = new URL(req.query.url);

    if (!["http:", "https:"].includes(target.protocol)) {
      return res.status(400).send("Invalid protocol");
    }

    if (!ALLOWED_HOSTS.includes(target.hostname)) {
      return res.status(403).send("Domain not allowed");
    }

    const response = await fetch(target);

    res.status(response.status);

    const type = response.headers.get("content-type");
    if (type) {
      res.setHeader("content-type", type);
    }

    res.send(Buffer.from(await response.arrayBuffer()));
  } catch {
    res.status(500).send("Proxy request failed");
  }
});

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
