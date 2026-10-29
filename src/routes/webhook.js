"use strict";

const express = require("express");
const router = express.Router();

const { handleVerification } = require("../controllers/verifyController");
const { handleIncoming } = require("../controllers/messageController");

/**
 * GET /webhook
 * Webhook verification challenge from Meta Developer Portal.
 */
router.get("/", handleVerification);

/**
 * POST /webhook
 * Receives all incoming WhatsApp events (messages, statuses, etc.).
 */
router.post("/", handleIncoming);

module.exports = router;
