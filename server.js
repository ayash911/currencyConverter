const express = require("express");
const fs = require("fs");
const path = require("path");
const os = require("os");
const app = express();
const port = 3000;

// Serve static files from the public and image directories
app.use(express.static(path.join(__dirname, "public")));
app.use("/image", express.static(path.join(__dirname, "image")));
app.use(express.json());

// Content Security Policy
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "script-src 'self' 'unsafe-inline'; object-src 'none';"
  );
  next();
});

// Function to log messages to a file
function logToFile(message, ip) {
  const logFilePath = path.join(__dirname, "assets", "log.txt");
  const timestamp = new Date().toISOString();
  const logMessage = `IP: ${ip}, MESSAGE: ${message}, TIME: ${timestamp}${os.EOL}${os.EOL}`;

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error("Error writing to log file", err);
    }
  });
}

// Endpoint to log messages
app.post("/log", (req, res) => {
  const message = req.body.message;
  const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  logToFile(message, ip);
  res.status(200).json({ status: "Log saved successfully" });
});

// Endpoint to serve currencies data
app.get("/assets/currencies", (req, res) => {
  res.sendFile(path.join(__dirname, "assets", "currencies.json"));
});

// Endpoint to serve symbols data
app.get("/assets/symbols", (req, res) => {
  res.sendFile(path.join(__dirname, "assets", "symbols.json"));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
