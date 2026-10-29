"use strict";

const { handleMessage } = require("./ecoDrawerController");

/**
 * POST /webhook
 *
 * Meta sends all events here: messages, delivery receipts, read receipts, etc.
 *
 * We MUST reply with HTTP 200 immediately (before any async work) so Meta
 * doesn't retry the delivery. All heavy processing happens after the response.
 */
async function handleIncoming(req, res) {
  // Acknowledge immediately – Meta retries if it doesn't receive 200 quickly
  res.sendStatus(200);

  try {
    const body = req.body;

    // Validate that this is a WhatsApp Business Account event
    if (body.object !== "whatsapp_business_account") {
      console.log("[WEBHOOK] Ignored – unknown object type:", body.object);
      return;
    }

    // Safely navigate the nested payload
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    // ── Ignore status updates (delivered, read, failed, etc.) ──────────────
    if (value?.statuses?.length) {
      const status = value.statuses[0];
      console.log(`[STATUS] Message ${status.id} → ${status.status}`);
      return;
    }

    // ── Process inbound messages ─────────────────────────────────────────
    const messages = value?.messages;
    if (!messages?.length) {
      console.log("[WEBHOOK] Ignored – no messages array in payload.");
      return;
    }

    const message = messages[0];
    const from = message.from; // sender's WhatsApp phone number (E.164 format)
    const msgId = message.id;
    const msgType = message.type; // "text", "image", "audio", etc.

    console.log(`[MESSAGE] From: ${from} | Type: ${msgType} | ID: ${msgId}`);

    // Extract message text
    let messageText = null;
    if (msgType === "text") {
      messageText = message.text?.body?.trim();
      if (!messageText) {
        console.log("[MESSAGE] Empty text body – skipping.");
        return;
      }
      console.log(`[MESSAGE] Text: "${messageText}"`);
    } else if (msgType === "image") {
      console.log("[MESSAGE] Image received");
    } else {
      console.log(`[MESSAGE] Unsupported message type "${msgType}" – skipping.`);
      return;
    }

    // ── EcoDrawer Bot Logic ───────────────────────────────────────────────
    await handleMessage(from, messageText, msgType, message);

  } catch (err) {
    // Don't crash the process – log and move on
    console.error("[WEBHOOK] Error processing payload:", err.message);
    console.error(err.stack);
  }
}

module.exports = { handleIncoming };
