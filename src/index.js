"use strict";

require("dotenv").config();
const express = require("express");
const { connectDatabase } = require("./config/database");
const { initializeDemoData } = require("./services/recyclerService");

const webhookRouter = require("./routes/webhook");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json()); // parse JSON bodies

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/webhook", webhookRouter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "EcoDrawer Bot is running 🌱" });
});

// ── 404 catch-all ────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// ── Initialize and start server ──────────────────────────────────────────────
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Initialize demo recycler data
    await initializeDemoData();

    // Start server
    app.listen(PORT, () => {
      console.log(`✅  EcoDrawer bot listening on http://localhost:${PORT}`);
      console.log(`📡  Webhook endpoint: http://localhost:${PORT}/webhook`);
      console.log(`🌱  Database connected and ready`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app; // export for testing
