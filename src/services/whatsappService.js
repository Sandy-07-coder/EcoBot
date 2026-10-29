"use strict";

const axios = require("axios");

const GRAPH_API_VERSION = "v21.0";
const BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/**
 * Returns pre-configured Axios instance for the Meta Graph API.
 * Lazily created so env vars are available after dotenv.config().
 */
function getApiClient() {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
    },
    timeout: 10_000, // 10 s
  });
}

/**
 * Send a plain-text WhatsApp message to a recipient.
 *
 * @param {string} to      – Recipient's phone number in E.164 format (e.g. "15551234567")
 * @param {string} text    – Message body text (max 4096 characters)
 * @returns {Promise<object>} – Meta API response data
 *
 * @throws Will throw if the API returns a non-2xx status.
 */
async function sendTextMessage(to, text) {
  const phoneNumberId = process.env.PHONE_NUMBER_ID;

  if (!phoneNumberId) {
    throw new Error("PHONE_NUMBER_ID is not set in environment variables.");
  }

  if (!process.env.WHATSAPP_TOKEN) {
    throw new Error("WHATSAPP_TOKEN is not set in environment variables.");
  }

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: {
      preview_url: false,
      body: text,
    },
  };

  try {
    const client = getApiClient();
    const response = await client.post(
      `/${phoneNumberId}/messages`,
      payload
    );

    console.log(`[SEND] ✅ Message sent to ${to} | message_id: ${response.data?.messages?.[0]?.id}`);
    return response.data;
  } catch (err) {
    // Surface the Meta API error details if available
    const apiError = err.response?.data?.error;
    if (apiError) {
      console.error(
        `[SEND] ❌ Meta API error ${apiError.code}: ${apiError.message}`
      );
      throw new Error(`Meta API error ${apiError.code}: ${apiError.message}`);
    }
    console.error("[SEND] ❌ Network/request error:", err.message);
    throw err;
  }
}

/**
 * Send a WhatsApp template message.
 * Useful for initiating conversations outside the 24-hour messaging window.
 *
 * @param {string} to           – Recipient's phone number in E.164 format
 * @param {string} templateName – Approved template name
 * @param {string} languageCode – Template language code (e.g. "en_US")
 * @param {Array}  components   – Template component parameters (optional)
 * @returns {Promise<object>}
 */
async function sendTemplateMessage(to, templateName, languageCode = "en_US", components = []) {
  const phoneNumberId = process.env.PHONE_NUMBER_ID;

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      ...(components.length ? { components } : {}),
    },
  };

  try {
    const client = getApiClient();
    const response = await client.post(`/${phoneNumberId}/messages`, payload);

    console.log(`[SEND] ✅ Template "${templateName}" sent to ${to}`);
    return response.data;
  } catch (err) {
    const apiError = err.response?.data?.error;
    if (apiError) {
      throw new Error(`Meta API error ${apiError.code}: ${apiError.message}`);
    }
    throw err;
  }
}

/**
 * Retrieve media URL from WhatsApp
 *
 * @param {string} mediaId - Media ID from the webhook
 * @returns {Promise<string>} - URL to download the media
 */
async function getMediaUrl(mediaId) {
  if (!process.env.WHATSAPP_TOKEN) {
    throw new Error("WHATSAPP_TOKEN is not set in environment variables.");
  }

  try {
    const client = getApiClient();
    const response = await client.get(`/${mediaId}`);

    return response.data?.url;
  } catch (err) {
    const apiError = err.response?.data?.error;
    if (apiError) {
      throw new Error(`Meta API error ${apiError.code}: ${apiError.message}`);
    }
    throw err;
  }
}

/**
 * Download media file from WhatsApp
 *
 * @param {string} mediaUrl - URL returned from getMediaUrl
 * @returns {Promise<Buffer>} - Media file data
 */
async function downloadMedia(mediaUrl) {
  if (!process.env.WHATSAPP_TOKEN) {
    throw new Error("WHATSAPP_TOKEN is not set in environment variables.");
  }

  try {
    const response = await axios.get(mediaUrl, {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      },
      responseType: "arraybuffer",
      timeout: 30000,
    });

    return Buffer.from(response.data);
  } catch (err) {
    console.error("[DOWNLOAD] ❌ Failed to download media:", err.message);
    throw err;
  }
}

module.exports = {
  sendTextMessage,
  sendTemplateMessage,
  getMediaUrl,
  downloadMedia
};
