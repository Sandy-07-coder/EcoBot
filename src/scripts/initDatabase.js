"use strict";

/**
 * Database initialization script
 * Run this to populate the database with demo recycler data
 */

require("dotenv").config();
const { connectDatabase } = require("../config/database");
const { initializeDemoData } = require("../services/recyclerService");

async function init() {
  try {
    console.log("🔄 Connecting to database...");
    await connectDatabase();

    console.log("🔄 Initializing demo recycler data...");
    await initializeDemoData();

    console.log("✅ Database initialization complete!");
    console.log("\nDemo data includes:");
    console.log("  - 6 sample e-waste recycling centers");
    console.log("  - Locations: Bangalore, Chennai, Hyderabad, Delhi, Mumbai, Roorkee");
    console.log("\nNote: Replace with verified real data before production!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Initialization failed:", error.message);
    process.exit(1);
  }
}

init();
