"use strict";

const Recycler = require("../models/Recycler");
const { DEMO_RECYCLERS } = require("../data/recyclerData");

/**
 * Initialize database with demo recycler data
 */
async function initializeDemoData() {
  const count = await Recycler.countDocuments({ isDemo: true });

  if (count === 0) {
    await Recycler.insertMany(DEMO_RECYCLERS);
    console.log("✅ Demo recycler data initialized");
  }
}

/**
 * Find recyclers by city
 */
async function findRecyclersByCity(city) {
  const cityRegex = new RegExp(city, "i");

  const recyclers = await Recycler.find({
    city: cityRegex,
  })
    .sort({ verified: -1 }) // Verified first
    .limit(5);

  return recyclers;
}

/**
 * Find recyclers by PIN code
 */
async function findRecyclersByPinCode(pinCode) {
  const recyclers = await Recycler.find({
    pinCode: pinCode.toString(),
  })
    .sort({ verified: -1 })
    .limit(5);

  return recyclers;
}

/**
 * Find nearby recyclers (city or PIN)
 */
async function findNearbyRecyclers(location) {
  // Try PIN code first (6 digits)
  if (/^\d{6}$/.test(location)) {
    const recyclers = await findRecyclersByPinCode(location);
    if (recyclers.length > 0) {
      return recyclers;
    }
  }

  // Try city name
  return findRecyclersByCity(location);
}

/**
 * Format recycler information for display
 */
function formatRecyclerInfo(recycler, language = "english") {
  const verifiedBadge = recycler.verified ? "✅ Verified" : "⚠️ Verification pending";

  let info = `*${recycler.name}*\n`;
  info += `${verifiedBadge}\n\n`;
  info += `📍 *Address:*\n${recycler.address}\n`;
  info += `${recycler.city}, ${recycler.state} - ${recycler.pinCode}\n\n`;

  if (recycler.contactNumber) {
    info += `📞 *Contact:* ${recycler.contactNumber}\n`;
  }

  if (recycler.email) {
    info += `📧 *Email:* ${recycler.email}\n`;
  }

  if (recycler.operatingHours) {
    info += `🕒 *Hours:* ${recycler.operatingHours}\n\n`;
  }

  if (recycler.acceptedItems && recycler.acceptedItems.length > 0) {
    info += `📦 *Accepts:* ${recycler.acceptedItems.slice(0, 5).join(", ")}`;
    if (recycler.acceptedItems.length > 5) {
      info += `, and more`;
    }
    info += `\n\n`;
  }

  if (recycler.services && recycler.services.length > 0) {
    info += `✨ *Services:*\n${recycler.services.map((s) => `• ${s}`).join("\n")}\n\n`;
  }

  if (recycler.mapLink) {
    info += `🗺️ *Location:* ${recycler.mapLink}\n`;
  }

  if (recycler.isDemo) {
    info += `\n⚠️ _Note: This is demo data for development purposes._`;
  }

  return info;
}

/**
 * Get recycler search summary
 */
function getSearchSummary(recyclers, location) {
  if (recyclers.length === 0) {
    return `No verified e-waste recyclers found for "${location}".\n\nTips:\n- Try searching by city name (e.g., "Bangalore", "Chennai")\n- Try a different nearby city\n- Contact your local municipal corporation for e-waste collection events`;
  }

  const verifiedCount = recyclers.filter((r) => r.verified).length;

  let summary = `Found ${recyclers.length} e-waste recycler${recyclers.length > 1 ? "s" : ""} near ${location}`;

  if (verifiedCount > 0) {
    summary += ` (${verifiedCount} verified)`;
  }

  summary += `:\n\n`;

  return summary;
}

module.exports = {
  initializeDemoData,
  findRecyclersByCity,
  findRecyclersByPinCode,
  findNearbyRecyclers,
  formatRecyclerInfo,
  getSearchSummary,
};
