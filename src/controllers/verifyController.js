"use strict";

/**
 * GET /webhook
 *
 * Meta sends a GET request to verify the webhook when you configure it in the
 * Developer Portal. We must echo back `hub.challenge` when `hub.verify_token`
 * matches our secret.
 *
 * Query params sent by Meta:
 *   hub.mode         – should be "subscribe"
 *   hub.verify_token – the secret you set in the Developer Portal
 *   hub.challenge    – a random string Meta expects echoed back
 */
function handleVerification(req, res) {
  const mode      = req.query["hub.mode"];
  const token     = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    console.log("✅  Webhook verified successfully.");
    return res.status(200).send(challenge); // MUST be plain-text, not JSON
  }

  console.warn("⚠️   Webhook verification failed. Check VERIFY_TOKEN.");
  return res.status(403).json({ error: "Forbidden – verify token mismatch" });
}

module.exports = { handleVerification };
